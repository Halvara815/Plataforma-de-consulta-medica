import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { CitasService } from './citas.service';
import { CreateCitaDto } from './dto/create-cita.dto';
import { UpdateCitaDto } from './dto/update-cita.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('citas')
export class CitasController {
  constructor(private readonly citasService: CitasService) {}

  @Post()
  create(@Body() createCitaDto: CreateCitaDto) {
    return this.citasService.create(createCitaDto);
  }

  @Get()
  findAll(@Query('medicoId') medicoId?: string, @Query('fecha') fecha?: string) {
    return this.citasService.findAll(medicoId, fecha);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.citasService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCitaDto: UpdateCitaDto) {
    return this.citasService.update(id, updateCitaDto);
  }

  @Patch(':id/estado')
  updateStatus(@Param('id') id: string, @Body('estado') estado: string) {
    return this.citasService.updateStatus(id, estado);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.citasService.remove(id);
  }
}
