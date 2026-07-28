import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class ListEstudiosQueryDto {
  @ApiProperty({ description: 'Paciente cuyos estudios se listan.', format: 'uuid' })
  @IsUUID()
  @IsNotEmpty()
  pacienteId: string;
}
