import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Documento } from './entities/documento.entity';
import { CreateDocumentoDto } from './dto/create-documento.dto';
import { UpdateDocumentoDto } from './dto/update-documento.dto';

@Injectable()
export class DocumentosService {
  constructor(
    @InjectRepository(Documento)
    private readonly documentosRepository: Repository<Documento>,
  ) {}

  async create(createDocumentoDto: CreateDocumentoDto): Promise<Documento> {
    const documento = this.documentosRepository.create(createDocumentoDto);
    return await this.documentosRepository.save(documento);
  }

  async findAllByPaciente(pacienteId: string): Promise<Documento[]> {
    return await this.documentosRepository.find({
      where: { pacienteId },
      order: { fecha: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Documento> {
    const documento = await this.documentosRepository.findOne({ 
      where: { id },
      relations: ['paciente']
    });
    
    if (!documento) {
      throw new NotFoundException(`Documento con ID ${id} no encontrado`);
    }
    return documento;
  }

  async update(id: string, updateDocumentoDto: UpdateDocumentoDto): Promise<Documento> {
    const documento = await this.findOne(id);
    Object.assign(documento, updateDocumentoDto);
    return await this.documentosRepository.save(documento);
  }

  async remove(id: string): Promise<void> {
    const documento = await this.findOne(id);
    // Hard delete o soft delete, dependiendo del caso.
    await this.documentosRepository.remove(documento);
  }
}
