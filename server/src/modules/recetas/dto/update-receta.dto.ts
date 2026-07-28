import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsIn, IsOptional } from 'class-validator';
import { CreateRecetaDto, RECETA_ESTADOS } from './create-receta.dto';

export class UpdateRecetaDto extends PartialType(CreateRecetaDto) {
  @ApiPropertyOptional({ enum: RECETA_ESTADOS })
  @IsIn(RECETA_ESTADOS)
  @IsOptional()
  estado?: string;
}
