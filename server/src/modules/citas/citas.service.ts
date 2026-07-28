import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { Cita } from './entities/cita.entity';
import { CreateCitaDto } from './dto/create-cita.dto';
import { UpdateCitaDto } from './dto/update-cita.dto';
import { ListCitasQueryDto } from './dto/list-citas-query.dto';
import { Paciente } from '../pacientes/entities/paciente.entity';
import { Medico } from '../medicos/entities/medico.entity';

const TRANSICIONES_PERMITIDAS: Record<string, string[]> = {
  pendiente: ['confirmada', 'cancelada'],
  confirmada: ['en_consulta', 'cancelada'],
  en_consulta: ['completada', 'cancelada'],
  completada: [],
  cancelada: [],
};

@Injectable()
export class CitasService {
  constructor(
    @InjectRepository(Cita)
    private readonly citasRepository: Repository<Cita>,
    private readonly dataSource: DataSource,
  ) {}

  async create(createCitaDto: CreateCitaDto): Promise<Cita> {
    const values = this.normalizeSchedule(createCitaDto);

    return this.dataSource.transaction(async (manager) => {
      await this.lockSchedule(manager, values.medicoId, values.fecha, values.consultorioId);
      await this.assertReferences(manager, values.pacienteId, values.medicoId);
      await this.assertNoScheduleConflict(manager, values);

      return manager.save(Cita, manager.create(Cita, values));
    });
  }

  async findAll(query: ListCitasQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 50;
    const citasQuery = this.citasRepository
      .createQueryBuilder('cita')
      .leftJoinAndSelect('cita.paciente', 'paciente')
      .leftJoinAndSelect('cita.medico', 'medico')
      .orderBy('cita.fecha', 'ASC')
      .addOrderBy('cita.horaInicio', 'ASC')
      .skip((page - 1) * limit)
      .take(limit);

    if (query.medicoId) citasQuery.andWhere('cita.medicoId = :medicoId', { medicoId: query.medicoId });
    if (query.pacienteId) citasQuery.andWhere('cita.pacienteId = :pacienteId', { pacienteId: query.pacienteId });
    if (query.consultorioId) citasQuery.andWhere('cita.consultorioId = :consultorioId', { consultorioId: query.consultorioId });
    if (query.estado) citasQuery.andWhere('cita.estado = :estado', { estado: query.estado });

    if (query.fecha) {
      citasQuery.andWhere('cita.fecha = :fecha', { fecha: query.fecha });
    } else {
      if (query.fechaDesde) citasQuery.andWhere('cita.fecha >= :fechaDesde', { fechaDesde: query.fechaDesde });
      if (query.fechaHasta) citasQuery.andWhere('cita.fecha <= :fechaHasta', { fechaHasta: query.fechaHasta });
    }

    const [items, total] = await citasQuery.getManyAndCount();
    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string): Promise<Cita> {
    const cita = await this.citasRepository.findOne({
      where: { id },
      relations: ['paciente', 'medico'],
    });

    if (!cita) {
      throw new NotFoundException(`Cita con ID ${id} no encontrada`);
    }
    return cita;
  }

  async update(id: string, updateCitaDto: UpdateCitaDto): Promise<Cita> {
    return this.dataSource.transaction(async (manager) => {
      const cita = await manager.findOne(Cita, {
        where: { id },
        lock: { mode: 'pessimistic_write' },
      });
      if (!cita) throw new NotFoundException(`Cita con ID ${id} no encontrada`);

      const values = this.normalizeSchedule(updateCitaDto, cita);
      this.assertStateTransition(cita.estado, values.estado);
      await this.lockSchedulesForUpdate(manager, cita, values);
      await this.assertReferences(manager, values.pacienteId, values.medicoId);

      if (values.estado !== 'cancelada') {
        await this.assertNoScheduleConflict(manager, values, id);
      }

      Object.assign(cita, values);
      return manager.save(cita);
    });
  }

  async updateStatus(id: string, estado: string): Promise<Cita> {
    return this.update(id, { estado });
  }

  async remove(id: string): Promise<void> {
    await this.updateStatus(id, 'cancelada');
  }

