import AppDataSource from '../data-source';
import { Cita } from '../../modules/citas/entities/cita.entity';
import { Consulta } from '../../modules/consultas/entities/consulta.entity';
import { Documento } from '../../modules/documentos/entities/documento.entity';
import { Estudio } from '../../modules/estudios/entities/estudio.entity';
import { Medico } from '../../modules/medicos/entities/medico.entity';
import { Paciente } from '../../modules/pacientes/entities/paciente.entity';
import { Receta } from '../../modules/recetas/entities/receta.entity';
import { Permiso } from '../../modules/auth/entities/permiso.entity';
import { Rol } from '../../modules/auth/entities/rol.entity';
import { Usuario } from '../../modules/auth/entities/usuario.entity';
import { hashPassword } from '../../modules/auth/password-hash';

const SEED_LABEL = 'Datos sintéticos de desarrollo; no corresponden a personas reales.';

async function run(): Promise<void> {
  await AppDataSource.initialize();

  try {
    await AppDataSource.transaction(async (manager) => {
      const medicos = manager.getRepository(Medico);
      const pacientes = manager.getRepository(Paciente);
      const citas = manager.getRepository(Cita);
      const consultas = manager.getRepository(Consulta);
      const recetas = manager.getRepository(Receta);
      const estudios = manager.getRepository(Estudio);
      const documentos = manager.getRepository(Documento);
      const permisos = manager.getRepository(Permiso);
      const roles = manager.getRepository(Rol);
      const usuarios = manager.getRepository(Usuario);

      const medicosPorClave: Record<string, Medico> = {};
      const datosMedicos = [
        {
          clave: 'general',
          nombre: 'Dra. Elena Demo',
          especialidad: 'Medicina General',
          cedula: 'DEMO-MED-001',
          consultorio: 'Consultorio 1',
          estado: 'activo',
        },
        {
          clave: 'pediatria',
          nombre: 'Dr. Marco Ejemplo',
          especialidad: 'Pediatría',
          cedula: 'DEMO-MED-002',
          consultorio: 'Consultorio 2',
          estado: 'activo',
        },
        {
          clave: 'cardiologia',
          nombre: 'Dra. Sofía Prueba',
          especialidad: 'Cardiología',
          cedula: 'DEMO-MED-003',
          consultorio: 'Consultorio 3',
          estado: 'activo',
        },
      ];

      for (const { clave, ...datosMedico } of datosMedicos) {
        const existente = await medicos.findOneBy({ cedula: datosMedico.cedula });
        medicosPorClave[clave] = existente ?? await medicos.save(medicos.create(datosMedico));
      }

      const definicionesPermisos = [
        ['pacientes:leer', 'Consultar pacientes'],
        ['pacientes:escribir', 'Crear y modificar pacientes'],
        ['citas:leer', 'Consultar agenda'],
        ['citas:escribir', 'Crear y modificar citas'],
        ['consultas:leer', 'Consultar notas clínicas'],
        ['consultas:escribir', 'Crear y modificar consultas'],
        ['recetas:leer', 'Consultar recetas'],
        ['recetas:escribir', 'Crear y modificar recetas'],
        ['estudios:leer', 'Consultar estudios'],
        ['estudios:escribir', 'Crear y modificar estudios'],
        ['documentos:leer', 'Consultar documentos'],
        ['documentos:escribir', 'Cargar y modificar documentos'],
        ['usuarios:gestionar', 'Administrar usuarios y roles'],
        ['catalogos:leer', 'Consultar catálogos clínicos'],
        ['catalogos:gestionar', 'Administrar catálogos clínicos'],
        ['auditoria:leer', 'Consultar auditoría'],
      ] as const;
      const permisosPorClave: Record<string, Permiso> = {};
      for (const [clave, descripcion] of definicionesPermisos) {
        const existente = await permisos.findOneBy({ clave });
        permisosPorClave[clave] = existente ?? await permisos.save(permisos.create({ clave, descripcion }));
      }

      const permisosMedico = [
        'pacientes:leer', 'pacientes:escribir',
        'citas:leer', 'citas:escribir',
        'consultas:leer', 'consultas:escribir',
        'recetas:leer', 'recetas:escribir',
        'estudios:leer', 'estudios:escribir',
        'documentos:leer', 'documentos:escribir',
        'catalogos:leer',
      ];
      const definicionesRoles = [
        { nombre: 'ADMIN', descripcion: 'Administración completa de desarrollo', permisos: Object.keys(permisosPorClave) },
        { nombre: 'MEDICO', descripcion: 'Atención clínica', permisos: permisosMedico },
        { nombre: 'ASISTENTE', descripcion: 'Apoyo administrativo', permisos: ['pacientes:leer', 'pacientes:escribir', 'citas:leer', 'citas:escribir', 'catalogos:leer'] },
      ];
      const rolesPorNombre: Record<string, Rol> = {};
      for (const definicionRol of definicionesRoles) {
        const existente = await roles.findOne({ where: { nombre: definicionRol.nombre }, relations: ['permisos'] });
        const rol = existente ?? roles.create({ nombre: definicionRol.nombre, descripcion: definicionRol.descripcion });
        rol.descripcion = definicionRol.descripcion;
        rol.permisos = definicionRol.permisos.map((clave) => permisosPorClave[clave]);
        rolesPorNombre[rol.nombre] = await roles.save(rol);
      }

      const adminEmail = process.env.DEV_SEED_ADMIN_EMAIL?.trim().toLowerCase();
      const adminPassword = process.env.DEV_SEED_ADMIN_PASSWORD;
      if (!adminEmail || !adminPassword) {
        throw new Error('DEV_SEED_ADMIN_EMAIL y DEV_SEED_ADMIN_PASSWORD son obligatorios para la semilla de desarrollo.');
      }
      const adminExistente = await usuarios.findOne({ where: { email: adminEmail }, relations: ['roles'] });
      if (!adminExistente) {
        await usuarios.save(usuarios.create({
          email: adminEmail,
          passwordHash: await hashPassword(adminPassword),
          nombre: 'Dra. Elena Demo',
          estado: 'activo',
          medicoId: medicosPorClave.general.id,
          roles: [rolesPorNombre.ADMIN],
        }));
      } else {
        adminExistente.roles = [rolesPorNombre.ADMIN];
        adminExistente.estado = 'activo';
        adminExistente.medicoId = medicosPorClave.general.id;
        await usuarios.save(adminExistente);
      }

      const pacientesPorClave: Record<string, Paciente> = {};
      const datosPacientes = [
        {
          clave: 'ana',
          nombre: 'Ana',
          apellidos: 'Demostración',
          fechaNacimiento: '1988-04-12',
          sexo: 'femenino',
          estadoCivil: 'casada',
          grupoSanguineo: 'O+',
          curp: 'DEMO880412MDF001A',
          contacto: { telefono: '555-0101', email: 'ana.demo@example.test' },
          contactoEmergencia: { nombre: 'Contacto Demo', parentesco: 'familiar', telefono: '555-0191' },
          alergias: [{ sustancia: 'Penicilina', reaccion: 'Erupción cutánea', severidad: 'moderada' }],
          alertas: [{ tipo: 'demo', mensaje: SEED_LABEL }],
          estado: 'activo',
        },
        {
          clave: 'bruno',
          nombre: 'Bruno',
          apellidos: 'Prueba',
          fechaNacimiento: '1974-11-03',
          sexo: 'masculino',
          estadoCivil: 'unión libre',
          grupoSanguineo: 'A+',
          curp: 'DEMO741103HDF002B',
          contacto: { telefono: '555-0102', email: 'bruno.demo@example.test' },
          contactoEmergencia: { nombre: 'Contacto Demo', parentesco: 'pareja', telefono: '555-0192' },
          alergias: [],
          alertas: [{ tipo: 'demo', mensaje: SEED_LABEL }],
          estado: 'activo',
        },
        {
          clave: 'carla',
          nombre: 'Carla',
          apellidos: 'Muestra',
          fechaNacimiento: '2016-08-21',
          sexo: 'femenino',
          estadoCivil: 'soltera',
          grupoSanguineo: 'B+',
          curp: 'DEMO160821MDF003C',
          contacto: { telefono: '555-0103', email: 'carla.tutora@example.test' },
          contactoEmergencia: { nombre: 'Tutora Demo', parentesco: 'madre', telefono: '555-0193' },
          alergias: [{ sustancia: 'Ninguna conocida', reaccion: 'No aplica', severidad: 'ninguna' }],
          alertas: [{ tipo: 'demo', mensaje: SEED_LABEL }],
          estado: 'activo',
        },
        {
          clave: 'diego',
          nombre: 'Diego',
          apellidos: 'Ejemplo',
          fechaNacimiento: '1995-02-17',
          sexo: 'masculino',
          estadoCivil: 'soltero',
          grupoSanguineo: 'AB+',
          curp: 'DEMO950217HDF004D',
          contacto: { telefono: '555-0104', email: 'diego.demo@example.test' },
          contactoEmergencia: { nombre: 'Contacto Demo', parentesco: 'hermano', telefono: '555-0194' },
          alergias: [],
          alertas: [{ tipo: 'demo', mensaje: SEED_LABEL }],
          estado: 'activo',
        },
        {
          clave: 'elisa',
          nombre: 'Elisa',
          apellidos: 'Prototipo',
          fechaNacimiento: '1969-06-30',
          sexo: 'femenino',
          estadoCivil: 'viuda',
          grupoSanguineo: 'O-',
          curp: 'DEMO690630MDF005E',
          contacto: { telefono: '555-0105', email: 'elisa.demo@example.test' },
          contactoEmergencia: { nombre: 'Contacto Demo', parentesco: 'hija', telefono: '555-0195' },
          alergias: [{ sustancia: 'Ibuprofeno', reaccion: 'Molestia gástrica', severidad: 'leve' }],
          alertas: [{ tipo: 'demo', mensaje: SEED_LABEL }],
          estado: 'activo',
        },
      ];

      for (const { clave, ...datosPaciente } of datosPacientes) {
        const existente = await pacientes.findOneBy({ curp: datosPaciente.curp });
        pacientesPorClave[clave] = existente ?? await pacientes.save(pacientes.create(datosPaciente));
      }

      const datosCitas = [
        { paciente: 'ana', medico: 'general', consultorioId: 'Consultorio 1', fecha: '2026-07-28', horaInicio: '08:30', horaFin: '09:00', motivo: 'Consulta general de demostración', estado: 'confirmada' },
        { paciente: 'bruno', medico: 'cardiologia', consultorioId: 'Consultorio 3', fecha: '2026-07-28', horaInicio: '09:30', horaFin: '10:00', motivo: 'Seguimiento cardiovascular de demostración', estado: 'pendiente' },
        { paciente: 'carla', medico: 'pediatria', consultorioId: 'Consultorio 2', fecha: '2026-07-28', horaInicio: '11:00', horaFin: '11:30', motivo: 'Control pediátrico de demostración', estado: 'confirmada' },
        { paciente: 'diego', medico: 'general', consultorioId: 'Consultorio 1', fecha: '2026-07-29', horaInicio: '15:00', horaFin: '15:30', motivo: 'Consulta de seguimiento de demostración', estado: 'pendiente' },
        { paciente: 'elisa', medico: 'cardiologia', consultorioId: 'Consultorio 3', fecha: '2026-07-30', horaInicio: '10:00', horaFin: '10:30', motivo: 'Revisión de resultados de demostración', estado: 'pendiente' },
      ];

      for (const datosCita of datosCitas) {
        const paciente = pacientesPorClave[datosCita.paciente];
        const medico = medicosPorClave[datosCita.medico];
        const existente = await citas.findOneBy({ pacienteId: paciente.id, medicoId: medico.id, fecha: datosCita.fecha, horaInicio: datosCita.horaInicio });
        if (!existente) {
          await citas.save(citas.create({
            pacienteId: paciente.id,
            medicoId: medico.id,
            consultorioId: datosCita.consultorioId,
            fecha: datosCita.fecha,
            horaInicio: datosCita.horaInicio,
            horaFin: datosCita.horaFin,
            motivo: datosCita.motivo,
            estado: datosCita.estado,
            notas: SEED_LABEL,
            recordatorios: [],
          }));
        }
      }

      const datosConsultas = [
        {
          paciente: 'ana', medico: 'general', fecha: new Date('2026-07-15T14:00:00.000Z'), tipo: 'control', motivoConsulta: 'Seguimiento preventivo de demostración',
          sintomas: ['Cefalea ocasional'], signosVitales: { presionArterial: '118/76', frecuenciaCardiaca: 72, temperatura: 36.6, pesoKg: 62 },
          diagnosticos: [{ codigo: 'Z00.0', descripcion: 'Examen médico general de demostración', principal: true }], planTerapeutico: ['Mantener hábitos saludables de demostración'], estado: 'cerrada',
        },
        {
          paciente: 'bruno', medico: 'cardiologia', fecha: new Date('2026-07-18T15:30:00.000Z'), tipo: 'seguimiento', motivoConsulta: 'Control cardiovascular de demostración',
          sintomas: ['Sin síntomas de alarma'], signosVitales: { presionArterial: '128/82', frecuenciaCardiaca: 70, temperatura: 36.5, pesoKg: 81 },
          diagnosticos: [{ codigo: 'I10', descripcion: 'Hipertensión esencial (caso sintético)', principal: true }], planTerapeutico: ['Continuar plan de demostración y control programado'], estado: 'cerrada',
        },
        {
          paciente: 'carla', medico: 'pediatria', fecha: new Date('2026-07-20T16:00:00.000Z'), tipo: 'control', motivoConsulta: 'Control pediátrico de demostración',
          sintomas: [], signosVitales: { frecuenciaCardiaca: 92, temperatura: 36.7, pesoKg: 24 },
          diagnosticos: [{ codigo: 'Z00.1', descripcion: 'Control pediátrico de demostración', principal: true }], planTerapeutico: ['Seguimiento preventivo de demostración'], estado: 'cerrada',
        },
      ];

      for (const datosConsulta of datosConsultas) {
        const paciente = pacientesPorClave[datosConsulta.paciente];
        const medico = medicosPorClave[datosConsulta.medico];
        const existente = await consultas.findOneBy({ pacienteId: paciente.id, medicoId: medico.id, fecha: datosConsulta.fecha });
        if (!existente) {
          await consultas.save(consultas.create({
            pacienteId: paciente.id,
            medicoId: medico.id,
            fecha: datosConsulta.fecha,
            tipo: datosConsulta.tipo,
            motivoConsulta: datosConsulta.motivoConsulta,
            sintomas: datosConsulta.sintomas,
            signosVitales: datosConsulta.signosVitales,
            diagnosticos: datosConsulta.diagnosticos,
            planTerapeutico: datosConsulta.planTerapeutico,
            notas: SEED_LABEL,
            duracion: '30 min',
            estado: datosConsulta.estado,
          }));
        }
      }

      const datosRecetas = [
        {
          folio: 'DEMO-RX-0001', paciente: 'ana', medico: 'general', fecha: '2026-07-15', tipo: 'ambulatoria', vigenciaDias: 30,
          medicamentos: [{ nombre: 'Paracetamol', presentacion: 'Tabletas 500 mg', indicaciones: 'Uso de demostración', duracion: '3 días' }],
        },
        {
          folio: 'DEMO-RX-0002', paciente: 'bruno', medico: 'cardiologia', fecha: '2026-07-18', tipo: 'ambulatoria', vigenciaDias: 30,
          medicamentos: [{ nombre: 'Losartán', presentacion: 'Tabletas 50 mg', indicaciones: 'Caso sintético; no usar clínicamente', duracion: '30 días' }],
        },
      ];

      for (const datosReceta of datosRecetas) {
        const existente = await recetas.findOneBy({ folio: datosReceta.folio });
        if (!existente) {
          const paciente = pacientesPorClave[datosReceta.paciente];
          const medico = medicosPorClave[datosReceta.medico];
          await recetas.save(recetas.create({
            folio: datosReceta.folio,
            pacienteId: paciente.id,
            medicoId: medico.id,
            fecha: datosReceta.fecha,
            tipo: datosReceta.tipo,
            vigenciaDias: datosReceta.vigenciaDias,
            medicamentos: datosReceta.medicamentos,
            interacciones: [],
            notasPaciente: SEED_LABEL,
            firma: { tipo: 'demo', leyenda: SEED_LABEL },
            estado: 'activa',
          }));
        }
      }

      const datosEstudios = [
        { paciente: 'bruno', medico: 'cardiologia', fecha: '2026-07-18', tipoEstudio: 'laboratorio', estudiosSolicitados: ['Perfil lipídico de demostración'], prioridad: 'rutina', estado: 'solicitado' },
        { paciente: 'elisa', medico: 'cardiologia', fecha: '2026-07-22', tipoEstudio: 'imagen', estudiosSolicitados: ['Electrocardiograma de demostración'], prioridad: 'rutina', estado: 'programado' },
      ];

      for (const datosEstudio of datosEstudios) {
        const paciente = pacientesPorClave[datosEstudio.paciente];
        const medico = medicosPorClave[datosEstudio.medico];
        const existente = await estudios.findOneBy({ pacienteId: paciente.id, medicoId: medico.id, fecha: datosEstudio.fecha, tipoEstudio: datosEstudio.tipoEstudio });
        if (!existente) {
          await estudios.save(estudios.create({
            pacienteId: paciente.id,
            medicoId: medico.id,
            fecha: datosEstudio.fecha,
            tipoEstudio: datosEstudio.tipoEstudio,
            estudiosSolicitados: datosEstudio.estudiosSolicitados,
            prioridad: datosEstudio.prioridad,
            estado: datosEstudio.estado,
            notas: SEED_LABEL,
          }));
        }
      }

      const datosDocumentos = [
        { paciente: 'ana', tipo: 'nota', categoria: 'resumen', nombre: 'Resumen clínico DEMO — no usar', fecha: new Date('2026-07-15T14:30:00.000Z') },
        { paciente: 'bruno', tipo: 'documento', categoria: 'resultado', nombre: 'Resultado de laboratorio DEMO — no usar', fecha: new Date('2026-07-19T12:00:00.000Z') },
      ];

      for (const datosDocumento of datosDocumentos) {
        const paciente = pacientesPorClave[datosDocumento.paciente];
        const existente = await documentos.findOneBy({ pacienteId: paciente.id, nombre: datosDocumento.nombre });
        if (!existente) {
          await documentos.save(documentos.create({
            pacienteId: paciente.id,
            tipo: datosDocumento.tipo,
            categoria: datosDocumento.categoria,
            nombre: datosDocumento.nombre,
            fecha: datosDocumento.fecha,
            fuente: 'semilla de desarrollo',
            tags: ['demo', 'sintético', 'no-clínico'],
            descripcion: SEED_LABEL,
            tamano: '0 KB',
          }));
        }
      }
    });

    console.log('Semilla de desarrollo aplicada: 3 médicos, 5 pacientes y registros clínicos sintéticos.');
  } finally {
    await AppDataSource.destroy();
  }
}

run().catch((error: unknown) => {
  console.error('No se pudo aplicar la semilla de desarrollo.', error);
  process.exitCode = 1;
});
