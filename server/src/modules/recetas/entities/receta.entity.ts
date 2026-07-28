import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Paciente } from '../../pacientes/entities/paciente.entity';
import { Medico } from '../../medicos/entities/medico.entity';

@Entity('recetas')
export class Receta {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  folio: string;

  @ManyToOne(() => Paciente, paciente => paciente.recetas)
  @JoinColumn({ name: 'pacienteId' })
  paciente: Paciente;

  @Column()
  pacienteId: string;

  @ManyToOne(() => Medico, medico => medico.recetas)
  @JoinColumn({ name: 'medicoId' })
  medico: Medico;

  @Column()
  medicoId: string;

  @Column({ type: 'date' })
  fecha: string;

  @Column()
  tipo: string; // 'ambulatoria' | 'controlado'

  @Column({ type: 'int', nullable: true })
  vigenciaDias: number;

  @Column('jsonb', { nullable: true })
  medicamentos: object[];

  @Column('jsonb', { nullable: true })
  interacciones: object[];

  @Column({ type: 'text', nullable: true })
  notasPaciente: string;

  @Column('jsonb', { nullable: true })
  firma: object;

  @Column({ default: 'activa' })
  estado: string;
}
