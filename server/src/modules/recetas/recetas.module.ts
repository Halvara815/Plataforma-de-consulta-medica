import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RecetasService } from './recetas.service';
import { RecetasController } from './recetas.controller';
import { Receta } from './entities/receta.entity';
import { ClinicalReferencesService } from '../../common/validators/clinical-references.service';

@Module({
  imports: [TypeOrmModule.forFeature([Receta])],
  controllers: [RecetasController],
  providers: [RecetasService, ClinicalReferencesService],
  exports: [RecetasService],
})
export class RecetasModule {}
