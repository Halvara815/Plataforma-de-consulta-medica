import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { Medico } from '../../modules/medicos/entities/medico.entity';
import { Paciente } from '../../modules/pacientes/entities/paciente.entity';

@Injectable()
export class ClinicalReferencesService {
  async assertMedicoActivo(manager: EntityManager, medicoId: string): Promise<Medico> {
    const medico = await manager.findOne(Medico, { where: { id: medicoId } });
    if (!medico) throw new NotFoundException('El médico seleccionado no existe.');
    if (medico.estado !== 'activo') throw new BadRequestException('El médico seleccionado no está activo.');
    return medico;
  }

  async assertPacienteActivo(manager: EntityManager, pacienteId: string): Promise<Paciente> {
    const paciente = await manager.findOne(Paciente, { where: { id: pacienteId } });
    if (!paciente) throw new NotFoundException('El paciente seleccionado no existe.');
    if (paciente.estado !== 'activo') throw new BadRequestException('El paciente seleccionado no está activo.');
    return paciente;
  }

  async assertReferencias(
    manager: EntityManager,
    params: { pacienteId: string; medicoId: string },
  ): Promise<void> {
    await this.assertMedicoActivo(manager, params.medicoId);
    await this.assertPacienteActivo(manager, params.pacienteId);
  }
}
