import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';
import { IsArray, IsDateString, IsIn, IsNotEmpty, IsOptional, IsString, IsUUID, Matches } from 'class-validator';

export const CITA_ESTADOS = ['pendiente', 'confirmada', 'en_consulta', 'completada', 'cancelada'] as const;
const HORA_24H = /^([01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/;

export class CreateCitaDto {
  @ApiPropertyOptional({ description: 'Paciente asociado. Opcional para bloqueos administrativos.', format: 'uuid' })
  @IsUUID()
  @IsOptional()
  pacienteId?: string; // Optional if it's an admin block

  @ApiProperty({ description: 'Médico que atiende la cita.', format: 'uuid' })
  @IsUUID()
  @IsNotEmpty()
  medicoId: string;

  @ApiPropertyOptional({ description: 'Consultorio donde se agenda la cita.' })
  @IsString()
  @IsOptional()
  consultorioId?: string;

  @ApiProperty({ description: 'Fecha de la cita (ISO 8601).', example: '2026-08-01' })
  @IsDateString()
  @IsNotEmpty()
  fecha: string;

  @ApiProperty({ description: 'Hora de inicio en formato HH:mm.', example: '09:00' })
  @IsString()
  @Matches(HORA_24H, { message: 'La hora de inicio debe tener formato HH:mm' })
  @IsNotEmpty()
  horaInicio: string;

  @ApiPropertyOptional({ description: 'Hora de fin en formato HH:mm. Por defecto, 30 minutos después de horaInicio.', example: '09:30' })
  @IsString()
  @Matches(HORA_24H, { message: 'La hora de fin debe tener formato HH:mm' })
  @IsOptional()
  horaFin?: string;

  @ApiPropertyOptional({ description: 'Motivo de la cita.' })
  @IsString()
  @IsOptional()
  motivo?: string;

  @ApiPropertyOptional({ description: 'Estado de la cita.', enum: CITA_ESTADOS, default: 'pendiente' })
  @IsString()
  @IsOptional()
  estado?: string;

  @ApiPropertyOptional({ description: 'Notas internas de la cita.' })
  @IsString()
  @IsOptional()
  notas?: string;

  @ApiPropertyOptional({ description: 'Recordatorios configurados para la cita.', type: [Object] })
  @IsArray()
  @IsOptional()
  recordatorios?: object[];
}
