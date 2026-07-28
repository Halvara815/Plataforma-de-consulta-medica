import { Entity, PrimaryGeneratedColumn, Column, OneToMany, OneToOne } from 'typeorm';
import { Cita } from '../../citas/entities/cita.entity';
import { Consulta } from '../../consultas/entities/consulta.entity';
import { Receta } from '../../recetas/entities/receta.entity';
import { Estudio } from '../../estudios/entities/estudio.entity';
import { Usuario } from '../../auth/entities/usuario.entity';

@Entity('medicos')
export class Medico {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  nombre: string;

  @Column()
  especialidad: string;

  @Column({ unique: true })
  cedula: string;

  @Column({ nullable: true })
  consultorio: string;

  @Column({ nullable: true, type: 'text' })
  firma: string;

  @Column({ default: 'activo' })
  estado: string;

  // Relaciones inversas
  @OneToMany(() => Cita, cita => cita.medico)
  citas: Cita[];

  @OneToMany(() => Consulta, consulta => consulta.medico)
  consultas: Consulta[];

  @OneToMany(() => Receta, receta => receta.medico)
  recetas: Receta[];

  @OneToMany(() => Estudio, estudio => estudio.medico)
  estudios: Estudio[];

  @OneToOne(() => Usuario, (usuario) => usuario.medico)
  usuario: Usuario;
}
