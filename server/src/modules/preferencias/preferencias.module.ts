import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocumentosModule } from '../documentos/documentos.module';
import { FirmaUsuario } from './entities/firma-usuario.entity';
import { PreferenciaUsuario } from './entities/preferencia-usuario.entity';
import { PreferenciasController } from './preferencias.controller';
import { PreferenciasService } from './preferencias.service';

@Module({
  imports: [TypeOrmModule.forFeature([PreferenciaUsuario, FirmaUsuario]), DocumentosModule],
  controllers: [PreferenciasController],
  providers: [PreferenciasService],
})
export class PreferenciasModule {}
