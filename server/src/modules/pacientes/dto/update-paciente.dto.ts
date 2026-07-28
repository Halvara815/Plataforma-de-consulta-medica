import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { CreatePacienteDto } from './create-paciente.dto';
import { IsOptional, IsString } from 'class-validator';

export class UpdatePacienteDto extends PartialType(CreatePacienteDto) {
  @ApiPropertyOptional({ description: 'Estado del paciente.', enum: ['activo', 'inactivo'] })
  @IsString()
  @IsOptional()
  estado?: string;
}
