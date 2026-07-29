import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Usuario } from '../../auth/entities/usuario.entity';

@Entity('firmas_usuario')
@Index(['usuarioId', 'createdAt'])
export class FirmaUsuario {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  usuarioId: string;

  @ManyToOne(() => Usuario, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'usuarioId' })
  usuario: Usuario;

  @Column()
  nombre: string;

  @Column({ select: false })
  storageKey: string;

  @Column()
  mimeType: string;

  @Column({ type: 'integer' })
  sizeBytes: number;

  @Column({ select: false })
  checksum: string;

  @Column({ nullable: true })
  scanStatus: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  scannedAt: Date | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
