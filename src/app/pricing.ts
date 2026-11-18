import { Espacio } from './models';

export const PASO_MIN = 60; // las reservas son en bloques de 60 min

export interface Tramo { etiqueta: string; horas: number; tarifa: number; monto: number; }
export interface PrecioEspacio {
  espacioId: string; nombre: string; tramos: Tramo[];
  subtotal: number; descuento: number; total: number;
}
export interface Precio { espacios: PrecioEspacio[]; subtotal: number; descuento: number; total: number; }

export const esFinDeSemana = (d: Date) => d.getDay() === 0 || d.getDay() === 6;

const monto = (bloques: number, tarifa: number) => Math.round(((bloques * PASO_MIN) / 60) * tarifa);

/** Calcula el precio de uno o varios espacios para el mismo horario. */
export function calcularPrecio(espacios: Espacio[], inicio: Date, fin: Date, esEstudiante: boolean): Precio | null {
  const paso = PASO_MIN * 60_000;
  const dur = fin.getTime() - inicio.getTime();
  if (!espacios.length || !(dur > 0) || dur % paso !== 0 || inicio.getMinutes() !== 0) return null;

  let semana = 0, finde = 0; // bloques de 60 min
  for (let t = inicio.getTime(); t < fin.getTime(); t += paso) {
    esFinDeSemana(new Date(t)) ? finde++ : semana++;
  }
  const horas = (b: number) => (b * PASO_MIN) / 60;

  const lineas: PrecioEspacio[] = espacios.map(e => {
    const tramos: Tramo[] = [];
    if (semana) tramos.push({ etiqueta: 'entre semana', horas: horas(semana), tarifa: e.tarifaSemana, monto: monto(semana, e.tarifaSemana) });
    if (finde) tramos.push({ etiqueta: 'fin de semana', horas: horas(finde), tarifa: e.tarifaFinDeSemana, monto: monto(finde, e.tarifaFinDeSemana) });
    const subtotal = tramos.reduce((s, t) => s + t.monto, 0);

    const aplicaEstudiante = esEstudiante && e.tarifaEstudianteSemana != null && e.tarifaEstudianteFinDeSemana != null;
    const conTarifaEstudiante = aplicaEstudiante
      ? monto(semana, e.tarifaEstudianteSemana!) + monto(finde, e.tarifaEstudianteFinDeSemana!)
      : subtotal;
    return { espacioId: e.id, nombre: e.nombre, tramos, subtotal, descuento: subtotal - conTarifaEstudiante, total: conTarifaEstudiante };
  });

  const suma = (k: 'subtotal' | 'descuento' | 'total') => lineas.reduce((s, l) => s + l[k], 0);
  return { espacios: lineas, subtotal: suma('subtotal'), descuento: suma('descuento'), total: suma('total') };
}
