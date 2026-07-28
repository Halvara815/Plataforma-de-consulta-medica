import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Usuario } from './usuario.entity';

@Entity('auditoria')
@Index(['usuarioId', 'createdAt'])
@Index(['recursoTipo', 'recursoId', 'createdAt'])
export class Auditoria {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  usuarioId: string | null;

  @ManyToOne(() => Usuario, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'usuarioId' })
  usuario: Usuario | null;

  @Column()
  accion: string;

  @Column()
  recursoTipo: string;

  @Column({ nullable: true })
  recursoId: string | null;

  @Column()
  resultado: string;

  @Column({ nullable: true })
  correlationId: string | null;

  @Column('jsonb', { nullable: true })
  metadata: Record<string, string> | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
