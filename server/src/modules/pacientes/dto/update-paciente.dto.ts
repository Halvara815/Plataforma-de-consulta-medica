import { PartialType } from '@nestjs/mapped-types';
import { CreatePacienteDto } from './create-paciente.dto';
import { IsOptional, IsString } from 'class-validator';

export class UpdatePacienteDto extends PartialType(CreatePacienteDto) {
  @IsString()
  @IsOptional()
  estado?: string;
}
