export type EstadoSolicitud = 'PENDIENTE' | 'APROBADA' | 'RECHAZADA';

export interface Espacio {
  id: string;
  nombre: string;
  tarifaSemana: number;       // centavos por hora
  tarifaFinDeSemana: number;
  tarifaEstudianteSemana?: number;       // solo si el espacio tiene precio de estudiante
  tarifaEstudianteFinDeSemana?: number;
  exclusivo: boolean;         // true: una reserva a la vez. false: zona compartida
  todoElLocal: boolean;
}

export interface Solicitud {
  id: number;
  espacioIds: string[];       // uno o varios; si es todo el local, solo ['local']
  nombre: string;
  correo: string;
  telefono: string;
  inicio: Date;
  fin: Date;
  esEstudiante: boolean;
  carneVerificado: boolean;
  subtotal: number;
  descuento: number;
  total: number;
  estado: EstadoSolicitud;
  motivoRechazo?: string;
}

/** Minutos antes del evento. Valores de ejemplo. */
export const AVISOS = {
  normal: { notificacion: 30, correo: 120 },
  todoElLocal: { notificacion: 24 * 60, correo: 3 * 24 * 60 },
};
