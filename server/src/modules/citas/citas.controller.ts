import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CitasService } from './citas.service';
import { CreateCitaDto } from './dto/create-cita.dto';
import { UpdateCitaDto } from './dto/update-cita.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';
import { ListCitasQueryDto } from './dto/list-citas-query.dto';
import { UpdateCitaEstadoDto } from './dto/update-cita-estado.dto';

@ApiTags('citas')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('citas')
export class CitasController {
  constructor(private readonly citasService: CitasService) {}

  @Post()
  @RequirePermissions('citas:escribir')
  @ApiOperation({ summary: 'Crea una cita.' })
  @ApiResponse({ status: 201, description: 'Cita creada.' })
  @ApiResponse({ status: 400, description: 'Horario inválido o médico/paciente inactivo.' })
  @ApiResponse({ status: 409, description: 'El médico o consultorio ya tiene una cita en ese horario.' })
  create(@Body() createCitaDto: CreateCitaDto) {
    return this.citasService.create(createCitaDto);
  }

  @Get()
  @RequirePermissions('citas:leer')
  @ApiOperation({ summary: 'Lista citas paginadas con filtros.' })
  @ApiResponse({ status: 200, description: 'Listado paginado de citas.' })
  findAll(@Query() query: ListCitasQueryDto) {
    return this.citasService.findAll(query);
  }

  @Get(':id')
  @RequirePermissions('citas:leer')
  @ApiOperation({ summary: 'Obtiene una cita por ID.' })
  @ApiResponse({ status: 200, description: 'Cita encontrada.' })
  @ApiResponse({ status: 404, description: 'Cita no encontrada.' })
  findOne(@Param('id') id: string) {
    return this.citasService.findOne(id);
  }

  @Patch(':id')
  @RequirePermissions('citas:escribir')
  @ApiOperation({ summary: 'Actualiza una cita.' })
  @ApiResponse({ status: 200, description: 'Cita actualizada.' })
  @ApiResponse({ status: 400, description: 'Transición de estado u horario inválidos.' })
  @ApiResponse({ status: 404, description: 'Cita no encontrada.' })
  @ApiResponse({ status: 409, description: 'El médico o consultorio ya tiene una cita en ese horario.' })
  update(@Param('id') id: string, @Body() updateCitaDto: UpdateCitaDto) {
    return this.citasService.update(id, updateCitaDto);
  }

  @Patch(':id/estado')
  @RequirePermissions('citas:escribir')
  @ApiOperation({ summary: 'Cambia el estado de una cita respetando las transiciones permitidas.' })
  @ApiResponse({ status: 200, description: 'Estado actualizado.' })
  @ApiResponse({ status: 400, description: 'Transición de estado no permitida.' })
  @ApiResponse({ status: 404, description: 'Cita no encontrada.' })
  updateStatus(@Param('id') id: string, @Body() updateCitaEstadoDto: UpdateCitaEstadoDto) {
    return this.citasService.updateStatus(id, updateCitaEstadoDto.estado);
  }

  @Delete(':id')
  @RequirePermissions('citas:escribir')
  @ApiOperation({ summary: 'Cancela una cita (baja lógica).' })
  @ApiResponse({ status: 200, description: 'Cita cancelada.' })
  @ApiResponse({ status: 404, description: 'Cita no encontrada.' })
  remove(@Param('id') id: string) {
    return this.citasService.remove(id);
  }
}
