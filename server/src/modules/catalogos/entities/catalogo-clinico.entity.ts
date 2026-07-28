import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export const CATALOGO_TIPOS = [
  'diagnosticosCIE10',
  'medicamentos',
  'interaccionesConocidas',
  'especialidades',
  'consultorios',
  'aseguradoras',
  'estadosCita',
  'categoriasDocumento',
  'estudiosCatalogo',
] as const;

export type CatalogoTipo = (typeof CATALOGO_TIPOS)[number];

@Entity('catalogos_clinicos')
@Index(['tipo', 'codigo'], { unique: true })
export class CatalogoClinico {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  tipo: CatalogoTipo;

  @Column()
  codigo: string;

  @Column()
  nombre: string;

  @Column('jsonb', { nullable: true })
  metadata: Record<string, unknown> | null;

  @Column({ default: 'activo' })
  estado: 'activo' | 'inactivo';

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
