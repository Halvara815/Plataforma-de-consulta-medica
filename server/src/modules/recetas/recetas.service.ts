import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { ClinicalReferencesService } from '../../common/validators/clinical-references.service';
import { AuthenticatedUser } from '../auth/auth.service';
import { CreateRecetaDto, RECETA_ESTADOS } from './dto/create-receta.dto';
import { UpdateRecetaDto } from './dto/update-receta.dto';
import { Receta } from './entities/receta.entity';

const RECETA_TRANSICIONES: Record<string, string[]> = {
  activa: ['surtida', 'cancelada', 'vencida'],
  surtida: [],
  cancelada: [],
  vencida: [],
};

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
      const medico = await this.clinicalReferences.assertMedicoActivo(manager, createRecetaDto.medicoId);
      await this.clinicalReferences.assertPacienteActivo(manager, createRecetaDto.pacienteId);

      const folio = await this.nextFolio(manager);
      const receta = manager.create(Receta, {
        ...createRecetaDto,
        folio,
        estado: 'activa',
        firma: {
          medicoId: medico.id,
          nombre: medico.nombre,
          cedula: medico.cedula,
          emitidaEn: new Date().toISOString(),
        },
      });
      return manager.save(receta);
    });
  }

  async findAllByPaciente(pacienteId: string): Promise<Receta[]> {
    return this.recetasRepository.find({
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
    if (!receta) throw new NotFoundException(`Receta con ID ${id} no encontrada`);
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
      if (updateRecetaDto.medicoId && updateRecetaDto.medicoId !== receta.medicoId) {
        throw new BadRequestException('El médico prescriptor no puede cambiarse después de emitir la receta.');
      }
      if (updateRecetaDto.pacienteId && updateRecetaDto.pacienteId !== receta.pacienteId) {
        throw new BadRequestException('El paciente de la receta no puede cambiarse después de emitirla.');
      }
      if (RECETA_ESTADOS.includes(receta.estado as (typeof RECETA_ESTADOS)[number]) && receta.estado !== 'activa') {
        throw new BadRequestException('La receta ya está en un estado final y no admite modificaciones.');
      }
      if (updateRecetaDto.estado && updateRecetaDto.estado !== receta.estado) {
        const allowed = RECETA_TRANSICIONES[receta.estado] ?? [];
        if (!allowed.includes(updateRecetaDto.estado)) {
          throw new BadRequestException(`No se permite cambiar una receta de ${receta.estado} a ${updateRecetaDto.estado}.`);
        }
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
