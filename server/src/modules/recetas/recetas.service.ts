import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Receta } from './entities/receta.entity';
import { CreateRecetaDto } from './dto/create-receta.dto';
import { UpdateRecetaDto } from './dto/update-receta.dto';

@Injectable()
export class RecetasService {
  constructor(
    @InjectRepository(Receta)
    private readonly recetasRepository: Repository<Receta>,
  ) {}

  async create(createRecetaDto: CreateRecetaDto): Promise<Receta> {
    const receta = this.recetasRepository.create(createRecetaDto);
    return await this.recetasRepository.save(receta);
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
      relations: ['paciente', 'medico']
    });
    
    if (!receta) {
      throw new NotFoundException(`Receta con ID ${id} no encontrada`);
    }
    return receta;
  }

  async update(id: string, updateRecetaDto: UpdateRecetaDto): Promise<Receta> {
    const receta = await this.findOne(id);
    Object.assign(receta, updateRecetaDto);
    return await this.recetasRepository.save(receta);
  }
}
