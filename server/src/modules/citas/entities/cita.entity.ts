import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Paciente } from '../../pacientes/entities/paciente.entity';
import { Medico } from '../../medicos/entities/medico.entity';

@Entity('citas')
export class Cita {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Paciente, paciente => paciente.citas, { nullable: true })
  @JoinColumn({ name: 'pacienteId' })
  paciente: Paciente;

  @Column({ nullable: true })
  pacienteId: string;

  @ManyToOne(() => Medico, medico => medico.citas)
  @JoinColumn({ name: 'medicoId' })
  medico: Medico;

  @Column()
  medicoId: string;

  @Column({ nullable: true })
  consultorioId: string;

  @Column({ type: 'date' })
  fecha: string;

  @Column({ type: 'time' })
  horaInicio: string;

  @Column({ type: 'time', nullable: true })
  horaFin: string;

  @Column({ nullable: true })
  motivo: string;

  @Column({ default: 'pendiente' })
  estado: string;

  @Column({ type: 'text', nullable: true })
  notas: string;

  @Column('jsonb', { nullable: true })
  recordatorios: object[];
}
