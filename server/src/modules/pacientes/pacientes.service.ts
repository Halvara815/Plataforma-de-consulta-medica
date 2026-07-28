import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Paciente } from './entities/paciente.entity';
import { CreatePacienteDto } from './dto/create-paciente.dto';
import { UpdatePacienteDto } from './dto/update-paciente.dto';
import { ListPacientesQueryDto } from './dto/list-pacientes-query.dto';

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

  async findAll(query: ListPacientesQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 50;
    const patientsQuery = this.pacientesRepository
      .createQueryBuilder('paciente')
      .orderBy('paciente.apellidos', 'ASC')
      .addOrderBy('paciente.nombre', 'ASC')
      .skip((page - 1) * limit)
      .take(limit);

    if (query.estado) {
      patientsQuery.andWhere('paciente.estado = :estado', { estado: query.estado });
    }

    const search = query.q?.trim();
    if (search) {
      patientsQuery.andWhere(
        `(paciente.nombre ILIKE :search
          OR paciente.apellidos ILIKE :search
          OR CONCAT(paciente.nombre, ' ', paciente.apellidos) ILIKE :search
          OR CAST(paciente.id AS TEXT) ILIKE :search
          OR paciente.curp ILIKE :search
          OR paciente.nss ILIKE :search)`,
        { search: `%${search}%` },
      );
    }

    const [items, total] = await patientsQuery.getManyAndCount();
    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
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
