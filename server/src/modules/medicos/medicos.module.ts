import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MedicosService } from './medicos.service';
import { MedicosController } from './medicos.controller';
import { Medico } from './entities/medico.entity';
import { Usuario } from '../auth/entities/usuario.entity';
import { Sesion } from '../auth/entities/sesion.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Medico, Usuario, Sesion])],
  controllers: [MedicosController],
  providers: [MedicosService],
  exports: [MedicosService],
})
export class MedicosModule {}
