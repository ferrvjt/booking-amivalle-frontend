export const q = (centavos: number) => 'Q' + (centavos / 100).toLocaleString('es-GT', { maximumFractionDigits: 2 });
export const dia = (d: Date) => d.toLocaleDateString('es-GT', { weekday: 'short', day: 'numeric', month: 'short' });
export const hora = (d: Date) => d.toLocaleTimeString('es-GT', { hour: '2-digit', minute: '2-digit', hour12: false });
export const rango = (a: Date, b: Date) => `${dia(a)} · ${hora(a)}–${hora(b)}`;

/** 30 → "30 minutos", 120 → "2 horas", 4320 → "3 días" (usa la unidad más grande que dé un número entero). */
export function duracion(min: number): string {
  const [valor, unidad] =
    min % 1440 === 0 ? [min / 1440, 'día'] :
    min % 60 === 0 ? [min / 60, 'hora'] :
    [min, 'minuto'];
  return `${valor} ${unidad}${valor === 1 ? '' : 's'}`;
}
