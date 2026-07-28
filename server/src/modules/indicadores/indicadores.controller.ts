import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';
import { DashboardQueryDto } from './dto/dashboard-query.dto';
import { IndicadoresService } from './indicadores.service';

const PERMISOS_INDICADORES = [
  'pacientes:leer',
  'citas:leer',
  'consultas:leer',
  'recetas:leer',
  'estudios:leer',
];

@ApiTags('indicadores')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('indicadores')
export class IndicadoresController {
  constructor(private readonly indicadoresService: IndicadoresService) {}

  @Get('dashboard')
  @RequirePermissions(...PERMISOS_INDICADORES)
  @ApiOperation({ summary: 'Obtiene los indicadores agregados necesarios para el panel general.' })
  dashboard(@Query() query: DashboardQueryDto) {
    return this.indicadoresService.dashboard(query.fecha);
  }

  @Get('reportes')
  @RequirePermissions(...PERMISOS_INDICADORES)
  @ApiOperation({ summary: 'Obtiene estadísticas agregadas para la pantalla de reportes.' })
  reportes() {
    return this.indicadoresService.reportes();
  }
}
