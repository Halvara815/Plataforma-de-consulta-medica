import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Paciente } from '../../pacientes/entities/paciente.entity';
import { Medico } from '../../medicos/entities/medico.entity';

@Entity('consultas')
export class Consulta {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Paciente, paciente => paciente.consultas)
  @JoinColumn({ name: 'pacienteId' })
  paciente: Paciente;

  @Column()
  pacienteId: string;

  @ManyToOne(() => Medico, medico => medico.consultas)
  @JoinColumn({ name: 'medicoId' })
  medico: Medico;

  @Column()
  medicoId: string;

  @Column({ type: 'timestamp' })
  fecha: Date;

  @Column()
  tipo: string; // 'inicial' | 'control' | 'seguimiento'

  @Column({ type: 'text', nullable: true })
  motivoConsulta: string;

  @Column({ type: 'text', nullable: true })
  padecimientoActual: string;

  @Column('text', { array: true, nullable: true })
  sintomas: string[];

  @Column('jsonb', { nullable: true })
  signosVitales: object;

  @Column({ type: 'text', nullable: true })
  exploracionFisica: string;

  @Column('jsonb', { nullable: true })
  antecedentes: object;

  @Column('jsonb', { nullable: true })
  diagnosticos: object[];

  @Column('text', { array: true, nullable: true })
  planTerapeutico: string[];

  @Column({ type: 'text', nullable: true })
  notas: string;

  @Column({ nullable: true })
  duracion: string;

  @Column({ default: 'en_curso' })
  estado: string;
}
