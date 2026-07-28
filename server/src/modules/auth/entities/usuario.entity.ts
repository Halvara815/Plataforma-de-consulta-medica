import { Column, CreateDateColumn, Entity, JoinColumn, JoinTable, ManyToMany, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Medico } from '../../medicos/entities/medico.entity';
import { Rol } from './rol.entity';
import { Sesion } from './sesion.entity';

@Entity('usuarios')
export class Usuario {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ select: false })
  passwordHash: string;

  @Column()
  nombre: string;

  @Column({ default: 'activo' })
  estado: string;

  @Column({ nullable: true, unique: true })
  medicoId: string | null;

  @OneToOne(() => Medico, (medico) => medico.usuario, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'medicoId' })
  medico: Medico | null;

  @ManyToMany(() => Rol, (rol) => rol.usuarios)
  @JoinTable({
    name: 'usuario_roles',
    joinColumn: { name: 'usuarioId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'rolId', referencedColumnName: 'id' },
  })
  roles: Rol[];

  @OneToMany(() => Sesion, (sesion) => sesion.usuario)
  sesiones: Sesion[];

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
