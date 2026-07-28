import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConsultasService } from './consultas.service';
import { ConsultasController } from './consultas.controller';
import { Consulta } from './entities/consulta.entity';
import { ClinicalReferencesService } from '../../common/validators/clinical-references.service';
import { CatalogosModule } from '../catalogos/catalogos.module';

@Module({
  imports: [TypeOrmModule.forFeature([Consulta]), CatalogosModule],
  controllers: [ConsultasController],
  providers: [ConsultasService, ClinicalReferencesService],
  exports: [ConsultasService],
})
export class ConsultasModule {}
