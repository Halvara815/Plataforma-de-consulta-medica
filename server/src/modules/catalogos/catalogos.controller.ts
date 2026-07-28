import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { CreateCatalogoDto } from './dto/create-catalogo.dto';
import { UpdateCatalogoDto } from './dto/update-catalogo.dto';
import { CatalogosService } from './catalogos.service';

@ApiTags('catalogos')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('catalogos')
export class CatalogosController {
  constructor(private readonly catalogosService: CatalogosService) {}

  @Get()
  @RequirePermissions('catalogos:leer')
  @ApiOperation({ summary: 'Obtiene los catálogos clínicos activos para la interfaz.' })
  findAll() {
    return this.catalogosService.findAll();
  }

  @Get('entradas/:tipo')
  @RequirePermissions('catalogos:gestionar')
  @ApiOperation({ summary: 'Lista todas las entradas de un catálogo, incluidas las inactivas.' })
  findEntries(@Param('tipo') tipo: string) {
    return this.catalogosService.findEntries(tipo);
  }

  @Post('entradas')
  @RequirePermissions('catalogos:gestionar')
  @ApiOperation({ summary: 'Agrega una entrada a un catálogo clínico.' })
  create(@Body() dto: CreateCatalogoDto) {
    return this.catalogosService.create(dto);
  }

  @Patch('entradas/:id')
  @RequirePermissions('catalogos:gestionar')
  @ApiOperation({ summary: 'Actualiza o desactiva una entrada de catálogo.' })
  update(@Param('id') id: string, @Body() dto: UpdateCatalogoDto) {
    return this.catalogosService.update(id, dto);
  }

  @Get(':tipo')
  @RequirePermissions('catalogos:leer')
  findByTipo(@Param('tipo') tipo: string) {
    return this.catalogosService.findByTipo(tipo);
  }
}
