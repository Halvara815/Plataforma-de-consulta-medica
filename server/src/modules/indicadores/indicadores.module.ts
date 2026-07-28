import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cita } from '../citas/entities/cita.entity';
import { Consulta } from '../consultas/entities/consulta.entity';
import { Estudio } from '../estudios/entities/estudio.entity';
import { Medico } from '../medicos/entities/medico.entity';
import { Paciente } from '../pacientes/entities/paciente.entity';
import { Receta } from '../recetas/entities/receta.entity';
import { IndicadoresController } from './indicadores.controller';
import { IndicadoresService } from './indicadores.service';

@Module({
  imports: [TypeOrmModule.forFeature([Paciente, Cita, Consulta, Receta, Estudio, Medico])],
  controllers: [IndicadoresController],
  providers: [IndicadoresService],
})
export class IndicadoresModule {}
