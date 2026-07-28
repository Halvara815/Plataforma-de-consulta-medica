import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Paciente } from './entities/paciente.entity';
import { CreatePacienteDto } from './dto/create-paciente.dto';
import { UpdatePacienteDto } from './dto/update-paciente.dto';

@Injectable()
export class PacientesService {
  constructor(
    @InjectRepository(Paciente)
    private readonly pacientesRepository: Repository<Paciente>,
  ) {}

  async create(createPacienteDto: CreatePacienteDto): Promise<Paciente> {
    const paciente = this.pacientesRepository.create(createPacienteDto);
    return await this.pacientesRepository.save(paciente);
  }

  async findAll(): Promise<Paciente[]> {
    return await this.pacientesRepository.find({
      order: { apellidos: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Paciente> {
    const paciente = await this.pacientesRepository.findOne({ 
      where: { id },
      relations: ['citas', 'consultas', 'recetas', 'estudios', 'documentos'] 
    });
    
    if (!paciente) {
      throw new NotFoundException(`Paciente con ID ${id} no encontrado`);
    }
    
    return paciente;
  }

  async update(id: string, updatePacienteDto: UpdatePacienteDto): Promise<Paciente> {
    const paciente = await this.findOne(id); // Verifica si existe
    Object.assign(paciente, updatePacienteDto);
    return await this.pacientesRepository.save(paciente);
  }

  async remove(id: string): Promise<void> {
    const paciente = await this.findOne(id);
    // Soft delete o hard delete dependiendo de reglas de negocio. Por ahora marcamos inactivo
    paciente.estado = 'inactivo';
    await this.pacientesRepository.save(paciente);
  }
}