  private normalizeSchedule(dto: Partial<CreateCitaDto>, current?: Cita) {
    const horaInicio = dto.horaInicio ?? current?.horaInicio;
    const horaFin = dto.horaFin ?? current?.horaFin ?? this.defaultEndTime(horaInicio);
    const values = {
      pacienteId: dto.pacienteId ?? current?.pacienteId,
      medicoId: dto.medicoId ?? current?.medicoId,
      consultorioId: dto.consultorioId ?? current?.consultorioId,
      fecha: dto.fecha ?? current?.fecha,
      horaInicio,
      horaFin,
      motivo: dto.motivo ?? current?.motivo,
      estado: dto.estado ?? current?.estado ?? 'pendiente',
      notas: dto.notas ?? current?.notas,
      recordatorios: dto.recordatorios ?? current?.recordatorios,
    };

    if (!values.medicoId || !values.fecha || !values.horaInicio || !values.horaFin) {
      throw new BadRequestException('La cita requiere médico, fecha y un intervalo de horario válido.');
    }
    if (this.timeToMinutes(values.horaFin) <= this.timeToMinutes(values.horaInicio)) {
      throw new BadRequestException('La hora de fin debe ser posterior a la hora de inicio.');
    }

    return values;
  }

  private defaultEndTime(horaInicio?: string): string | undefined {
    if (!horaInicio) return undefined;
    const minutes = this.timeToMinutes(horaInicio) + 30;
    if (minutes >= 24 * 60) return undefined;
    const hours = Math.floor(minutes / 60).toString().padStart(2, '0');
    const mins = (minutes % 60).toString().padStart(2, '0');
    return `${hours}:${mins}`;
  }

  private timeToMinutes(value: string): number {
    const [hours, minutes] = value.split(':').map(Number);
    return hours * 60 + minutes;
  }

  private assertStateTransition(current: string, target: string): void {
    if (current === target) return;
    if (!TRANSICIONES_PERMITIDAS[current]?.includes(target)) {
      throw new BadRequestException(`No se puede cambiar una cita de ${current} a ${target}.`);
    }
  }

  private async assertReferences(manager: EntityManager, pacienteId: string | undefined, medicoId: string): Promise<void> {
    const medico = await manager.findOne(Medico, { where: { id: medicoId } });
    if (!medico) throw new NotFoundException('El médico seleccionado no existe.');
    if (medico.estado !== 'activo') throw new BadRequestException('No se puede programar una cita con un médico inactivo.');

    if (pacienteId) {
      const paciente = await manager.findOne(Paciente, { where: { id: pacienteId } });
      if (!paciente) throw new NotFoundException('El paciente seleccionado no existe.');
      if (paciente.estado !== 'activo') throw new BadRequestException('No se puede programar una cita para un paciente inactivo.');
    }
  }

  private async lockSchedulesForUpdate(
    manager: EntityManager,
    current: Cita,
    values: ReturnType<CitasService['normalizeSchedule']>,
  ): Promise<void> {
    const locks = [
      `${current.medicoId}:${current.fecha}`,
      `${values.medicoId}:${values.fecha}`,
      current.consultorioId ? `consultorio:${current.consultorioId}:${current.fecha}` : null,
      values.consultorioId ? `consultorio:${values.consultorioId}:${values.fecha}` : null,
    ].filter((value): value is string => Boolean(value));

    for (const lock of [...new Set(locks)].sort()) {
      await manager.query('SELECT pg_advisory_xact_lock(hashtext($1))', [lock]);
    }
  }

  private async lockSchedule(
    manager: EntityManager,
    medicoId: string,
    fecha: string,
    consultorioId?: string,
  ): Promise<void> {
    const locks = [`${medicoId}:${fecha}`];
    if (consultorioId) locks.push(`consultorio:${consultorioId}:${fecha}`);

    for (const lock of locks.sort()) {
      await manager.query('SELECT pg_advisory_xact_lock(hashtext($1))', [lock]);
    }
  }

  private async assertNoScheduleConflict(
    manager: EntityManager,
    values: ReturnType<CitasService['normalizeSchedule']>,
    excludeId?: string,
  ): Promise<void> {
    const conflicts = manager
      .getRepository(Cita)
      .createQueryBuilder('cita')
      .where('cita.fecha = :fecha', { fecha: values.fecha })
      .andWhere('cita.estado != :cancelada', { cancelada: 'cancelada' })
      .andWhere('cita.horaInicio < :horaFin', { horaFin: values.horaFin })
      .andWhere("COALESCE(cita.horaFin, cita.horaInicio + INTERVAL '30 minutes') > :horaInicio", {
        horaInicio: values.horaInicio,
      });

    if (values.consultorioId) {
      conflicts.andWhere('(cita.medicoId = :medicoId OR cita.consultorioId = :consultorioId)', {
        medicoId: values.medicoId,
        consultorioId: values.consultorioId,
      });
    } else {
      conflicts.andWhere('cita.medicoId = :medicoId', { medicoId: values.medicoId });
    }

    if (excludeId) conflicts.andWhere('cita.id != :excludeId', { excludeId });

    if (await conflicts.getExists()) {
      throw new ConflictException('El médico o consultorio ya tiene una cita en ese horario.');
    }
  }
}
