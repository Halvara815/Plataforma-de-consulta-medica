import { IsDateString, IsOptional } from 'class-validator';

export class DashboardQueryDto {
  @IsOptional()
  @IsDateString()
  fecha?: string;
}
