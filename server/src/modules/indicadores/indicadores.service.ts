import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cita } from '../citas/entities/cita.entity';
import { Consulta } from '../consultas/entities/consulta.entity';
import { Estudio } from '../estudios/entities/estudio.entity';
import { Medico } from '../medicos/entities/medico.entity';
import { Paciente } from '../pacientes/entities/paciente.entity';
import { Receta } from '../recetas/entities/receta.entity';

type Conteo = { label: string; value: number };

@Injectable()
export class IndicadoresService {
  constructor(
    @InjectRepository(Paciente)
    private readonly pacientesRepository: Repository<Paciente>,
    @InjectRepository(Cita)
    private readonly citasRepository: Repository<Cita>,
    @InjectRepository(Consulta)
    private readonly consultasRepository: Repository<Consulta>,
    @InjectRepository(Receta)
    private readonly recetasRepository: Repository<Receta>,
    @InjectRepository(Estudio)
    private readonly estudiosRepository: Repository<Estudio>,
    @InjectRepository(Medico)
    private readonly medicosRepository: Repository<Medico>,
  ) {}

  async dashboard(fecha = this.localDate()): Promise<Record<string, unknown>> {
    const [totalPacientes, pacientesActivos, recetasEmitidas, estudiosPendientes, citas, recientes, alertas, consultas] = await Promise.all([
      this.pacientesRepository.count(),
      this.pacientesRepository.count({ where: { estado: 'activo' } }),
      this.recetasRepository.count(),
      this.estudiosRepository.createQueryBuilder('estudio').where('estudio.estado != :estado', { estado: 'completado' }).getCount(),
      this.citasRepository.find({
        where: { fecha },
        relations: ['paciente'],
        order: { horaInicio: 'ASC' },
      }),
      this.pacientesRepository.find({
        select: ['id', 'nombre', 'apellidos', 'fechaRegistro'],
        order: { fechaRegistro: 'DESC' },
        take: 5,
      }),
      this.pacientesRepository.find({
        where: { estado: 'activo' },
        select: ['id', 'nombre', 'apellidos', 'alertas'],
      }),
      this.consultasLastSevenDays(fecha),
    ]);

    return {
      fecha,
      pacientes: {
        total: totalPacientes,
        activos: pacientesActivos,
        recientes: recientes.map((paciente) => ({
          id: paciente.id,
          nombre: paciente.nombre,
          apellidos: paciente.apellidos,
          fechaRegistro: paciente.fechaRegistro,
        })),
      },
      citas: {
        total: citas.length,
        items: citas.map((cita) => ({
          id: cita.id,
          pacienteId: cita.pacienteId,
          paciente: cita.paciente ? {
            id: cita.paciente.id,
            nombre: cita.paciente.nombre,
            apellidos: cita.paciente.apellidos,
          } : null,
          horaInicio: cita.horaInicio,
          motivo: cita.motivo,
          estado: cita.estado,
        })),
      },
      seguimientos: {
        alertas: this.activeAlerts(alertas),
        estudiosPendientes,
      },
      recetasEmitidas,
      consultas,
    };
  }

  async reportes(): Promise<Record<string, unknown>> {
    const [totalPacientes, pacientesActivos, recetasEmitidas, estudiosSolicitados, citas, consultas, medicos] = await Promise.all([
      this.pacientesRepository.count(),
      this.pacientesRepository.count({ where: { estado: 'activo' } }),
      this.recetasRepository.count(),
      this.estudiosRepository.count(),
      this.citasRepository.find({ select: ['estado'] }),
      this.consultasRepository.find({ select: ['fecha', 'diagnosticos', 'medicoId'] }),
      this.medicosRepository.find({ select: ['id', 'nombre'] }),
    ]);

    const nombresMedicos = new Map(medicos.map((medico) => [medico.id, medico.nombre]));
    return {
      totales: {
        consultas: consultas.length,
        pacientes: totalPacientes,
        pacientesActivos,
        recetas: recetasEmitidas,
        estudios: estudiosSolicitados,
      },
      consultasPorDia: this.countByDate(consultas),
      diagnosticosFrecuentes: this.diagnosisCounts(consultas),
      citasPorEstado: this.countBy(citas, (cita) => cita.estado),
      consultasPorMedico: this.countBy(consultas, (consulta) => consulta.medicoId)
        .map((item) => ({ label: nombresMedicos.get(item.label) ?? item.label, value: item.value })),
    };
  }

  private async consultasLastSevenDays(fecha: string): Promise<{ porDia: Conteo[]; diagnosticosFrecuentes: Conteo[] }> {
    const end = new Date(`${fecha}T23:59:59.999Z`);
    const start = new Date(`${fecha}T00:00:00.000Z`);
    start.setUTCDate(start.getUTCDate() - 6);
    const consultas = await this.consultasRepository
      .createQueryBuilder('consulta')
      .select(['consulta.fecha', 'consulta.diagnosticos'])
      .where('consulta.fecha >= :start AND consulta.fecha <= :end', { start, end })
      .getMany();

    const porDia = Array.from({ length: 7 }, (_, index) => {
      const day = new Date(start);
      day.setUTCDate(start.getUTCDate() + index);
      const label = day.toISOString().slice(0, 10);
      return { label, value: consultas.filter((consulta) => consulta.fecha.toISOString().slice(0, 10) === label).length };
    });

    return { porDia, diagnosticosFrecuentes: this.diagnosisCounts(consultas) };
  }

  private activeAlerts(pacientes: Paciente[]): Array<Record<string, string>> {
    return pacientes.flatMap((paciente) => (Array.isArray(paciente.alertas) ? paciente.alertas : [])
      .filter((alerta: any) => alerta?.activa !== false)
      .map((alerta: any) => ({
        pacienteId: paciente.id,
        nombre: paciente.nombre,
        apellidos: paciente.apellidos,
        tipo: String(alerta.tipo ?? 'Seguimiento'),
        descripcion: String(alerta.descripcion ?? alerta.mensaje ?? 'Requiere atención'),
      })))
      .slice(0, 5);
  }

  private diagnosisCounts(consultas: Pick<Consulta, 'diagnosticos'>[]): Conteo[] {
    const counts = new Map<string, number>();
    for (const consulta of consultas) {
      for (const diagnostico of Array.isArray(consulta.diagnosticos) ? consulta.diagnosticos : []) {
        const value = diagnostico as { descripcion?: unknown; codigo?: unknown };
        const label = String(value.descripcion ?? value.codigo ?? 'Sin descripción');
        counts.set(label, (counts.get(label) ?? 0) + 1);
      }
    }
    return [...counts.entries()]
      .sort(([, first], [, second]) => second - first)
      .slice(0, 8)
      .map(([label, value]) => ({ label, value }));
  }

  private countBy<T>(items: T[], selector: (item: T) => string): Conteo[] {
    const counts = new Map<string, number>();
    for (const item of items) {
      const label = selector(item);
      counts.set(label, (counts.get(label) ?? 0) + 1);
    }
    return [...counts.entries()]
      .sort(([, first], [, second]) => second - first)
      .map(([label, value]) => ({ label, value }));
  }

  private countByDate(consultas: Pick<Consulta, 'fecha'>[]): Conteo[] {
    return this.countBy(consultas, (consulta) => consulta.fecha.toISOString().slice(0, 10));
  }

  private localDate(): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  }
}
