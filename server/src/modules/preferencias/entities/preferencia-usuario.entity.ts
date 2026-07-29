import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Usuario } from '../../auth/entities/usuario.entity';

export type NotaPersonal = {
  id: string;
  titulo: string;
  cuerpo: string;
  fecha: string;
};

export type RecordatorioPersonal = {
  id: string;
  titulo: string;
  fecha: string;
  done: boolean;
};

export type PlantillaPersonal = {
  id: string;
  titulo: string;
  cuerpo: string;
};

@Entity('preferencias_usuario')
@Index(['usuarioId'], { unique: true })
export class PreferenciaUsuario {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  usuarioId: string;

  @ManyToOne(() => Usuario, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'usuarioId' })
  usuario: Usuario;

  @Column({ default: 'system' })
  tema: 'light' | 'dark' | 'system';

  @Column({ default: true })
  sonidoTemporizador: boolean;

  @Column('jsonb', { default: () => "'[]'::jsonb" })
  notas: NotaPersonal[];

  @Column('jsonb', { default: () => "'[]'::jsonb" })
  recordatorios: RecordatorioPersonal[];

  @Column('jsonb', { default: () => "'[]'::jsonb" })
  plantillas: PlantillaPersonal[];

  @Column('text', { array: true, default: () => "ARRAY[]::text[]" })
  favoritos: string[];

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
