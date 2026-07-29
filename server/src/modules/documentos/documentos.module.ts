import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocumentosService } from './documentos.service';
import { DocumentosController, DocumentosSignedDownloadController } from './documentos.controller';
import { Documento } from './entities/documento.entity';
import { DocumentStorageService } from './document-storage.service';
import { DocumentDownloadTokenService } from './document-download-token.service';
import { Paciente } from '../pacientes/entities/paciente.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Documento, Paciente]),
  ],
  controllers: [DocumentosSignedDownloadController, DocumentosController],
  providers: [DocumentosService, DocumentStorageService, DocumentDownloadTokenService],
  exports: [DocumentosService, DocumentStorageService],
})
export class DocumentosModule {}
