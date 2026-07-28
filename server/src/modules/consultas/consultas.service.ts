import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Consulta } from './entities/consulta.entity';
import { CreateConsultaDto } from './dto/create-consulta.dto';
import { UpdateConsultaDto } from './dto/update-consulta.dto';

@Injectable()
export class ConsultasService {
  constructor(
    @InjectRepository(Consulta)
    private readonly consultasRepository: Repository<Consulta>,
  ) {}

  async create(createConsultaDto: CreateConsultaDto): Promise<Consulta> {
    const consulta = this.consultasRepository.create(createConsultaDto);
    return await this.consultasRepository.save(consulta);
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
      relations: ['paciente', 'medico']
    });
    
    if (!consulta) {
      throw new NotFoundException(`Consulta con ID ${id} no encontrada`);
    }
    return consulta;
  }

  async update(id: string, updateConsultaDto: UpdateConsultaDto): Promise<Consulta> {
    const consulta = await this.findOne(id);
    Object.assign(consulta, updateConsultaDto);
    return await this.consultasRepository.save(consulta);
  }
}
