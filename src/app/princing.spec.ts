import { calcularPrecio } from './pricing';
import { Espacio } from './models';

const coworking: Espacio = { id: 'coworking', nombre: 'Zona coworking', tarifaSemana: 2000, tarifaFinDeSemana: 2500,
  tarifaEstudianteSemana: 1000, tarifaEstudianteFinDeSemana: 1500, exclusivo: false, todoElLocal: false };
const sala: Espacio = { id: 'sala', nombre: 'Sala de reuniones', tarifaSemana: 10000, tarifaFinDeSemana: 12500,
  exclusivo: true, todoElLocal: false };
const sab = (h: number) => new Date(2026, 10, 14, h);

describe('calcularPrecio', () => {
  it('coworking sábado 3 h, estudiante', () => {
    const p = calcularPrecio([coworking], sab(10), sab(13), true)!;
    expect([p.subtotal, p.descuento, p.total]).toEqual([7500, 3000, 4500]);
  });
  it('coworking + sala: la tarifa de estudiante solo aplica al coworking', () => {
    const p = calcularPrecio([coworking, sala], sab(10), sab(13), true)!;
    expect([p.subtotal, p.descuento, p.total]).toEqual([45000, 3000, 42000]);
  });
  it('viernes 22:00 a sábado 01:00 se cobra por tramos', () => {
    const p = calcularPrecio([sala], new Date(2026, 10, 13, 22), new Date(2026, 10, 14, 1), false)!;
    expect(p.total).toBe(2 * 10000 + 12500);
  });
  it('rechaza duraciones que no son horas completas', () => {
  expect(calcularPrecio([sala], sab(10), new Date(2026, 10, 14, 10, 30), false)).toBeNull();
  });
  it('rechaza una hora de inicio que no está en punto', () => {
    expect(calcularPrecio([sala], new Date(2026, 10, 14, 10, 30), new Date(2026, 10, 14, 11, 30), false)).toBeNull();
  });
});
