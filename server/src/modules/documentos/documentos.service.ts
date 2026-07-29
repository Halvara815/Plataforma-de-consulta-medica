import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Paciente } from '../pacientes/entities/paciente.entity';
import { AuditService } from '../auth/audit.service';
import { CreateDocumentoDto } from './dto/create-documento.dto';
import { DocumentDownloadTokenService } from './document-download-token.service';
import { UpdateDocumentoDto } from './dto/update-documento.dto';
import { DocumentStorageService } from './document-storage.service';
import { Documento } from './entities/documento.entity';

export type DocumentoResponse = {
  id: string;
  pacienteId: string;
  tipo: string;
  categoria: string;
  nombre: string;
  fecha: Date;
  fuente: string | null;
  modalidad: string | null;
  tecnico: string | null;
  tags: string[] | null;
  descripcion: string | null;
  tamano: string | null;
  mimeType: string | null;
  sizeBytes: number | null;
  scanStatus: string | null;
  scannedAt: Date | null;
  estado: string;
  createdAt: Date;
  updatedAt: Date;
};

@Injectable()
export class DocumentosService {
  constructor(
    @InjectRepository(Documento)
    private readonly documentosRepository: Repository<Documento>,
    @InjectRepository(Paciente)
    private readonly pacientesRepository: Repository<Paciente>,
    private readonly documentStorage: DocumentStorageService,
    private readonly downloadTokens: DocumentDownloadTokenService,
    private readonly auditService: AuditService,
  ) {}

  maxUploadBytes(): number {
    return this.documentStorage.maxUploadBytes();
  }

  async create(dto: CreateDocumentoDto, file: Express.Multer.File): Promise<DocumentoResponse> {
    const paciente = await this.pacientesRepository.findOneBy({ id: dto.pacienteId });
    if (!paciente || paciente.estado !== 'activo') {
      throw new BadRequestException('El paciente no existe o no está activo');
    }

    const stored = await this.documentStorage.store(file);
    try {
      const scan = await this.documentStorage.scan(stored.storageKey);
      const documento = await this.documentosRepository.save(this.documentosRepository.create({
        pacienteId: paciente.id,
        tipo: stored.mimeType.startsWith('image/') ? 'imagen' : 'documento',
        categoria: dto.categoria.trim(),
        nombre: stored.originalName,
        fecha: dto.fecha ? new Date(dto.fecha) : new Date(),
        fuente: 'Carga clínica local',
        modalidad: dto.modalidad?.trim() || null,
        tecnico: dto.tecnico?.trim() || null,
        tags: this.cleanTags(dto.tags),
        descripcion: dto.descripcion?.trim() || null,
        tamano: this.formatFileSize(stored.sizeBytes),
        storageKey: stored.storageKey,
        mimeType: stored.mimeType,
        sizeBytes: stored.sizeBytes,
        checksum: stored.checksum,
        scanStatus: scan.status,
        scannedAt: scan.scannedAt,
        estado: 'activo',
        deletedAt: null,
      }));
      return this.serialize(documento);
    } catch (error) {
      await this.documentStorage.remove(stored.storageKey);
      throw error;
    }
  }

  async findAllByPaciente(
    pacienteId: string,
    estado: 'activo' | 'eliminado' = 'activo',
  ): Promise<DocumentoResponse[]> {
    const paciente = await this.pacientesRepository.findOneBy({ id: pacienteId });
    if (!paciente) throw new NotFoundException('Paciente no encontrado');

    const documentos = await this.documentosRepository.find({
      where: { pacienteId, estado },
      order: { fecha: 'DESC' },
    });
    return documentos.map((documento) => this.serialize(documento));
  }

  async findOne(id: string): Promise<DocumentoResponse> {
    return this.serialize(await this.findEntity(id));
  }

  async download(id: string, auditUserId?: string): Promise<{ documento: DocumentoResponse; content: Buffer }> {
    const documento = await this.findEntity(id, true);
    if (this.documentStorage.requiresAntivirus() && documento.scanStatus !== 'limpio') {
      throw new BadRequestException('El documento no cuenta con un análisis antivirus aprobado');
    }
    const content = await this.documentStorage.read(documento.storageKey);
    if (documento.checksum && this.documentStorage.checksum(content) !== documento.checksum) {
      throw new NotFoundException('El archivo no superó la verificación de integridad');
    }
    if (auditUserId) {
      await this.auditService.record({
        usuarioId: auditUserId,
        accion: 'documentos.download',
        recursoTipo: 'documentos',
        recursoId: documento.id,
        resultado: 'exitoso',
        metadata: { origen: 'sesion_autenticada' },
      });
    }
    return { documento: this.serialize(documento), content };
  }

