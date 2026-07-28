import { IsIn } from 'class-validator';
import { CITA_ESTADOS } from './create-cita.dto';

export class UpdateCitaEstadoDto {
  @IsIn(CITA_ESTADOS)
  estado: string;
}
