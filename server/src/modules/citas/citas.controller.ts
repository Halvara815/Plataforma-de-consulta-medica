import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { CitasService } from './citas.service';
import { CreateCitaDto } from './dto/create-cita.dto';
import { UpdateCitaDto } from './dto/update-cita.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';
import { ListCitasQueryDto } from './dto/list-citas-query.dto';
import { UpdateCitaEstadoDto } from './dto/update-cita-estado.dto';

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('citas')
export class CitasController {
  constructor(private readonly citasService: CitasService) {}

  @Post()
  @RequirePermissions('citas:escribir')
  create(@Body() createCitaDto: CreateCitaDto) {
    return this.citasService.create(createCitaDto);
  }

  @Get()
  @RequirePermissions('citas:leer')
  findAll(@Query() query: ListCitasQueryDto) {
    return this.citasService.findAll(query);
  }

  @Get(':id')
  @RequirePermissions('citas:leer')
  findOne(@Param('id') id: string) {
    return this.citasService.findOne(id);
  }

  @Patch(':id')
  @RequirePermissions('citas:escribir')
  update(@Param('id') id: string, @Body() updateCitaDto: UpdateCitaDto) {
    return this.citasService.update(id, updateCitaDto);
  }

  @Patch(':id/estado')
  @RequirePermissions('citas:escribir')
  updateStatus(@Param('id') id: string, @Body() updateCitaEstadoDto: UpdateCitaEstadoDto) {
    return this.citasService.updateStatus(id, updateCitaEstadoDto.estado);
  }

  @Delete(':id')
  @RequirePermissions('citas:escribir')
  remove(@Param('id') id: string) {
    return this.citasService.remove(id);
  }
}
