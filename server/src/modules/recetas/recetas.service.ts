import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { Receta } from './entities/receta.entity';
import { CreateRecetaDto } from './dto/create-receta.dto';
import { UpdateRecetaDto } from './dto/update-receta.dto';
import { AuthenticatedUser } from '../auth/auth.service';
import { ClinicalReferencesService } from '../../common/validators/clinical-references.service';

@Injectable()
export class RecetasService {
  constructor(
    @InjectRepository(Receta)
    private readonly recetasRepository: Repository<Receta>,
    private readonly dataSource: DataSource,
    private readonly clinicalReferences: ClinicalReferencesService,
  ) {}

  async create(createRecetaDto: CreateRecetaDto, currentUser: AuthenticatedUser): Promise<Receta> {
    if (createRecetaDto.medicoId !== currentUser.medicoId) {
      throw new ForbiddenException('No puedes prescribir una receta a nombre de otro médico.');
    }

    return this.dataSource.transaction(async (manager) => {
      await this.clinicalReferences.assertReferencias(manager, {
        pacienteId: createRecetaDto.pacienteId,
        medicoId: createRecetaDto.medicoId,
      });

      const folio = await this.nextFolio(manager);
      const receta = manager.create(Receta, { ...createRecetaDto, folio });
      return manager.save(receta);
    });
  }

  async findAllByPaciente(pacienteId: string): Promise<Receta[]> {
    return await this.recetasRepository.find({
      where: { pacienteId },
      relations: ['medico'],
      order: { fecha: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Receta> {
    const receta = await this.recetasRepository.findOne({
      where: { id },
      relations: ['paciente', 'medico'],
    });

    if (!receta) {
      throw new NotFoundException(`Receta con ID ${id} no encontrada`);
    }
    return receta;
  }

  async update(id: string, updateRecetaDto: UpdateRecetaDto, currentUser: AuthenticatedUser): Promise<Receta> {
    return this.dataSource.transaction(async (manager) => {
      const receta = await manager.findOne(Receta, {
        where: { id },
        lock: { mode: 'pessimistic_write' },
      });
      if (!receta) throw new NotFoundException(`Receta con ID ${id} no encontrada`);

      if (receta.medicoId !== currentUser.medicoId) {
        throw new ForbiddenException('No puedes modificar la receta de otro médico.');
      }
      if (updateRecetaDto.medicoId && updateRecetaDto.medicoId !== currentUser.medicoId) {
        throw new ForbiddenException('No puedes transferir la receta a otro médico.');
      }

      if (updateRecetaDto.pacienteId || updateRecetaDto.medicoId) {
        await this.clinicalReferences.assertReferencias(manager, {
          pacienteId: updateRecetaDto.pacienteId ?? receta.pacienteId,
          medicoId: updateRecetaDto.medicoId ?? receta.medicoId,
        });
      }

      Object.assign(receta, updateRecetaDto);
      return manager.save(receta);
    });
  }

  private async nextFolio(manager: EntityManager): Promise<string> {
    const [{ seq }] = await manager.query("SELECT nextval('recetas_folio_seq') AS seq");
    return `REC-${String(seq).padStart(7, '0')}`;
  }
}
