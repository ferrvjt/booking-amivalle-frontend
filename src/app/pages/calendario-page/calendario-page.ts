import { Component, computed, inject, signal } from '@angular/core';
import { Solicitud } from '../../models';
import { ReservasStore, nombresEspacios, usaTodoElLocal } from '../../reservas.store';
import { hora } from '../../formato';

const PX_HORA = 48, HORA_INI = 8, HORAS = 13; // 8:00 a 20:00
const COLOR: Record<string, string> = {
  escritorio: '#CCEFEA',
  sala: '#DBEAFE',
  oficina: '#FDE7C8',
  local: '#EDE9FE',
};

@Component({
  selector: 'app-calendario',
  templateUrl: './calendario-page.html',
  styleUrl: './calendario-page.css',
})

export class Calendario {
  private store = inject(ReservasStore);
  readonly hora = hora;
  readonly horas = Array.from({ length: HORAS }, (_, i) => HORA_INI + i);

  lunes = signal(new Date(2026, 10, 9)); // semana de los datos de ejemplo
  dias = computed(() =>
    Array.from({ length: 7 }, (_, i) => {
      const d = new Date(this.lunes());
      d.setDate(d.getDate() + i);
      return d;
    }));

  eventos = (dia: Date) =>
    this.store.solicitudes().filter(s => s.estado === 'APROBADA' && s.inicio.toDateString() === dia.toDateString());

  /** Reparte en columnas los eventos que coinciden en el mismo día. */
  columnas(dia: Date) {
    const evs = this.eventos(dia).sort((a, b) => a.inicio.getTime() - b.inicio.getTime());
    const finCarril: number[] = [];
    const asignados = evs.map(e => {
      let c = finCarril.findIndex(f => f <= e.inicio.getTime());
      if (c === -1) c = finCarril.length;
      finCarril[c] = e.fin.getTime();
      return { e, c };
    });
    const n = Math.max(1, finCarril.length);
    return asignados.map(({ e, c }) => ({ e, left: (c / n) * 100, ancho: 100 / n }));
  }

  top = (s: Solicitud) => (s.inicio.getHours() + s.inicio.getMinutes() / 60 - HORA_INI) * PX_HORA;
  alto = (s: Solicitud) => ((s.fin.getTime() - s.inicio.getTime()) / 3_600_000) * PX_HORA;

  color = (s: Solicitud) =>
    usaTodoElLocal(s.espacioIds) ? '#EDE9FE' : s.espacioIds.length > 1 ? '#FDE7C8' : COLOR[s.espacioIds[0]];
  nombres = (s: Solicitud) => nombresEspacios(s.espacioIds);

  mover(dias: number) {
    this.lunes.update(d => {
      const n = new Date(d);
      n.setDate(n.getDate() + dias);
      return n;
    });
  }
}
