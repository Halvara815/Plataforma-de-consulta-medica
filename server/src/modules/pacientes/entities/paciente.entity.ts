import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { Cita } from '../../citas/entities/cita.entity';
import { Consulta } from '../../consultas/entities/consulta.entity';
import { Receta } from '../../recetas/entities/receta.entity';
import { Documento } from '../../documentos/entities/documento.entity';
import { Estudio } from '../../estudios/entities/estudio.entity';

@Entity('pacientes')
export class Paciente {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  nombre: string;

  @Column()
  apellidos: string;

  @Column({ type: 'date' })
  fechaNacimiento: string;

  @Column()
  sexo: string;

  @Column({ nullable: true })
  estadoCivil: string;

  @Column({ nullable: true })
  grupoSanguineo: string;

  @Column({ nullable: true })
  curp: string;

  @Column({ nullable: true })
  nss: string;

  @Column({ nullable: true })
  foto: string;

  @Column('jsonb', { nullable: true })
  contacto: object;

  @Column('jsonb', { nullable: true })
  aseguradora: object;

  @Column('jsonb', { nullable: true })
  contactoEmergencia: object;

  @Column('jsonb', { nullable: true, array: false })
  alergias: object[];

  @Column('jsonb', { nullable: true, array: false })
  alertas: object[];

  @Column({ default: 'activo' })
  estado: string;

  @CreateDateColumn({ type: 'timestamptz' })
  fechaRegistro: Date;

  // Relaciones inversas
  @OneToMany(() => Cita, cita => cita.paciente)
  citas: Cita[];

  @OneToMany(() => Consulta, consulta => consulta.paciente)
  consultas: Consulta[];

  @OneToMany(() => Receta, receta => receta.paciente)
  recetas: Receta[];

  @OneToMany(() => Documento, doc => doc.paciente)
  documentos: Documento[];

  @OneToMany(() => Estudio, estudio => estudio.paciente)
  estudios: Estudio[];
}
