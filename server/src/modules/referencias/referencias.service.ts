import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Paciente } from '../pacientes/entities/paciente.entity';
import { CreateReferenciaDto } from './dto/create-referencia.dto';
import { Referencia } from './entities/referencia.entity';

@Injectable()
export class ReferenciasService {
  constructor(
    @InjectRepository(Referencia)
    private readonly referenciasRepository: Repository<Referencia>,
    @InjectRepository(Paciente)
    private readonly pacientesRepository: Repository<Paciente>,
  ) {}

  async create(dto: CreateReferenciaDto): Promise<Referencia> {
    const paciente = await this.pacientesRepository.findOneBy({ id: dto.pacienteId });
    if (!paciente || paciente.estado !== 'activo') {
      throw new BadRequestException('El paciente no existe o no está activo');
    }
    return this.referenciasRepository.save(this.referenciasRepository.create({
      ...dto,
      estado: dto.estado ?? 'pendiente',
    }));
  }

  async findAllByPaciente(pacienteId: string): Promise<Referencia[]> {
    const paciente = await this.pacientesRepository.findOneBy({ id: pacienteId });
    if (!paciente) throw new NotFoundException('Paciente no encontrado');
    return this.referenciasRepository.find({
      where: { pacienteId },
      order: { fecha: 'DESC', createdAt: 'DESC' },
    });
  }
}
