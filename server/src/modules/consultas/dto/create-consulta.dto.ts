import { IsString, IsNotEmpty, IsOptional, IsArray, IsObject, IsDateString } from 'class-validator';

export class CreateConsultaDto {
  @IsString()
  @IsNotEmpty()
  pacienteId: string;

  @IsString()
  @IsNotEmpty()
  medicoId: string;

  @IsDateString()
  @IsNotEmpty()
  fecha: string;

  @IsString()
  @IsNotEmpty()
  tipo: string; // 'inicial' | 'control' | 'seguimiento'

  @IsString()
  @IsOptional()
  motivoConsulta?: string;

  @IsString()
  @IsOptional()
  padecimientoActual?: string;

  @IsArray()
  @IsOptional()
  sintomas?: string[];

  @IsObject()
  @IsOptional()
  signosVitales?: object;

  @IsString()
  @IsOptional()
  exploracionFisica?: string;

  @IsObject()
  @IsOptional()
  antecedentes?: object;

  @IsArray()
  @IsOptional()
  diagnosticos?: object[];

  @IsArray()
  @IsOptional()
  planTerapeutico?: string[];

  @IsString()
  @IsOptional()
  notas?: string;

  @IsString()
  @IsOptional()
  duracion?: string;

  @IsString()
  @IsOptional()
  estado?: string;
}
