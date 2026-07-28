import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { CatalogosService } from './catalogos.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('catalogos')
export class CatalogosController {
  constructor(private readonly catalogosService: CatalogosService) {}

  @Get()
  findAll() {
    return this.catalogosService.findAll();
  }

  @Get(':tipo')
  findByTipo(@Param('tipo') tipo: string) {
    return this.catalogosService.findByTipo(tipo);
  }
}
