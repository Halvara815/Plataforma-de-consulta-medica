import { IsString, IsNotEmpty, IsOptional, IsArray } from 'class-validator';

export class CreateEstudioDto {
  @IsString()
  @IsNotEmpty()
  pacienteId: string;

  @IsString()
  @IsNotEmpty()
  medicoId: string;

  @IsString()
  @IsNotEmpty()
  fecha: string;

  @IsString()
  @IsNotEmpty()
  tipoEstudio: string; // 'imagen' | 'laboratorio'

  @IsArray()
  @IsOptional()
  estudiosSolicitados?: string[];

  @IsString()
  @IsOptional()
  prioridad?: string;

  @IsString()
  @IsOptional()
  estado?: string;

  @IsString()
  @IsOptional()
  notas?: string;
}
