import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class ListConsultasQueryDto {
  @ApiProperty({ description: 'Paciente cuyas consultas se listan.', format: 'uuid' })
  @IsUUID()
  @IsNotEmpty()
  pacienteId: string;
}
