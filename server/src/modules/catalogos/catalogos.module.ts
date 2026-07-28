import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CatalogosController } from './catalogos.controller';
import { CatalogosService } from './catalogos.service';
import { CatalogoClinico } from './entities/catalogo-clinico.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CatalogoClinico])],
  controllers: [CatalogosController],
  providers: [CatalogosService],
  exports: [CatalogosService],
})
export class CatalogosModule {}
