import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import { execFile } from 'child_process';
import { ConfigService } from '@nestjs/config';
import { createHash, randomUUID } from 'crypto';
import { promises as fs } from 'fs';
import { basename, extname, join, resolve, sep } from 'path';
import { tmpdir } from 'os';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);

const MIME_EXTENSIONS: Record<string, string[]> = {
  'application/pdf': ['.pdf'],
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/webp': ['.webp'],
  'text/plain': ['.txt'],
  'text/csv': ['.csv'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'application/msword': ['.doc'],
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
  'application/vnd.ms-excel': ['.xls'],
};

@Injectable()
export class DocumentStorageService {
  private readonly rootDirectory: string;
  private readonly maximumSize: number;
  private readonly antivirusCommand: string | null;
  private readonly antivirusRequired: boolean;
  private readonly antivirusTimeoutMs: number;

  constructor(private readonly configService: ConfigService) {
    const configuredDirectory = this.configService.get<string>('DOCUMENTS_STORAGE_DIR');
    const isTest = this.configService.get<string>('NODE_ENV') === 'test';
    this.rootDirectory = resolve(
      configuredDirectory || (isTest ? join(tmpdir(), 'consulta-medica-test-uploads') : join(process.cwd(), 'uploads', 'documentos')),
    );
    const configuredSize = Number(this.configService.get<string>('DOCUMENTS_MAX_UPLOAD_BYTES', String(10 * 1024 * 1024)));
    this.maximumSize = Number.isFinite(configuredSize) && configuredSize > 0 ? configuredSize : 10 * 1024 * 1024;
    this.antivirusCommand = this.configService.get<string>('DOCUMENTS_ANTIVIRUS_COMMAND')?.trim() || null;
    this.antivirusRequired = this.configService.get<string>('DOCUMENTS_ANTIVIRUS_REQUIRED') === 'true'
      || this.configService.get<string>('NODE_ENV') === 'production';
    const configuredTimeout = Number(this.configService.get<string>('DOCUMENTS_ANTIVIRUS_TIMEOUT_MS', '30000'));
    this.antivirusTimeoutMs = Number.isFinite(configuredTimeout) && configuredTimeout >= 1_000
      ? configuredTimeout
      : 30_000;
  }

  maxUploadBytes(): number {
    return this.maximumSize;
  }

  async store(file: Express.Multer.File): Promise<{ storageKey: string; mimeType: string; sizeBytes: number; checksum: string; originalName: string }> {
    this.validate(file);
    const extension = extname(file.originalname).toLowerCase();
    const now = new Date();
    const storageKey = join(
      String(now.getUTCFullYear()),
      String(now.getUTCMonth() + 1).padStart(2, '0'),
      randomUUID() + extension,
    ).replace(/\\/g, '/');
    const target = this.resolveStorageKey(storageKey);

    await fs.mkdir(resolve(target, '..'), { recursive: true });
    try {
      await fs.writeFile(target, file.buffer, { mode: 0o600, flag: 'wx' });
    } catch (error) {
      throw new InternalServerErrorException('No se pudo almacenar el archivo de forma segura');
    }

    return {
      storageKey,
      mimeType: file.mimetype,
      sizeBytes: file.size,
      checksum: createHash('sha256').update(file.buffer).digest('hex'),
      originalName: this.safeDisplayName(file.originalname),
    };
  }

  async read(storageKey: string | null): Promise<Buffer> {
    if (!storageKey) {
      throw new NotFoundException('El contenido del archivo no está disponible para este registro');
    }
    try {
      return await fs.readFile(this.resolveStorageKey(storageKey));
    } catch (error) {
      throw new NotFoundException('El contenido del archivo no está disponible');
    }
  }

  async remove(storageKey: string): Promise<void> {
    try {
      await fs.unlink(this.resolveStorageKey(storageKey));
    } catch {
      // El archivo puede no haberse creado si la escritura falló antes.
    }
  }

  async scan(storageKey: string): Promise<{ status: 'limpio' | 'no_configurado'; scannedAt: Date | null }> {
    if (!this.antivirusCommand) {
      if (this.antivirusRequired) {
        throw new ServiceUnavailableException('El análisis antivirus es obligatorio y no está configurado');
      }
      return { status: 'no_configurado', scannedAt: null };
    }

    try {
      await execFileAsync(this.antivirusCommand, [this.resolveStorageKey(storageKey)], {
        timeout: this.antivirusTimeoutMs,
        windowsHide: true,
      });
      return { status: 'limpio', scannedAt: new Date() };
    } catch (error) {
      const code = (error as { code?: string | number }).code;
      if (code === 1) {
        throw new BadRequestException('El archivo fue rechazado por el análisis antivirus');
      }
      throw new ServiceUnavailableException('No se pudo completar el análisis antivirus');
    }
  }

  requiresAntivirus(): boolean {
    return this.antivirusRequired;
  }

  checksum(content: Buffer): string {
    return createHash('sha256').update(content).digest('hex');
  }

  private validate(file: Express.Multer.File): void {
    if (!file?.buffer?.length) throw new BadRequestException('Debe adjuntar un archivo válido');
    if (file.size > this.maximumSize) {
      throw new BadRequestException('El archivo supera el tamaño máximo permitido de ' + this.maximumSize + ' bytes');
    }

    const extension = extname(file.originalname).toLowerCase();
    const allowedExtensions = MIME_EXTENSIONS[file.mimetype];
    if (!allowedExtensions || !allowedExtensions.includes(extension)) {
      throw new BadRequestException('El tipo de archivo no está permitido');
    }
    if (!this.hasExpectedSignature(file)) {
      throw new BadRequestException('El contenido no coincide con el tipo de archivo declarado');
    }
  }

  private hasExpectedSignature(file: Express.Multer.File): boolean {
    const buffer = file.buffer;
    if (file.mimetype === 'application/pdf') return buffer.subarray(0, 5).toString('ascii') === '%PDF-';
    if (file.mimetype === 'image/png') return buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
    if (file.mimetype === 'image/jpeg') return buffer.length > 2 && buffer[0] === 255 && buffer[1] === 216 && buffer[2] === 255;
    if (file.mimetype === 'image/webp') return buffer.subarray(0, 4).toString('ascii') === 'RIFF' && buffer.subarray(8, 12).toString('ascii') === 'WEBP';
    return true;
  }

  private safeDisplayName(value: string): string {
    return basename(value).replace(/[<>:"/\\|?*\u0000-\u001f]/g, '_').slice(0, 180) || 'archivo';
  }

  private resolveStorageKey(storageKey: string): string {
    const target = resolve(this.rootDirectory, storageKey);
    if (target !== this.rootDirectory && !target.startsWith(this.rootDirectory + sep)) {
      throw new BadRequestException('La ruta del archivo no es válida');
    }
    return target;
  }
}
