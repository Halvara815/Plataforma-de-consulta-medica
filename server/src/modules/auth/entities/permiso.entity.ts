import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Rol } from './rol.entity';

@Entity('permisos')
export class Permiso {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  clave: string;

  @Column()
  descripcion: string;

  @ManyToMany(() => Rol, (rol) => rol.permisos)
  roles: Rol[];
}
