import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { DocumentosService } from './documentos.service';
import { CreateDocumentoDto } from './dto/create-documento.dto';
import { UpdateDocumentoDto } from './dto/update-documento.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';
import * as fs from 'fs';

// Helper function to ensure upload directory exists
const uploadDir = './uploads/documentos';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('documentos')
export class DocumentosController {
  constructor(private readonly documentosService: DocumentosService) {}

  @Post()
  @RequirePermissions('documentos:escribir')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: uploadDir,
      filename: (req, file, cb) => {
        const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
        cb(null, `${randomName}${extname(file.originalname)}`);
      },
    }),
  }))
  create(
    @Body() createDocumentoDto: CreateDocumentoDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('Debe adjuntar un archivo');
    }
    
    // Save the file source path and file size in the DTO
    createDocumentoDto.fuente = file.filename;
    createDocumentoDto.tamano = `${(file.size / 1024).toFixed(2)} KB`;
    
    return this.documentosService.create(createDocumentoDto);
  }

  @Get()
  @RequirePermissions('documentos:leer')
  findAllByPaciente(@Query('pacienteId') pacienteId: string) {
    return this.documentosService.findAllByPaciente(pacienteId);
  }

  @Get(':id')
  @RequirePermissions('documentos:leer')
  findOne(@Param('id') id: string) {
    return this.documentosService.findOne(id);
  }

  @Patch(':id')
  @RequirePermissions('documentos:escribir')
  update(@Param('id') id: string, @Body() updateDocumentoDto: UpdateDocumentoDto) {
    return this.documentosService.update(id, updateDocumentoDto);
  }

  @Delete(':id')
  @RequirePermissions('documentos:escribir')
  remove(@Param('id') id: string) {
    return this.documentosService.remove(id);
  }
}
