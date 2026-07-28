import { IsString, IsNotEmpty, IsOptional, IsArray } from 'class-validator';

export class CreateCitaDto {
  @IsString()
  @IsOptional()
  pacienteId?: string; // Optional if it's an admin block

  @IsString()
  @IsNotEmpty()
  medicoId: string;

  @IsString()
  @IsOptional()
  consultorioId?: string;

  @IsString()
  @IsNotEmpty()
  fecha: string;

  @IsString()
  @IsNotEmpty()
  horaInicio: string;

  @IsString()
  @IsOptional()
  horaFin?: string;

  @IsString()
  @IsOptional()
  motivo?: string;

  @IsString()
  @IsOptional()
  estado?: string;

  @IsString()
  @IsOptional()
  notas?: string;

  @IsArray()
  @IsOptional()
  recordatorios?: object[];
}
