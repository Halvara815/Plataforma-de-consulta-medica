import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Paciente } from '../../pacientes/entities/paciente.entity';

@Entity('referencias')
export class Referencia {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  pacienteId: string;

  @ManyToOne(() => Paciente, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'pacienteId' })
  paciente: Paciente;

  @Column()
  especialidad: string;

  @Column()
  medicoDestino: string;

  @Column({ type: 'date' })
  fecha: string;

  @Column({ default: 'pendiente' })
  estado: string;

  @Column({ type: 'text' })
  motivo: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
