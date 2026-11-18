import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AVISOS, EstadoSolicitud, Solicitud } from '../../models';
import { ReservasStore, nombresEspacios, usaTodoElLocal } from '../../reservas.store';
import { q, rango, duracion } from '../../formato';

@Component({
  selector: 'app-admin',
  imports: [FormsModule],
  templateUrl: './admin-page.html',
  styleUrl: './admin-page.css',
})
export class Admin {
  readonly store = inject(ReservasStore);
  readonly q = q;
  readonly rango = rango;
  readonly duracion = duracion;
  readonly filtros: EstadoSolicitud[] = ['PENDIENTE', 'APROBADA', 'RECHAZADA'];
  readonly etiquetas: Record<EstadoSolicitud, string> = {
    PENDIENTE: 'Pendientes',
    APROBADA: 'Aprobadas',
    RECHAZADA: 'Rechazadas',
  };

  filtro = signal<EstadoSolicitud>('PENDIENTE');
  seleccion = signal<number | null>(null);
  motivo = signal('');
  error = signal('');

  lista = computed(() => this.store.solicitudes().filter(s => s.estado === this.filtro()));
  actual = computed(() => this.store.solicitudes().find(s => s.id === this.seleccion()) ?? null);
  nombres = (s: Solicitud) => nombresEspacios(s.espacioIds);
  usaLocal = (s: Solicitud) => usaTodoElLocal(s.espacioIds);
  cuenta = (f: EstadoSolicitud) => this.store.solicitudes().filter(s => s.estado === f).length;
  aviso = (s: Solicitud) => (this.usaLocal(s) ? AVISOS.todoElLocal : AVISOS.normal);

  elegir(s: Solicitud) {
    this.seleccion.set(s.id);
    this.error.set('');
    this.motivo.set('');
  }
  aprobar(s: Solicitud) {
    this.error.set(this.store.aprobar(s.id) ?? '');
  }
  rechazar(s: Solicitud) {
    if (!this.motivo().trim()) return this.error.set('Escribe el motivo del rechazo.');
    this.store.rechazar(s.id, this.motivo().trim());
    this.error.set('');
  }
}
