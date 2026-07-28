import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Medico } from './entities/medico.entity';

@Injectable()
export class MedicosService {
  constructor(
    @InjectRepository(Medico)
    private readonly medicosRepository: Repository<Medico>,
  ) {}

  async findAll(): Promise<Medico[]> {
    return this.medicosRepository.find({ order: { nombre: 'ASC' } });
  }

  async findOne(id: string): Promise<Medico> {
    const medico = await this.medicosRepository.findOneBy({ id });
    if (!medico) {
      throw new NotFoundException(`Médico con ID ${id} no encontrado`);
    }
    return medico;
  }
}
