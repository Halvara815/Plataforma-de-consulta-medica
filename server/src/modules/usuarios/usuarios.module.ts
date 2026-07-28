import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Auditoria } from '../auth/entities/auditoria.entity';
import { Rol } from '../auth/entities/rol.entity';
import { Sesion } from '../auth/entities/sesion.entity';
import { Usuario } from '../auth/entities/usuario.entity';
import { Medico } from '../medicos/entities/medico.entity';
import { AuditoriaController } from './auditoria.controller';
import { UsuariosController } from './usuarios.controller';
import { UsuariosService } from './usuarios.service';

@Module({
  imports: [TypeOrmModule.forFeature([Usuario, Rol, Medico, Sesion, Auditoria])],
  controllers: [UsuariosController, AuditoriaController],
  providers: [UsuariosService],
})
export class UsuariosModule {}
