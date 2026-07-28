import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { PacientesService } from './pacientes.service';
import { CreatePacienteDto } from './dto/create-paciente.dto';
import { UpdatePacienteDto } from './dto/update-paciente.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';
import { ListPacientesQueryDto } from './dto/list-pacientes-query.dto';

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('pacientes')
export class PacientesController {
  constructor(private readonly pacientesService: PacientesService) {}

  @Post()
  @RequirePermissions('pacientes:escribir')
  create(@Body() createPacienteDto: CreatePacienteDto) {
    return this.pacientesService.create(createPacienteDto);
  }

  @Get()
  @RequirePermissions('pacientes:leer')
  findAll(@Query() query: ListPacientesQueryDto) {
    return this.pacientesService.findAll(query);
  }

  @Get(':id')
  @RequirePermissions('pacientes:leer')
  findOne(@Param('id') id: string) {
    return this.pacientesService.findOne(id);
  }

  @Patch(':id')
  @RequirePermissions('pacientes:escribir')
  update(@Param('id') id: string, @Body() updatePacienteDto: UpdatePacienteDto) {
    return this.pacientesService.update(id, updatePacienteDto);
  }

  @Delete(':id')
  @RequirePermissions('pacientes:escribir')
  remove(@Param('id') id: string) {
    return this.pacientesService.remove(id);
  }
}
