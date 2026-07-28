import { Controller, Get, Post, Body, Patch, Param, UseGuards, Query } from '@nestjs/common';
import { EstudiosService } from './estudios.service';
import { CreateEstudioDto } from './dto/create-estudio.dto';
import { UpdateEstudioDto } from './dto/update-estudio.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('estudios')
export class EstudiosController {
  constructor(private readonly estudiosService: EstudiosService) {}

  @Post()
  create(@Body() createEstudioDto: CreateEstudioDto) {
    return this.estudiosService.create(createEstudioDto);
  }

  @Get()
  findAllByPaciente(@Query('pacienteId') pacienteId: string) {
    return this.estudiosService.findAllByPaciente(pacienteId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.estudiosService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateEstudioDto: UpdateEstudioDto) {
    return this.estudiosService.update(id, updateEstudioDto);
  }
}
