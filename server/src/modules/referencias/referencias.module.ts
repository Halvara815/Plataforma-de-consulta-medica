import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Paciente } from '../pacientes/entities/paciente.entity';
import { Referencia } from './entities/referencia.entity';
import { ReferenciasController } from './referencias.controller';
import { ReferenciasService } from './referencias.service';

@Module({
  imports: [TypeOrmModule.forFeature([Referencia, Paciente])],
  controllers: [ReferenciasController],
  providers: [ReferenciasService],
})
export class ReferenciasModule {}
