import { IsUUID } from 'class-validator';

export class ListReferenciasQueryDto {
  @IsUUID('4', { message: 'El paciente no es válido' })
  pacienteId: string;
}
