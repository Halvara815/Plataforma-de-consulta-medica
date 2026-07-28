import { Controller, Get, Post, Body, Patch, Param, UseGuards, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RecetasService } from './recetas.service';
import { CreateRecetaDto } from './dto/create-receta.dto';
import { UpdateRecetaDto } from './dto/update-receta.dto';
import { ListRecetasQueryDto } from './dto/list-recetas-query.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/auth.service';

@ApiTags('recetas')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('recetas')
export class RecetasController {
  constructor(private readonly recetasService: RecetasService) {}

  @Post()
  @RequirePermissions('recetas:escribir')
  @ApiOperation({ summary: 'Prescribe una receta. El folio lo asigna el servidor.' })
  @ApiResponse({ status: 201, description: 'Receta creada.' })
  @ApiResponse({ status: 400, description: 'Paciente o médico inactivo.' })
  @ApiResponse({ status: 403, description: 'El médico de la receta no coincide con el usuario autenticado.' })
  create(@Body() createRecetaDto: CreateRecetaDto, @CurrentUser() currentUser: AuthenticatedUser) {
    return this.recetasService.create(createRecetaDto, currentUser);
  }

  @Get()
  @RequirePermissions('recetas:leer')
  @ApiOperation({ summary: 'Lista las recetas de un paciente.' })
  @ApiResponse({ status: 200, description: 'Listado de recetas del paciente.' })
  findAllByPaciente(@Query() query: ListRecetasQueryDto) {
    return this.recetasService.findAllByPaciente(query.pacienteId);
  }

  @Get(':id')
  @RequirePermissions('recetas:leer')
  @ApiOperation({ summary: 'Obtiene una receta por ID.' })
  @ApiResponse({ status: 200, description: 'Receta encontrada.' })
  @ApiResponse({ status: 404, description: 'Receta no encontrada.' })
  findOne(@Param('id') id: string) {
    return this.recetasService.findOne(id);
  }

  @Patch(':id')
  @RequirePermissions('recetas:escribir')
  @ApiOperation({ summary: 'Actualiza una receta. Solo el médico prescriptor puede modificarla.' })
  @ApiResponse({ status: 200, description: 'Receta actualizada.' })
  @ApiResponse({ status: 400, description: 'Paciente o médico inactivo.' })
  @ApiResponse({ status: 403, description: 'La receta pertenece a otro médico.' })
  @ApiResponse({ status: 404, description: 'Receta no encontrada.' })
  update(
    @Param('id') id: string,
    @Body() updateRecetaDto: UpdateRecetaDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ) {
    return this.recetasService.update(id, updateRecetaDto, currentUser);
  }
}
