import { Controller, Get, Post, Body, Patch, Param, UseGuards, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { EstudiosService } from './estudios.service';
import { CreateEstudioDto } from './dto/create-estudio.dto';
import { UpdateEstudioDto } from './dto/update-estudio.dto';
import { ListEstudiosQueryDto } from './dto/list-estudios-query.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/auth.service';

@ApiTags('estudios')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('estudios')
export class EstudiosController {
  constructor(private readonly estudiosService: EstudiosService) {}

  @Post()
  @RequirePermissions('estudios:escribir')
  @ApiOperation({ summary: 'Solicita un estudio.' })
  @ApiResponse({ status: 201, description: 'Estudio creado.' })
  @ApiResponse({ status: 400, description: 'Paciente o médico inactivo.' })
  @ApiResponse({ status: 403, description: 'El médico del estudio no coincide con el usuario autenticado.' })
  create(@Body() createEstudioDto: CreateEstudioDto, @CurrentUser() currentUser: AuthenticatedUser) {
    return this.estudiosService.create(createEstudioDto, currentUser);
  }

  @Get()
  @RequirePermissions('estudios:leer')
  @ApiOperation({ summary: 'Lista los estudios de un paciente.' })
  @ApiResponse({ status: 200, description: 'Listado de estudios del paciente.' })
  findAllByPaciente(@Query() query: ListEstudiosQueryDto) {
    return this.estudiosService.findAllByPaciente(query.pacienteId);
  }

  @Get(':id')
  @RequirePermissions('estudios:leer')
  @ApiOperation({ summary: 'Obtiene un estudio por ID.' })
  @ApiResponse({ status: 200, description: 'Estudio encontrado.' })
  @ApiResponse({ status: 404, description: 'Estudio no encontrado.' })
  findOne(@Param('id') id: string) {
    return this.estudiosService.findOne(id);
  }

  @Patch(':id')
  @RequirePermissions('estudios:escribir')
  @ApiOperation({ summary: 'Actualiza un estudio. Solo el médico solicitante puede modificarlo.' })
  @ApiResponse({ status: 200, description: 'Estudio actualizado.' })
  @ApiResponse({ status: 400, description: 'Paciente o médico inactivo.' })
  @ApiResponse({ status: 403, description: 'El estudio pertenece a otro médico.' })
  @ApiResponse({ status: 404, description: 'Estudio no encontrado.' })
  update(
    @Param('id') id: string,
    @Body() updateEstudioDto: UpdateEstudioDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ) {
    return this.estudiosService.update(id, updateEstudioDto, currentUser);
  }
}
