import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { MedicosService } from './medicos.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('medicos')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('medicos')
export class MedicosController {
  constructor(private readonly medicosService: MedicosService) {}

  @Get()
  @ApiOperation({ summary: 'Lista el directorio de médicos.' })
  @ApiResponse({ status: 200, description: 'Listado de médicos.' })
  findAll() {
    return this.medicosService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtiene un médico por ID.' })
  @ApiResponse({ status: 200, description: 'Médico encontrado.' })
  @ApiResponse({ status: 404, description: 'Médico no encontrado.' })
  findOne(@Param('id') id: string) {
    return this.medicosService.findOne(id);
  }
}
