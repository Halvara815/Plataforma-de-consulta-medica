import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditService } from '../auth/audit.service';
import { DocumentStorageService } from '../documentos/document-storage.service';
import { UpdatePreferenciasDto } from './dto/update-preferencias.dto';
import { FirmaUsuario } from './entities/firma-usuario.entity';
import { PreferenciaUsuario } from './entities/preferencia-usuario.entity';

const DEFAULT_FAVORITOS = ['nuevo-paciente', 'agenda', 'reportes'];
const DEFAULT_PLANTILLAS = [
  {
    id: 'plantilla-evolucion',
    titulo: 'Nota de evolución',
    cuerpo: 'Paciente acude a seguimiento. Refiere...\n\nExploración física: ...\n\nPlan: ...',
  },
  {
    id: 'plantilla-consentimiento',
    titulo: 'Consentimiento informado',
    cuerpo: 'El paciente ha sido informado de los riesgos, beneficios y alternativas del procedimiento propuesto y otorga su consentimiento de forma voluntaria.',
  },
  {
    id: 'plantilla-indicaciones',
    titulo: 'Indicaciones generales',
    cuerpo: 'Reposo relativo, abundantes líquidos, dieta blanda. Acudir a revisión en caso de fiebre, dolor intenso o datos de alarma.',
  },
];
const MAX_SIGNATURE_BYTES = 1 * 1024 * 1024;
const MAX_SIGNATURES = 12;

export type PreferenciasResponse = {
  tema: 'light' | 'dark' | 'system';
  sonidoTemporizador: boolean;
  notas: Array<{ id: string; titulo: string; cuerpo: string; fecha: string }>;
  recordatorios: Array<{ id: string; titulo: string; fecha: string; done: boolean }>;
  plantillas: Array<{ id: string; titulo: string; cuerpo: string }>;
  favoritos: string[];
  updatedAt: Date;
};

@Injectable()
export class PreferenciasService {
  constructor(
    @InjectRepository(PreferenciaUsuario)
    private readonly preferenciasRepository: Repository<PreferenciaUsuario>,
    @InjectRepository(FirmaUsuario)
    private readonly firmasRepository: Repository<FirmaUsuario>,
    private readonly documentStorage: DocumentStorageService,
    private readonly auditService: AuditService,
  ) {}

  async get(usuarioId: string): Promise<PreferenciasResponse> {
    return this.serialize(await this.getOrCreate(usuarioId));
  }

  async update(usuarioId: string, dto: UpdatePreferenciasDto): Promise<PreferenciasResponse> {
    const preferencias = await this.getOrCreate(usuarioId);
    if (dto.tema !== undefined) preferencias.tema = dto.tema;
    if (dto.sonidoTemporizador !== undefined) preferencias.sonidoTemporizador = dto.sonidoTemporizador;
    if (dto.notas !== undefined) preferencias.notas = dto.notas.map((nota) => ({
      id: nota.id.trim(),
      titulo: nota.titulo.trim(),
      cuerpo: nota.cuerpo.trim(),
      fecha: nota.fecha,
    }));
    if (dto.recordatorios !== undefined) preferencias.recordatorios = dto.recordatorios.map((recordatorio) => ({
      id: recordatorio.id.trim(),
      titulo: recordatorio.titulo.trim(),
      fecha: recordatorio.fecha,
      done: recordatorio.done,
    }));
    if (dto.plantillas !== undefined) preferencias.plantillas = dto.plantillas.map((plantilla) => ({
      id: plantilla.id.trim(),
      titulo: plantilla.titulo.trim(),
      cuerpo: plantilla.cuerpo.trim(),
    }));
    if (dto.favoritos !== undefined) preferencias.favoritos = [...new Set(dto.favoritos)];
    return this.serialize(await this.preferenciasRepository.save(preferencias));
  }

  async resetHerramientas(usuarioId: string): Promise<PreferenciasResponse> {
    const preferencias = await this.getOrCreate(usuarioId);
    preferencias.sonidoTemporizador = true;
    preferencias.notas = [];
    preferencias.recordatorios = [];
    preferencias.plantillas = this.defaultPlantillas();
    preferencias.favoritos = [...DEFAULT_FAVORITOS];
    await this.removeAllSignatures(usuarioId);
    return this.serialize(await this.preferenciasRepository.save(preferencias));
  }

  async listFirmas(usuarioId: string): Promise<Record<string, unknown>[]> {
    const firmas = await this.firmasRepository.find({
      where: { usuarioId },
      order: { createdAt: 'DESC' },
    });
    return firmas.map((firma) => this.serializeFirma(firma));
  }

