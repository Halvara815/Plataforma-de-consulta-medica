import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { CreateReferenciaDto } from './dto/create-referencia.dto';
import { ListReferenciasQueryDto } from './dto/list-referencias-query.dto';
import { ReferenciasService } from './referencias.service';

@ApiTags('referencias')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('referencias')
export class ReferenciasController {
  constructor(private readonly referenciasService: ReferenciasService) {}

  @Post()
  @RequirePermissions('pacientes:escribir')
  @ApiOperation({ summary: 'Registra una referencia clínica.' })
  create(@Body() dto: CreateReferenciaDto) {
    return this.referenciasService.create(dto);
  }

  @Get()
  @RequirePermissions('pacientes:leer')
  @ApiOperation({ summary: 'Lista las referencias de un paciente.' })
  findAllByPaciente(@Query() query: ListReferenciasQueryDto) {
    return this.referenciasService.findAllByPaciente(query.pacienteId);
  }
}
