import { Controller, Get, Post, Body, Patch, Param, UseGuards, Query } from '@nestjs/common';
import { RecetasService } from './recetas.service';
import { CreateRecetaDto } from './dto/create-receta.dto';
import { UpdateRecetaDto } from './dto/update-receta.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('recetas')
export class RecetasController {
  constructor(private readonly recetasService: RecetasService) {}

  @Post()
  @RequirePermissions('recetas:escribir')
  create(@Body() createRecetaDto: CreateRecetaDto) {
    return this.recetasService.create(createRecetaDto);
  }

  @Get()
  @RequirePermissions('recetas:leer')
  findAllByPaciente(@Query('pacienteId') pacienteId: string) {
    return this.recetasService.findAllByPaciente(pacienteId);
  }

  @Get(':id')
  @RequirePermissions('recetas:leer')
  findOne(@Param('id') id: string) {
    return this.recetasService.findOne(id);
  }

  @Patch(':id')
  @RequirePermissions('recetas:escribir')
  update(@Param('id') id: string, @Body() updateRecetaDto: UpdateRecetaDto) {
    return this.recetasService.update(id, updateRecetaDto);
  }
}
