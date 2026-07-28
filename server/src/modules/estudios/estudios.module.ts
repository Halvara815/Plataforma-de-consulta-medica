import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EstudiosService } from './estudios.service';
import { EstudiosController } from './estudios.controller';
import { Estudio } from './entities/estudio.entity';
import { ClinicalReferencesService } from '../../common/validators/clinical-references.service';

@Module({
  imports: [TypeOrmModule.forFeature([Estudio])],
  controllers: [EstudiosController],
  providers: [EstudiosService, ClinicalReferencesService],
  exports: [EstudiosService],
})
export class EstudiosModule {}
