import { IsString, IsNotEmpty, IsOptional, IsArray, IsObject, IsInt } from 'class-validator';

export class CreateRecetaDto {
  @IsString()
  @IsNotEmpty()
  folio: string;

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
  tipo: string; // 'ambulatoria' | 'controlado'

  @IsInt()
  @IsOptional()
  vigenciaDias?: number;

  @IsArray()
  @IsOptional()
  medicamentos?: object[];

  @IsArray()
  @IsOptional()
  interacciones?: object[];

  @IsString()
  @IsOptional()
  notasPaciente?: string;

  @IsObject()
  @IsOptional()
  firma?: object;

  @IsString()
  @IsOptional()
  estado?: string;
}
