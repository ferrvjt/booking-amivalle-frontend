import { Injectable, signal } from '@angular/core';
import { Espacio, EstadoSolicitud, Solicitud } from './models';
import { calcularPrecio } from './pricing';

export const ESPACIOS: Espacio[] = [
  { id: 'coworking', nombre: 'Zona coworking', tarifaSemana: 2000, tarifaFinDeSemana: 2500,
    tarifaEstudianteSemana: 1000, tarifaEstudianteFinDeSemana: 1500, exclusivo: false, todoElLocal: false },
  { id: 'sala', nombre: 'Sala de reuniones', tarifaSemana: 10000, tarifaFinDeSemana: 12500,
    exclusivo: true, todoElLocal: false },
  // TODO: precio real. Estos valores son de ejemplo.
  { id: 'local', nombre: 'Todo el local', tarifaSemana: 40000, tarifaFinDeSemana: 55000,
    exclusivo: true, todoElLocal: true },
];

export const espaciosDe = (ids: string[]) => ids.map(id => ESPACIOS.find(e => e.id === id)!);
export const nombresEspacios = (ids: string[]) => espaciosDe(ids).map(e => e.nombre).join(' + ');
export const usaTodoElLocal = (ids: string[]) => espaciosDe(ids).some(e => e.todoElLocal);

function mock(id: number, espacioIds: string[], nombre: string, dia: number, h1: number, h2: number,
              est: boolean, estado: EstadoSolicitud): Solicitud {
  const i = new Date(2026, 10, dia, h1), f = new Date(2026, 10, dia, h2);
  const p = calcularPrecio(espaciosDe(espacioIds), i, f, est)!;
  return { id, espacioIds, nombre, correo: `${nombre.split(' ')[0].toLowerCase()}@ejemplo.com`, telefono: '5555 5555',
    inicio: i, fin: f, esEstudiante: est, carneVerificado: false,
    subtotal: p.subtotal, descuento: p.descuento, total: p.total, estado };
}

/** Datos en memoria para el prototipo. Reemplázalo por llamadas HTTP a tu backend. */
@Injectable({ providedIn: 'root' })
export class ReservasStore {
  readonly solicitudes = signal<Solicitud[]>([
    mock(1, ['coworking', 'sala'], 'Ana López', 14, 10, 13, true, 'PENDIENTE'),
    mock(2, ['local'], 'Grupo Impulsa', 20, 14, 20, false, 'PENDIENTE'),
    mock(3, ['coworking'], 'Carlos Méndez', 10, 8, 12, false, 'APROBADA'),
    mock(4, ['sala'], 'Sofía Ruiz', 15, 9, 11, false, 'RECHAZADA'),
  ]);

  crear(d: Omit<Solicitud, 'id' | 'estado' | 'carneVerificado'>) {
    this.solicitudes.update(l => [{ ...d, id: Date.now(), estado: 'PENDIENTE', carneVerificado: false }, ...l]);
  }

  /** "Todo el local" choca con cualquier espacio. Un escritorio compartido con varios cupos necesitaría otra regla. */
 /** Todo el local choca con todo. Un espacio exclusivo choca con el mismo espacio. La zona compartida no choca consigo misma. */
hayChoque(s: Solicitud) {
  const a = espaciosDe(s.espacioIds);
  return this.solicitudes().some(o => {
    if (o.id === s.id || o.estado !== 'APROBADA' || !(o.inicio < s.fin && o.fin > s.inicio)) return false;
    if (a.some(e => e.todoElLocal) || usaTodoElLocal(o.espacioIds)) return true;
    return a.some(e => e.exclusivo && o.espacioIds.includes(e.id));
  });
}

  setCarne(id: number, ok: boolean) {
    this.solicitudes.update(l => l.map(s => (s.id === id ? { ...s, carneVerificado: ok } : s)));
  }

  /** Devuelve un mensaje de error, o null si se aprobó. */
  aprobar(id: number): string | null {
    const s = this.solicitudes().find(x => x.id === id);
    if (!s) return 'Solicitud no encontrada.';
    if (this.hayChoque(s)) return 'Ese horario ya está ocupado por otra reserva aprobada.';
    // Estudiante sin carné verificado: se quita el descuento.
    const sinDescuento = s.esEstudiante && !s.carneVerificado;
    this.solicitudes.update(l => l.map(x => x.id !== id ? x : {
      ...x, estado: 'APROBADA', descuento: sinDescuento ? 0 : x.descuento, total: sinDescuento ? x.subtotal : x.total }));
    // TODO: POST /api/solicitudes/:id/aprobar -> el backend crea el evento en Google Calendar.
    return null;
  }

  rechazar(id: number, motivo: string) {
    this.solicitudes.update(l => l.map(s => (s.id === id ? { ...s, estado: 'RECHAZADA', motivoRechazo: motivo } : s)));
  }
}
