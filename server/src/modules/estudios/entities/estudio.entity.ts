import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Paciente } from '../../pacientes/entities/paciente.entity';
import { Medico } from '../../medicos/entities/medico.entity';

@Entity('estudios')
export class Estudio {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Paciente, paciente => paciente.estudios)
  @JoinColumn({ name: 'pacienteId' })
  paciente: Paciente;

  @Column()
  pacienteId: string;

  @ManyToOne(() => Medico, medico => medico.estudios)
  @JoinColumn({ name: 'medicoId' })
  medico: Medico;

  @Column()
  medicoId: string;

  @Column({ type: 'date' })
  fecha: string;

  @Column()
  tipoEstudio: string; // 'imagen' | 'laboratorio'

  @Column('text', { array: true, nullable: true })
  estudiosSolicitados: string[];

  @Column({ default: 'rutina' })
  prioridad: string;

  @Column({ default: 'solicitado' })
  estado: string;

  @Column({ type: 'text', nullable: true })
  notas: string;
}
