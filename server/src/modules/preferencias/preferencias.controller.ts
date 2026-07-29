import { BadRequestException, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Req, Res, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { Body } from '@nestjs/common/decorators/http/route-params.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { Request, Response } from 'express';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { UpdatePreferenciasDto } from './dto/update-preferencias.dto';
import { PreferenciasService } from './preferencias.service';

const MAX_SIGNATURE_BYTES = 1 * 1024 * 1024;

@Controller('preferencias')
@UseGuards(JwtAuthGuard)
export class PreferenciasController {
  constructor(private readonly preferenciasService: PreferenciasService) {}

  @Get()
  get(@Req() request: Request) {
    return this.preferenciasService.get(this.usuarioId(request));
  }

  @Patch()
  update(@Body() dto: UpdatePreferenciasDto, @Req() request: Request) {
    return this.preferenciasService.update(this.usuarioId(request), dto);
  }

  @Delete('herramientas')
  resetHerramientas(@Req() request: Request) {
    return this.preferenciasService.resetHerramientas(this.usuarioId(request));
  }

  @Get('firmas')
  listFirmas(@Req() request: Request) {
    return this.preferenciasService.listFirmas(this.usuarioId(request));
  }

  @Post('firmas')
  @UseInterceptors(FileInterceptor('file', {
    storage: memoryStorage(),
    limits: { fileSize: MAX_SIGNATURE_BYTES },
  }))
  createFirma(@UploadedFile() file: Express.Multer.File, @Req() request: Request) {
    return this.preferenciasService.createFirma(this.usuarioId(request), file);
  }

  @Get('firmas/:id/download')
  async downloadFirma(@Param('id') id: string, @Req() request: Request, @Res() response: Response): Promise<void> {
    const { firma, content } = await this.preferenciasService.downloadFirma(id, this.usuarioId(request));
    const filename = String(firma.nombre || 'firma.png').replace(/["\r\n]/g, '_');
    response
      .status(200)
      .type(String(firma.mimeType || 'image/png'))
      .setHeader('Content-Length', content.length)
      .setHeader('Content-Disposition', 'inline; filename="' + filename + '"')
      .send(content);
  }

  @Delete('firmas/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeFirma(@Param('id') id: string, @Req() request: Request): Promise<void> {
    await this.preferenciasService.removeFirma(id, this.usuarioId(request));
  }

  private usuarioId(request: Request): string {
    const user = request.user as { id?: string } | undefined;
    if (!user?.id) throw new BadRequestException('La sesión no es válida');
    return user.id;
  }
}
