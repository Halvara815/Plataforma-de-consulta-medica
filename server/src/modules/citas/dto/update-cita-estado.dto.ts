import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';
import { CITA_ESTADOS } from './create-cita.dto';

export class UpdateCitaEstadoDto {
  @ApiProperty({ description: 'Nuevo estado de la cita.', enum: CITA_ESTADOS })
  @IsIn(CITA_ESTADOS)
  estado: string;
}
