import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cita } from './entities/cita.entity';
import { CreateCitaDto } from './dto/create-cita.dto';
import { UpdateCitaDto } from './dto/update-cita.dto';

@Injectable()
export class CitasService {
  constructor(
    @InjectRepository(Cita)
    private readonly citasRepository: Repository<Cita>,
  ) {}

  async create(createCitaDto: CreateCitaDto): Promise<Cita> {
    const cita = this.citasRepository.create(createCitaDto);
    return await this.citasRepository.save(cita);
  }

  async findAll(medicoId?: string, fecha?: string): Promise<Cita[]> {
    const where: any = {};
    if (medicoId) where.medicoId = medicoId;
    if (fecha) where.fecha = fecha;

    return await this.citasRepository.find({
      where,
      relations: ['paciente', 'medico'],
      order: { fecha: 'ASC', horaInicio: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Cita> {
    const cita = await this.citasRepository.findOne({ 
      where: { id },
      relations: ['paciente', 'medico']
    });
    
    if (!cita) {
      throw new NotFoundException(`Cita con ID ${id} no encontrada`);
    }
    return cita;
  }

  async update(id: string, updateCitaDto: UpdateCitaDto): Promise<Cita> {
    const cita = await this.findOne(id);
    Object.assign(cita, updateCitaDto);
    return await this.citasRepository.save(cita);
  }

  async updateStatus(id: string, estado: string): Promise<Cita> {
    const cita = await this.findOne(id);
    cita.estado = estado;
    return await this.citasRepository.save(cita);
  }

  async remove(id: string): Promise<void> {
    const cita = await this.findOne(id);
    // Soft delete
    cita.estado = 'cancelada';
    await this.citasRepository.save(cita);
  }
}
