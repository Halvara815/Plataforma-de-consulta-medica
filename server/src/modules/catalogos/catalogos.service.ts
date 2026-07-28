import { Injectable } from '@nestjs/common';

@Injectable()
export class CatalogosService {
  // Nota: Para la Fase 5, podemos servir los catalogos simulando una tabla o JSON
  // En Fase 6/7 se puede migrar a entidades de TypeORM si es necesario
  private readonly catalogosMock = {
    diagnosticosCIE10: [
      { codigo: 'I10', descripcion: 'Hipertensión esencial (primaria)' },
      { codigo: 'E11', descripcion: 'Diabetes mellitus tipo 2' }
    ],
    medicamentos: [
      { nombre: 'Paracetamol', presentaciones: ['Tabletas 500mg'] },
      { nombre: 'Amoxicilina', presentaciones: ['Cápsulas 500mg'] }
    ],
    especialidades: ['Médico General', 'Cardiología', 'Pediatría'],
    consultorios: ['Consultorio 1', 'Consultorio 2', 'Consultorio 3'],
    aseguradoras: ['GNP', 'MetLife', 'AXA', 'Seguros Monterrey'],
    estadosCita: ['pendiente', 'confirmada', 'en_consulta', 'completada', 'cancelada'],
  };

  findAll() {
    return this.catalogosMock;
  }

  findByTipo(tipo: string) {
    return this.catalogosMock[tipo] || [];
  }
}
