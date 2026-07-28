import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Paciente } from '../../pacientes/entities/paciente.entity';

@Entity('documentos')
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
}
