import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class ListRecetasQueryDto {
  @ApiProperty({ description: 'Paciente cuyas recetas se listan.', format: 'uuid' })
  @IsUUID()
  @IsNotEmpty()
  pacienteId: string;
}
