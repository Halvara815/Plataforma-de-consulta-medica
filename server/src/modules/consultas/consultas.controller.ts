import { Controller, Get, Post, Body, Patch, Param, UseGuards, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ConsultasService } from './consultas.service';
import { CreateConsultaDto } from './dto/create-consulta.dto';
import { UpdateConsultaDto } from './dto/update-consulta.dto';
import { ListConsultasQueryDto } from './dto/list-consultas-query.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/auth.service';

@ApiTags('consultas')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('consultas')
export class ConsultasController {
  constructor(private readonly consultasService: ConsultasService) {}

  @Post()
  @RequirePermissions('consultas:escribir')
  @ApiOperation({ summary: 'Registra una consulta. Solo el médico tratante puede autorarla.' })
  @ApiResponse({ status: 201, description: 'Consulta creada.' })
  @ApiResponse({ status: 400, description: 'Paciente o médico inactivo.' })
  @ApiResponse({ status: 403, description: 'El médico de la consulta no coincide con el usuario autenticado.' })
  create(@Body() createConsultaDto: CreateConsultaDto, @CurrentUser() currentUser: AuthenticatedUser) {
    return this.consultasService.create(createConsultaDto, currentUser);
  }

  @Get()
  @RequirePermissions('consultas:leer')
  @ApiOperation({ summary: 'Lista las consultas de un paciente.' })
  @ApiResponse({ status: 200, description: 'Listado de consultas del paciente.' })
  findAllByPaciente(@Query() query: ListConsultasQueryDto) {
    return this.consultasService.findAllByPaciente(query.pacienteId);
  }

  @Get(':id')
  @RequirePermissions('consultas:leer')
  @ApiOperation({ summary: 'Obtiene una consulta por ID.' })
  @ApiResponse({ status: 200, description: 'Consulta encontrada.' })
  @ApiResponse({ status: 404, description: 'Consulta no encontrada.' })
  findOne(@Param('id') id: string) {
    return this.consultasService.findOne(id);
  }

  @Patch(':id')
  @RequirePermissions('consultas:escribir')
  @ApiOperation({ summary: 'Actualiza o cierra una consulta. Solo el médico tratante puede modificarla mientras está en curso.' })
  @ApiResponse({ status: 200, description: 'Consulta actualizada.' })
  @ApiResponse({ status: 400, description: 'La consulta ya está cerrada, o el paciente/médico no está activo.' })
  @ApiResponse({ status: 403, description: 'La consulta pertenece a otro médico.' })
  @ApiResponse({ status: 404, description: 'Consulta no encontrada.' })
  update(
    @Param('id') id: string,
    @Body() updateConsultaDto: UpdateConsultaDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ) {
    return this.consultasService.update(id, updateConsultaDto, currentUser);
  }
}
