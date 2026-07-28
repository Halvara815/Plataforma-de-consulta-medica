import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Sesion } from './sesion.entity';

@Entity('refresh_tokens')
@Index(['sesionId', 'consumedAt'])
export class RefreshToken {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  sesionId: string;

  @ManyToOne(() => Sesion, (sesion) => sesion.refreshTokens, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sesionId' })
  sesion: Sesion;

  @Column({ unique: true })
  tokenHash: string;

  @Column({ type: 'timestamptz' })
  expiresAt: Date;

  @Column({ type: 'timestamptz', nullable: true })
  consumedAt: Date | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
