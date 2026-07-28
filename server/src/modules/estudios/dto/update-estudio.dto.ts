import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsIn, IsOptional } from 'class-validator';
import { CreateEstudioDto, ESTUDIO_ESTADOS } from './create-estudio.dto';

export class UpdateEstudioDto extends PartialType(CreateEstudioDto) {
  @ApiPropertyOptional({ enum: ESTUDIO_ESTADOS })
  @IsIn(ESTUDIO_ESTADOS)
  @IsOptional()
  estado?: string;
}
