import { Controller, Get, Post, Body, Patch, Param, UseGuards, Query } from '@nestjs/common';
import { EstudiosService } from './estudios.service';
import { CreateEstudioDto } from './dto/create-estudio.dto';
import { UpdateEstudioDto } from './dto/update-estudio.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('estudios')
export class EstudiosController {
  constructor(private readonly estudiosService: EstudiosService) {}

  @Post()
  @RequirePermissions('estudios:escribir')
  create(@Body() createEstudioDto: CreateEstudioDto) {
    return this.estudiosService.create(createEstudioDto);
  }

  @Get()
  @RequirePermissions('estudios:leer')
  findAllByPaciente(@Query('pacienteId') pacienteId: string) {
    return this.estudiosService.findAllByPaciente(pacienteId);
  }

  @Get(':id')
  @RequirePermissions('estudios:leer')
  findOne(@Param('id') id: string) {
    return this.estudiosService.findOne(id);
  }

  @Patch(':id')
  @RequirePermissions('estudios:escribir')
  update(@Param('id') id: string, @Body() updateEstudioDto: UpdateEstudioDto) {
    return this.estudiosService.update(id, updateEstudioDto);
  }
}