  async createSignedDownloadLink(id: string, usuarioId: string): Promise<{ token: string; expiresAt: Date }> {
    await this.findEntity(id);
    return this.downloadTokens.create(id, usuarioId);
  }

  async downloadWithSignedToken(token: string | undefined): Promise<{ documento: DocumentoResponse; content: Buffer }> {
    const ticket = this.downloadTokens.verify(token);
    const result = await this.download(ticket.documentoId);
    await this.auditService.record({
      usuarioId: ticket.usuarioId,
      accion: 'documentos.signed_download',
      recursoTipo: 'documentos',
      recursoId: ticket.documentoId,
      resultado: 'exitoso',
      metadata: { origen: 'enlace_firmado' },
    });
    return result;
  }

  async update(id: string, dto: UpdateDocumentoDto): Promise<DocumentoResponse> {
    const documento = await this.findEntity(id);
    if (dto.nombre !== undefined) documento.nombre = this.cleanName(dto.nombre);
    if (dto.categoria !== undefined) documento.categoria = dto.categoria.trim();
    if (dto.modalidad !== undefined) documento.modalidad = dto.modalidad.trim() || null;
    if (dto.tecnico !== undefined) documento.tecnico = dto.tecnico.trim() || null;
    if (dto.tags !== undefined) documento.tags = this.cleanTags(dto.tags);
    if (dto.descripcion !== undefined) documento.descripcion = dto.descripcion.trim() || null;
    return this.serialize(await this.documentosRepository.save(documento));
  }

  async remove(id: string, usuarioId: string): Promise<void> {
    const documento = await this.findEntity(id);
    documento.estado = 'eliminado';
    documento.deletedAt = new Date();
    documento.deletedBy = usuarioId;
    await this.documentosRepository.save(documento);
  }

  async restore(id: string): Promise<DocumentoResponse> {
    const documento = await this.findEntity(id, false, true);
    if (documento.estado !== 'eliminado') {
      throw new BadRequestException('El documento ya está activo');
    }
    documento.estado = 'activo';
    documento.deletedAt = null;
    documento.deletedBy = null;
    return this.serialize(await this.documentosRepository.save(documento));
  }

  private async findEntity(id: string, includeStorageKey = false, includeDeleted = false): Promise<Documento> {
    const query = this.documentosRepository
      .createQueryBuilder('documento')
      .where('documento.id = :id', { id });
    if (!includeDeleted) query.andWhere('documento.estado = :estado', { estado: 'activo' });
    if (includeStorageKey) query.addSelect(['documento.storageKey', 'documento.checksum']);
    const documento = await query.getOne();
    if (!documento) throw new NotFoundException('Documento no encontrado');
    return documento;
  }

  private serialize(documento: Documento): DocumentoResponse {
    return {
      id: documento.id,
      pacienteId: documento.pacienteId,
      tipo: documento.tipo,
      categoria: documento.categoria,
      nombre: documento.nombre,
      fecha: documento.fecha,
      fuente: documento.fuente,
      modalidad: documento.modalidad,
      tecnico: documento.tecnico,
      tags: documento.tags,
      descripcion: documento.descripcion,
      tamano: documento.tamano,
      mimeType: documento.mimeType,
      sizeBytes: documento.sizeBytes,
      scanStatus: documento.scanStatus,
      scannedAt: documento.scannedAt,
      estado: documento.estado,
      createdAt: documento.createdAt,
      updatedAt: documento.updatedAt,
    };
  }

  private cleanTags(tags: string[] | undefined): string[] {
    return [...new Set((tags || []).map((tag) => tag.trim()).filter(Boolean))].slice(0, 20);
  }

  private cleanName(value: string): string {
    const clean = value.trim().replace(/[<>:"/\\|?*\u0000-\u001f]/g, '_').slice(0, 180);
    if (!clean) throw new BadRequestException('El nombre no puede estar vacío');
    return clean;
  }

  private formatFileSize(sizeBytes: number): string {
    if (sizeBytes < 1024) return sizeBytes + ' B';
    return (sizeBytes / 1024).toFixed(2) + ' KB';
  }
}
