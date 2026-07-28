import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Estudio } from './entities/estudio.entity';
import { CreateEstudioDto } from './dto/create-estudio.dto';
import { UpdateEstudioDto } from './dto/update-estudio.dto';

@Injectable()
export class EstudiosService {
  constructor(
    @InjectRepository(Estudio)
    private readonly estudiosRepository: Repository<Estudio>,
  ) {}

  async create(createEstudioDto: CreateEstudioDto): Promise<Estudio> {
    const estudio = this.estudiosRepository.create(createEstudioDto);
    return await this.estudiosRepository.save(estudio);
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
      relations: ['paciente', 'medico']
    });
    
    if (!estudio) {
      throw new NotFoundException(`Estudio con ID ${id} no encontrado`);
    }
    return estudio;
  }

  async update(id: string, updateEstudioDto: UpdateEstudioDto): Promise<Estudio> {
    const estudio = await this.findOne(id);
    Object.assign(estudio, updateEstudioDto);
    return await this.estudiosRepository.save(estudio);
  }
}
