import { Controller, Get, Param, Patch, Body, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { MedicosService } from './medicos.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';
import { UpdateMedicoDto } from './dto/update-medico.dto';

@ApiTags('medicos')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('medicos')
export class MedicosController {
  constructor(private readonly medicosService: MedicosService) {}

  @Get()
  @ApiOperation({ summary: 'Lista el directorio de médicos.' })
  @ApiResponse({ status: 200, description: 'Listado de médicos.' })
  findAll(@Req() request: Request) {
    return this.medicosService.findAll(this.canManageUsers(request));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtiene un médico por ID.' })
  @ApiResponse({ status: 200, description: 'Médico encontrado.' })
  @ApiResponse({ status: 404, description: 'Médico no encontrado.' })
  findOne(@Param('id') id: string, @Req() request: Request) {
    return this.medicosService.findOne(id, this.canManageUsers(request));
  }

  @Patch(':id')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('usuarios:gestionar')
  @ApiOperation({ summary: 'Edita y activa cuentas de médicos.' })
  update(@Param('id') id: string, @Body() dto: UpdateMedicoDto) {
    return this.medicosService.updateByAdmin(id, dto);
  }

  private canManageUsers(request: Request): boolean {
    const user = request.user as { permisos?: string[] } | undefined;
    return Boolean(user?.permisos?.includes('usuarios:gestionar'));
  }
}
