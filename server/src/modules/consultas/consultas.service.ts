import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Consulta } from './entities/consulta.entity';
import { CreateConsultaDto } from './dto/create-consulta.dto';
import { UpdateConsultaDto } from './dto/update-consulta.dto';
import { AuthenticatedUser } from '../auth/auth.service';
import { ClinicalReferencesService } from '../../common/validators/clinical-references.service';

@Injectable()
export class ConsultasService {
  constructor(
    @InjectRepository(Consulta)
    private readonly consultasRepository: Repository<Consulta>,
    private readonly dataSource: DataSource,
    private readonly clinicalReferences: ClinicalReferencesService,
  ) {}

  async create(createConsultaDto: CreateConsultaDto, currentUser: AuthenticatedUser): Promise<Consulta> {
    if (createConsultaDto.medicoId !== currentUser.medicoId) {
      throw new ForbiddenException('No puedes registrar una consulta a nombre de otro médico.');
    }

    return this.dataSource.transaction(async (manager) => {
      await this.clinicalReferences.assertReferencias(manager, {
        pacienteId: createConsultaDto.pacienteId,
        medicoId: createConsultaDto.medicoId,
      });

      const consulta = manager.create(Consulta, {
        ...createConsultaDto,
        estado: createConsultaDto.estado ?? 'en_curso',
      });
      return manager.save(consulta);
    });
  }

  async findAllByPaciente(pacienteId: string): Promise<Consulta[]> {
    return await this.consultasRepository.find({
      where: { pacienteId },
      relations: ['medico'],
      order: { fecha: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Consulta> {
    const consulta = await this.consultasRepository.findOne({
      where: { id },
      relations: ['paciente', 'medico'],
    });

    if (!consulta) {
      throw new NotFoundException(`Consulta con ID ${id} no encontrada`);
    }
    return consulta;
  }

  async update(id: string, updateConsultaDto: UpdateConsultaDto, currentUser: AuthenticatedUser): Promise<Consulta> {
    return this.dataSource.transaction(async (manager) => {
      const consulta = await manager.findOne(Consulta, {
        where: { id },
        lock: { mode: 'pessimistic_write' },
      });
      if (!consulta) throw new NotFoundException(`Consulta con ID ${id} no encontrada`);

      if (consulta.medicoId !== currentUser.medicoId) {
        throw new ForbiddenException('No puedes modificar la consulta de otro médico.');
      }
      if (consulta.estado === 'completada') {
        throw new BadRequestException('La consulta ya está cerrada y no admite modificaciones.');
      }
      if (updateConsultaDto.medicoId && updateConsultaDto.medicoId !== currentUser.medicoId) {
        throw new ForbiddenException('No puedes transferir la consulta a otro médico.');
      }

      if (updateConsultaDto.pacienteId || updateConsultaDto.medicoId) {
        await this.clinicalReferences.assertReferencias(manager, {
          pacienteId: updateConsultaDto.pacienteId ?? consulta.pacienteId,
          medicoId: updateConsultaDto.medicoId ?? consulta.medicoId,
        });
      }

      Object.assign(consulta, updateConsultaDto);
      return manager.save(consulta);
    });
  }
}
