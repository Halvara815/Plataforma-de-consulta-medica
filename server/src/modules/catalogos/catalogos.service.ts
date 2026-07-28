import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { CreateCatalogoDto } from './dto/create-catalogo.dto';
import { UpdateCatalogoDto } from './dto/update-catalogo.dto';
import { CatalogoClinico, CatalogoTipo, CATALOGO_TIPOS } from './entities/catalogo-clinico.entity';

type CatalogosLegacy = Record<string, unknown[]>;

@Injectable()
export class CatalogosService {
  constructor(
    @InjectRepository(CatalogoClinico)
    private readonly catalogosRepository: Repository<CatalogoClinico>,
  ) {}

  async findAll(): Promise<CatalogosLegacy> {
    const entries = await this.catalogosRepository.find({
      where: { estado: 'activo' },
      order: { tipo: 'ASC', nombre: 'ASC' },
    });
    const grouped = new Map<CatalogoTipo, CatalogoClinico[]>();
    for (const type of CATALOGO_TIPOS) grouped.set(type, []);
    for (const entry of entries) grouped.get(entry.tipo)?.push(entry);

    return {
      diagnosticosCIE10: (grouped.get('diagnosticosCIE10') ?? []).map((entry) => ({
        codigo: entry.codigo,
        descripcion: entry.nombre,
      })),
      medicamentos: (grouped.get('medicamentos') ?? []).map((entry) => ({
        nombre: entry.nombre,
        presentaciones: this.stringArray(entry.metadata?.presentaciones),
      })),
      interaccionesConocidas: (grouped.get('interaccionesConocidas') ?? []).map((entry) => ({
        medicamentos: this.stringArray(entry.metadata?.medicamentos),
        descripcion: entry.nombre,
        severidad: this.stringValue(entry.metadata?.severidad),
      })),
      especialidades: this.names(grouped.get('especialidades')),
      consultorios: this.names(grouped.get('consultorios')),
      aseguradoras: this.names(grouped.get('aseguradoras')),
      estadosCita: this.names(grouped.get('estadosCita')),
      categoriasDocumento: this.names(grouped.get('categoriasDocumento')),
      estudiosCatalogo: this.names(grouped.get('estudiosCatalogo')),
      tiposConsulta: ['inicial', 'control', 'seguimiento', 'urgencia'],
      tiposDiagnostico: ['presuntivo', 'definitivo', 'diferencial'],
      viasAdministracion: ['Oral', 'Tópica', 'Inyectable', 'Inhalada'],
      tiposReceta: ['ambulatoria', 'controlado', 'especial'],
      estadosReceta: ['activa', 'surtida', 'cancelada', 'vencida'],
      prioridadesEstudio: ['rutina', 'prioritaria', 'urgente'],
      estadosEstudio: ['solicitado', 'programado', 'en_proceso', 'completado', 'cancelado'],
    };
  }

  async findByTipo(tipo: string): Promise<unknown[]> {
    if (!this.isCatalogType(tipo)) return [];
    return (await this.findAll())[tipo] ?? [];
  }

  async findEntries(tipo: string): Promise<Record<string, unknown>[]> {
    const validatedType = this.assertCatalogType(tipo);
    const entries = await this.catalogosRepository.find({
      where: { tipo: validatedType },
      order: { nombre: 'ASC' },
    });
    return entries.map((entry) => this.serialize(entry));
  }

  async create(dto: CreateCatalogoDto): Promise<Record<string, unknown>> {
    const tipo = this.assertCatalogType(dto.tipo);
    const codigo = this.normalize(dto.codigo);
    const nombre = this.normalize(dto.nombre);
    const existing = await this.catalogosRepository.findOneBy({ tipo, codigo });
    if (existing) throw new ConflictException('Ya existe una entrada con esa clave dentro del catálogo seleccionado.');

    const entry = this.catalogosRepository.create({
      tipo,
      codigo,
      nombre,
      metadata: dto.metadata ?? null,
      estado: dto.estado === 'inactivo' ? 'inactivo' : 'activo',
    });
    return this.serialize(await this.catalogosRepository.save(entry));
  }

  async update(id: string, dto: UpdateCatalogoDto): Promise<Record<string, unknown>> {
    const entry = await this.catalogosRepository.findOneBy({ id });
    if (!entry) throw new NotFoundException('Entrada de catálogo no encontrada.');

    const tipo = dto.tipo ? this.assertCatalogType(dto.tipo) : entry.tipo;
    const codigo = dto.codigo ? this.normalize(dto.codigo) : entry.codigo;
    if (tipo !== entry.tipo || codigo !== entry.codigo) {
      const duplicate = await this.catalogosRepository.findOneBy({ tipo, codigo });
      if (duplicate && duplicate.id !== entry.id) {
        throw new ConflictException('Ya existe una entrada con esa clave dentro del catálogo seleccionado.');
      }
    }

    entry.tipo = tipo;
    entry.codigo = codigo;
    if (dto.nombre !== undefined) entry.nombre = this.normalize(dto.nombre);
    if (dto.metadata !== undefined) entry.metadata = dto.metadata;
    if (dto.estado !== undefined) entry.estado = dto.estado === 'inactivo' ? 'inactivo' : 'activo';
    return this.serialize(await this.catalogosRepository.save(entry));
  }

  async assertDiagnosticCodesActive(manager: EntityManager, codes: string[]): Promise<void> {
    const uniqueCodes = [...new Set(codes.map((code) => code.trim().toUpperCase()))];
    if (!uniqueCodes.length) return;
    const active = await manager
      .getRepository(CatalogoClinico)
      .createQueryBuilder('catalogo')
      .where('catalogo.tipo = :tipo', { tipo: 'diagnosticosCIE10' })
      .andWhere('catalogo.estado = :estado', { estado: 'activo' })
      .andWhere('UPPER(catalogo.codigo) IN (:...codes)', { codes: uniqueCodes })
      .getCount();
    if (active !== uniqueCodes.length) {
      throw new BadRequestException('Uno o más diagnósticos CIE-10 no existen o están inactivos en el catálogo.');
    }
  }

  private isCatalogType(tipo: string): tipo is CatalogoTipo {
    return (CATALOGO_TIPOS as readonly string[]).includes(tipo);
  }

  private assertCatalogType(tipo: string): CatalogoTipo {
    if (!this.isCatalogType(tipo)) throw new BadRequestException('Tipo de catálogo no válido.');
    return tipo;
  }

  private normalize(value: string): string {
    const normalized = value.trim();
    if (!normalized) throw new BadRequestException('La clave y el nombre del catálogo no pueden estar vacíos.');
    return normalized;
  }

  private names(entries: CatalogoClinico[] | undefined): string[] {
    return (entries ?? []).map((entry) => entry.nombre);
  }

  private stringArray(value: unknown): string[] {
    return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
  }

  private stringValue(value: unknown): string | undefined {
    return typeof value === 'string' ? value : undefined;
  }

  private serialize(entry: CatalogoClinico): Record<string, unknown> {
    return {
      id: entry.id,
      tipo: entry.tipo,
      codigo: entry.codigo,
      nombre: entry.nombre,
      metadata: entry.metadata,
      estado: entry.estado,
      createdAt: entry.createdAt,
      updatedAt: entry.updatedAt,
    };
  }
}
