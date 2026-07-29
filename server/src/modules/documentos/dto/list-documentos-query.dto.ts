import { IsIn, IsOptional, IsUUID } from 'class-validator';

export class ListDocumentosQueryDto {
  @IsUUID('4', { message: 'El paciente no es válido' })
  pacienteId: string;

  @IsOptional()
  @IsIn(['activo', 'eliminado'], { message: 'El estado solicitado no es válido' })
  estado?: 'activo' | 'eliminado';
}
