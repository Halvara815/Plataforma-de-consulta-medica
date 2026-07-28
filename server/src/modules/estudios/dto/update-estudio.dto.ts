import { PartialType } from '@nestjs/mapped-types';
import { CreateEstudioDto } from './create-estudio.dto';

export class UpdateEstudioDto extends PartialType(CreateEstudioDto) {}
