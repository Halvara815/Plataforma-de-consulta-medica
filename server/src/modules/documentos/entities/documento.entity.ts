import { CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, UpdateDateColumn } from 'typeorm';
import { Paciente } from '../../pacientes/entities/paciente.entity';

@Entity('documentos')
@Index(['pacienteId', 'estado', 'fecha'])
export class Documento {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Paciente, paciente => paciente.documentos)
  @JoinColumn({ name: 'pacienteId' })
  paciente: Paciente;

  @Column()
  pacienteId: string;

  @Column()
  tipo: string; // 'imagen' | 'documento' | 'nota'

  @Column()
  categoria: string;

  @Column()
  nombre: string;

  @Column({ type: 'timestamptz' })
  fecha: Date;

  @Column({ nullable: true })
  fuente: string;

  @Column({ nullable: true })
  modalidad: string;

  @Column({ nullable: true })
  tecnico: string;

  @Column('text', { array: true, nullable: true })
  tags: string[];

  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @Column({ nullable: true })
  tamano: string;

  @Column({ nullable: true, select: false })
  storageKey: string | null;

  @Column({ nullable: true })
  mimeType: string | null;

  @Column({ type: 'integer', nullable: true })
  sizeBytes: number | null;

  @Column({ nullable: true, select: false })
  checksum: string | null;

  @Column({ nullable: true })
  scanStatus: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  scannedAt: Date | null;

  @Column({ default: 'activo' })
  estado: 'activo' | 'eliminado';

  @Column({ type: 'timestamptz', nullable: true })
  deletedAt: Date | null;

  @Column({ nullable: true })
  deletedBy: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