  async createFirma(usuarioId: string, file: Express.Multer.File): Promise<Record<string, unknown>> {
    if (!file) throw new BadRequestException('Debe adjuntar una firma PNG');
    if (file.mimetype !== 'image/png' || !file.originalname.toLowerCase().endsWith('.png')) {
      throw new BadRequestException('La firma debe ser una imagen PNG');
    }
    if (file.size > MAX_SIGNATURE_BYTES) {
      throw new BadRequestException('La firma supera el tamaño máximo de 1 MB');
    }
    if (await this.firmasRepository.countBy({ usuarioId }) >= MAX_SIGNATURES) {
      throw new BadRequestException('Solo se pueden conservar hasta 12 firmas guardadas');
    }

    const stored = await this.documentStorage.store(file);
    try {
      const scan = await this.documentStorage.scan(stored.storageKey);
      const firma = await this.firmasRepository.save(this.firmasRepository.create({
        usuarioId,
        nombre: stored.originalName,
        storageKey: stored.storageKey,
        mimeType: stored.mimeType,
        sizeBytes: stored.sizeBytes,
        checksum: stored.checksum,
        scanStatus: scan.status,
        scannedAt: scan.scannedAt,
      }));
      return this.serializeFirma(firma);
    } catch (error) {
      await this.documentStorage.remove(stored.storageKey);
      throw error;
    }
  }

  async downloadFirma(id: string, usuarioId: string): Promise<{ firma: Record<string, unknown>; content: Buffer }> {
    const firma = await this.findFirma(id, usuarioId, true);
    if (this.documentStorage.requiresAntivirus() && firma.scanStatus !== 'limpio') {
      throw new BadRequestException('La firma no cuenta con un análisis antivirus aprobado');
    }
    const content = await this.documentStorage.read(firma.storageKey);
    if (this.documentStorage.checksum(content) !== firma.checksum) {
      throw new NotFoundException('La firma no superó la verificación de integridad');
    }
    await this.auditService.record({
      usuarioId,
      accion: 'preferencias.signature_download',
      recursoTipo: 'preferencias',
      recursoId: firma.id,
      resultado: 'exitoso',
      metadata: { tipo: 'firma_personal' },
    });
    return { firma: this.serializeFirma(firma), content };
  }

  async removeFirma(id: string, usuarioId: string): Promise<void> {
    const firma = await this.findFirma(id, usuarioId, true);
    await this.firmasRepository.remove(firma);
    await this.documentStorage.remove(firma.storageKey);
  }

  private async getOrCreate(usuarioId: string): Promise<PreferenciaUsuario> {
    await this.preferenciasRepository
      .createQueryBuilder()
      .insert()
      .into(PreferenciaUsuario)
      .values({
        usuarioId,
        tema: 'system',
        sonidoTemporizador: true,
        notas: [],
        recordatorios: [],
        plantillas: this.defaultPlantillas(),
        favoritos: [...DEFAULT_FAVORITOS],
      })
      .orIgnore()
      .execute();

    const preferencias = await this.preferenciasRepository.findOneBy({ usuarioId });
    if (!preferencias) throw new NotFoundException('No se pudieron cargar las preferencias del usuario');
    return preferencias;
  }

  private async findFirma(id: string, usuarioId: string, withStorage = false): Promise<FirmaUsuario> {
    const query = this.firmasRepository
      .createQueryBuilder('firma')
      .where('firma.id = :id', { id })
      .andWhere('firma.usuarioId = :usuarioId', { usuarioId });
    if (withStorage) query.addSelect(['firma.storageKey', 'firma.checksum']);
    const firma = await query.getOne();
    if (!firma) throw new NotFoundException('Firma no encontrada');
    return firma;
  }

  private async removeAllSignatures(usuarioId: string): Promise<void> {
    const firmas = await this.firmasRepository
      .createQueryBuilder('firma')
      .addSelect('firma.storageKey')
      .where('firma.usuarioId = :usuarioId', { usuarioId })
      .getMany();
    await this.firmasRepository.remove(firmas);
    await Promise.all(firmas.map((firma) => this.documentStorage.remove(firma.storageKey)));
  }

  private serialize(preferencias: PreferenciaUsuario): PreferenciasResponse {
    return {
      tema: preferencias.tema,
      sonidoTemporizador: preferencias.sonidoTemporizador,
      notas: preferencias.notas || [],
      recordatorios: preferencias.recordatorios || [],
      plantillas: preferencias.plantillas || this.defaultPlantillas(),
      favoritos: preferencias.favoritos || [...DEFAULT_FAVORITOS],
      updatedAt: preferencias.updatedAt,
    };
  }

  private serializeFirma(firma: FirmaUsuario): Record<string, unknown> {
    return {
      id: firma.id,
      nombre: firma.nombre,
      mimeType: firma.mimeType,
      sizeBytes: firma.sizeBytes,
      scanStatus: firma.scanStatus,
      scannedAt: firma.scannedAt,
      createdAt: firma.createdAt,
    };
  }

  private defaultPlantillas() {
    return DEFAULT_PLANTILLAS.map((plantilla) => ({ ...plantilla }));
  }
}
