# Guía de Trabajo: Fase 3 — Base de Datos y Entidades (TypeORM)

> **Objetivo:** Traducir los esquemas JSON (`src/data/*.json`) a entidades relacionales en PostgreSQL usando TypeORM y NestJS.

## 1. Diseño Entidad-Relación (ER)

El análisis de la estructura actual (Fase 1) determinó las siguientes entidades base:
- **Paciente** (`PatientEntity`)
- **Médico** (`DoctorEntity`)
- **Cita** (`AppointmentEntity`)
- **Consulta** (`EncounterEntity`)
- **Receta** (`PrescriptionEntity`)
- **Documento** (`DocumentEntity`)
- **Estudio** (`StudyEntity`)
- **Catálogo** (`CatalogEntity` o Enums)

## 2. Creación de Entidades TypeORM

### Ejemplo: Entidad `Paciente` (`server/src/modules/pacientes/entities/paciente.entity.ts`)

```typescript
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { Cita } from '../../citas/entities/cita.entity';

@Entity('pacientes')
export class Paciente {
  // El sistema actual usa strings como "PAC-0001", se recomienda migrar a UUID para producción
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

  @Column('jsonb', { nullable: true })
  contacto: object;

  @Column('jsonb', { nullable: true })
  alergias: object[];

  @CreateDateColumn()
  fechaRegistro: Date;

  // Relaciones
  @OneToMany(() => Cita, cita => cita.paciente)
  citas: Cita[];
}
```

### Ejemplo: Entidad `Cita` (`server/src/modules/citas/entities/cita.entity.ts`)

```typescript
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Paciente } from '../../pacientes/entities/paciente.entity';
// Import Médico...

@Entity('citas')
export class Cita {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Paciente, paciente => paciente.citas)
  @JoinColumn({ name: 'pacienteId' })
  paciente: Paciente;

  @Column()
  pacienteId: string; // Foreign key

  @Column({ type: 'date' })
  fecha: string;

  @Column({ type: 'time' })
  horaInicio: string;

  @Column()
  estado: string; // Usar un Enum: 'confirmada' | 'pendiente' | 'en_consulta' | etc.
}
```

## 3. Catálogos: ¿Enums o Tablas?

Los catálogos actuales (`src/data/catalogos.json`) como *Especialidades*, *Consultorios*, *Estados de Cita* tienen un conjunto fijo de valores.
- **Recomendación:** Implementarlos como `enum` de TypeScript y columnas `enum` en Postgres para aquellos que rara vez cambian (ej. Estados de Cita, Categorías de Documentos).
- Para diccionarios grandes como *Diagnósticos CIE10* o *Medicamentos*, es mejor crear entidades `DiagnosticoCIE10` y poblar una tabla de búsqueda (lookup table) mediante seeders.

## 4. Script de Migración (Seeders)

Una vez que las entidades estén listas, se debe crear un script/seeder que lea los archivos `.json` originales (ubicados en `src/data/`) y haga los `INSERT` a Postgres usando TypeORM, reemplazando los IDs antiguos (`PAC-0001`) por UUIDs si se decide usar UUID (y manteniendo las relaciones correctas).

## 5. Criterios de Aceptación para esta Fase
- [ ] Todas las entidades correspondientes a los JSON están creadas con decorators de TypeORM.
- [ ] Las relaciones `OneToMany` / `ManyToOne` (ej. Paciente -> Citas, Médico -> Citas) están definidas correctamente en las clases.
- [ ] TypeORM sincroniza la base de datos (o mediante migraciones generadas) creando las tablas en PostgreSQL.
- [ ] Se crea un script de seeding que puede inyectar los datos demo (`.json`) a PostgreSQL con éxito.
