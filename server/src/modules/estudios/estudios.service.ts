import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Estudio } from './entities/estudio.entity';
import { CreateEstudioDto } from './dto/create-estudio.dto';
import { UpdateEstudioDto } from './dto/update-estudio.dto';
import { AuthenticatedUser } from '../auth/auth.service';
import { ClinicalReferencesService } from '../../common/validators/clinical-references.service';

@Injectable()
export class EstudiosService {
  constructor(
    @InjectRepository(Estudio)
    private readonly estudiosRepository: Repository<Estudio>,
    private readonly dataSource: DataSource,
    private readonly clinicalReferences: ClinicalReferencesService,
  ) {}

  async create(createEstudioDto: CreateEstudioDto, currentUser: AuthenticatedUser): Promise<Estudio> {
    if (createEstudioDto.medicoId !== currentUser.medicoId) {
      throw new ForbiddenException('No puedes solicitar un estudio a nombre de otro médico.');
    }

    return this.dataSource.transaction(async (manager) => {
      await this.clinicalReferences.assertReferencias(manager, {
        pacienteId: createEstudioDto.pacienteId,
        medicoId: createEstudioDto.medicoId,
      });

      const estudio = manager.create(Estudio, createEstudioDto);
      return manager.save(estudio);
    });
  }

  async findAllByPaciente(pacienteId: string): Promise<Estudio[]> {
    return await this.estudiosRepository.find({
      where: { pacienteId },
      relations: ['medico'],
      order: { fecha: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Estudio> {
    const estudio = await this.estudiosRepository.findOne({
      where: { id },
      relations: ['paciente', 'medico'],
    });

    if (!estudio) {
      throw new NotFoundException(`Estudio con ID ${id} no encontrado`);
    }
    return estudio;
  }

  async update(id: string, updateEstudioDto: UpdateEstudioDto, currentUser: AuthenticatedUser): Promise<Estudio> {
    return this.dataSource.transaction(async (manager) => {
      const estudio = await manager.findOne(Estudio, {
        where: { id },
        lock: { mode: 'pessimistic_write' },
      });
      if (!estudio) throw new NotFoundException(`Estudio con ID ${id} no encontrado`);

      if (estudio.medicoId !== currentUser.medicoId) {
        throw new ForbiddenException('No puedes modificar el estudio de otro médico.');
      }
      if (updateEstudioDto.medicoId && updateEstudioDto.medicoId !== currentUser.medicoId) {
        throw new ForbiddenException('No puedes transferir el estudio a otro médico.');
      }

      if (updateEstudioDto.pacienteId || updateEstudioDto.medicoId) {
        await this.clinicalReferences.assertReferencias(manager, {
          pacienteId: updateEstudioDto.pacienteId ?? estudio.pacienteId,
          medicoId: updateEstudioDto.medicoId ?? estudio.medicoId,
        });
      }

      Object.assign(estudio, updateEstudioDto);
      return manager.save(estudio);
    });
  }
}
