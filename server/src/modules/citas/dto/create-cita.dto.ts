import { IsArray, IsDateString, IsIn, IsNotEmpty, IsOptional, IsString, IsUUID, Matches } from 'class-validator';

export const CITA_ESTADOS = ['pendiente', 'confirmada', 'en_consulta', 'completada', 'cancelada'] as const;
const HORA_24H = /^([01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/;

export class CreateCitaDto {
  @IsUUID()
  @IsOptional()
  pacienteId?: string; // Optional if it's an admin block

  @IsUUID()
  @IsNotEmpty()
  medicoId: string;

  @IsString()
  @IsOptional()
  consultorioId?: string;

  @IsDateString()
  @IsNotEmpty()
  fecha: string;

  @IsString()
  @Matches(HORA_24H, { message: 'La hora de inicio debe tener formato HH:mm' })
  @IsNotEmpty()
  horaInicio: string;

  @IsString()
  @Matches(HORA_24H, { message: 'La hora de fin debe tener formato HH:mm' })
  @IsOptional()
  horaFin?: string;

  @IsIn(CITA_ESTADOS)
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
