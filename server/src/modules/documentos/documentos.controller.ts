import { BadRequestException, Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, Res, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { Request, Response } from 'express';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { DocumentosService } from './documentos.service';
import { CreateDocumentoDto } from './dto/create-documento.dto';
import { ListDocumentosQueryDto } from './dto/list-documentos-query.dto';
import { UpdateDocumentoDto } from './dto/update-documento.dto';

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('documentos')
export class DocumentosController {
  constructor(private readonly documentosService: DocumentosService) {}

  @Post()
  @RequirePermissions('documentos:escribir')
  @UseInterceptors(FileInterceptor('file', {
    storage: memoryStorage(),
    limits: { fileSize: MAX_UPLOAD_BYTES },
  }))
  create(
    @Body() dto: CreateDocumentoDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException('Debe adjuntar un archivo');
    return this.documentosService.create(dto, file);
  }

  @Get()
  @RequirePermissions('documentos:leer')
  findAllByPaciente(@Query() query: ListDocumentosQueryDto) {
    return this.documentosService.findAllByPaciente(query.pacienteId, query.estado);
  }

  @Get(':id/download')
  @RequirePermissions('documentos:leer')
  async download(@Param('id') id: string, @Req() request: Request, @Res() response: Response): Promise<void> {
    const user = request.user as { id?: string } | undefined;
    if (!user?.id) throw new BadRequestException('La sesión no es válida');
    const { documento, content } = await this.documentosService.download(id, user.id);
    const filename = documento.nombre.replace(/["\r\n]/g, '_');
    response
      .status(200)
      .type(documento.mimeType || 'application/octet-stream')
      .setHeader('Content-Length', content.length)
      .setHeader('Content-Disposition', 'attachment; filename="' + filename + '"')
      .send(content);
  }

  @Post(':id/enlace-descarga')
  @RequirePermissions('documentos:leer')
  createSignedDownloadLink(@Param('id') id: string, @Req() request: Request) {
    const user = request.user as { id?: string } | undefined;
    if (!user?.id) throw new BadRequestException('La sesión no es válida');
    return this.documentosService.createSignedDownloadLink(id, user.id).then(({ token, expiresAt }) => ({
      url: '/api/v1/documentos/descarga-firmada?token=' + encodeURIComponent(token),
      expiresAt,
    }));
  }

  @Get(':id')
  @RequirePermissions('documentos:leer')
  findOne(@Param('id') id: string) {
    return this.documentosService.findOne(id);
  }

  @Patch(':id')
  @RequirePermissions('documentos:escribir')
  update(@Param('id') id: string, @Body() dto: UpdateDocumentoDto) {
    return this.documentosService.update(id, dto);
  }

  @Delete(':id')
  @RequirePermissions('documentos:escribir')
  remove(@Param('id') id: string, @Req() request: Request) {
    const user = request.user as { id?: string } | undefined;
    if (!user?.id) throw new BadRequestException('La sesión no es válida');
    return this.documentosService.remove(id, user.id);
  }

  @Patch(':id/restaurar')
  @RequirePermissions('documentos:escribir')
  restore(@Param('id') id: string) {
    return this.documentosService.restore(id);
  }
}

@Controller('documentos')
export class DocumentosSignedDownloadController {
  constructor(private readonly documentosService: DocumentosService) {}

  @Get('descarga-firmada')
  async download(@Query('token') token: string | undefined, @Res() response: Response): Promise<void> {
    const { documento, content } = await this.documentosService.downloadWithSignedToken(token);
    const filename = documento.nombre.replace(/["\r\n]/g, '_');
    response
      .status(200)
      .type(documento.mimeType || 'application/octet-stream')
      .setHeader('Content-Length', content.length)
      .setHeader('Content-Disposition', 'attachment; filename="' + filename + '"')
      .send(content);
  }
}
