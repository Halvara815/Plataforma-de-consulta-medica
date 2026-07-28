import { IsString, IsNotEmpty, IsOptional, IsArray, IsDateString } from 'class-validator';

export class CreateDocumentoDto {
  @IsString()
  @IsNotEmpty()
  pacienteId: string;

  @IsString()
  @IsNotEmpty()
  tipo: string; // 'imagen' | 'documento' | 'nota'

  @IsString()
  @IsNotEmpty()
  categoria: string;

  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsDateString()
  @IsNotEmpty()
  fecha: string;

  @IsString()
  @IsOptional()
  fuente?: string;

  @IsString()
  @IsOptional()
  modalidad?: string;

  @IsString()
  @IsOptional()
  tecnico?: string;

  @IsArray()
  @IsOptional()
  tags?: string[];

  @IsString()
  @IsOptional()
  descripcion?: string;

  @IsString()
  @IsOptional()
  tamano?: string;
}
