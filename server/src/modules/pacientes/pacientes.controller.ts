import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PacientesService } from './pacientes.service';
import { CreatePacienteDto } from './dto/create-paciente.dto';
import { UpdatePacienteDto } from './dto/update-paciente.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';
import { ListPacientesQueryDto } from './dto/list-pacientes-query.dto';

@ApiTags('pacientes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('pacientes')
export class PacientesController {
  constructor(private readonly pacientesService: PacientesService) {}

  @Post()
  @RequirePermissions('pacientes:escribir')
  @ApiOperation({ summary: 'Crea un paciente.' })
  @ApiResponse({ status: 201, description: 'Paciente creado.' })
  create(@Body() createPacienteDto: CreatePacienteDto) {
    return this.pacientesService.create(createPacienteDto);
  }

  @Get()
  @RequirePermissions('pacientes:leer')
  @ApiOperation({ summary: 'Lista pacientes paginados con búsqueda y filtros.' })
  @ApiResponse({ status: 200, description: 'Listado paginado de pacientes.' })
  findAll(@Query() query: ListPacientesQueryDto) {
    return this.pacientesService.findAll(query);
  }

  @Get(':id')
  @RequirePermissions('pacientes:leer')
  @ApiOperation({ summary: 'Obtiene un paciente por ID con sus registros clínicos relacionados.' })
  @ApiResponse({ status: 200, description: 'Paciente encontrado.' })
  @ApiResponse({ status: 404, description: 'Paciente no encontrado.' })
  findOne(@Param('id') id: string) {
    return this.pacientesService.findOne(id);
  }

  @Patch(':id')
  @RequirePermissions('pacientes:escribir')
  @ApiOperation({ summary: 'Actualiza un paciente.' })
  @ApiResponse({ status: 200, description: 'Paciente actualizado.' })
  @ApiResponse({ status: 404, description: 'Paciente no encontrado.' })
  update(@Param('id') id: string, @Body() updatePacienteDto: UpdatePacienteDto) {
    return this.pacientesService.update(id, updatePacienteDto);
  }

  @Delete(':id')
  @RequirePermissions('pacientes:escribir')
  @ApiOperation({ summary: 'Da de baja lógica a un paciente (lo marca como inactivo).' })
  @ApiResponse({ status: 200, description: 'Paciente marcado como inactivo.' })
  @ApiResponse({ status: 404, description: 'Paciente no encontrado.' })
  remove(@Param('id') id: string) {
    return this.pacientesService.remove(id);
  }
}
