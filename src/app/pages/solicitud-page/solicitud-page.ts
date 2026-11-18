import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ESPACIOS, ReservasStore } from '../../reservas.store';
import { calcularPrecio } from '../../pricing';
import { q, rango } from '../../formato';

@Component({
  selector: 'app-solicitud',
  imports: [FormsModule],
  templateUrl: './solicitud-page.html',
  styleUrl: './solicitud-page.css',
})

export class Solicitud {
  private store = inject(ReservasStore);
  readonly espacios = ESPACIOS.filter(e => !e.todoElLocal);
  readonly local = ESPACIOS.find(e => e.todoElLocal)!;
  readonly hoy = new Date().toISOString().slice(0, 10);
  readonly horasDisponibles = Array.from({ length: 13 }, (_, i) => `${String(8 + i).padStart(2, '0')}:00`); // 08:00 a 20:00
  readonly q = q; readonly rango = rango;

  seleccion = signal<string[]>([]);
  todoElLocal = signal(false);
  fecha = signal(''); horaIni = signal('10:00'); horaFin = signal('13:00');
  nombre = signal(''); correo = signal(''); telefono = signal('');
  esEstudiante = signal(false); carne = signal<string | null>(null);
  enviada = signal(false);

  elegidos = computed(() =>
    this.todoElLocal() ? [this.local] : this.espacios.filter(e => this.seleccion().includes(e.id)));
  tieneTarifaEstudiante = computed(() => this.elegidos().some(e => e.tarifaEstudianteSemana != null));
  estudianteActivo = computed(() => this.esEstudiante() && this.tieneTarifaEstudiante());

  inicio = computed(() => (this.fecha() ? new Date(`${this.fecha()}T${this.horaIni()}`) : null));
  fin = computed(() => (this.fecha() ? new Date(`${this.fecha()}T${this.horaFin()}`) : null));
  precio = computed(() => {
    const i = this.inicio(), f = this.fin();
    return i && f ? calcularPrecio(this.elegidos(), i, f, this.estudianteActivo()) : null;
  });
  valido = computed(() =>
    !!this.precio() && !!this.nombre().trim() && this.correo().includes('@') &&
    this.inicio()! > new Date() && (!this.estudianteActivo() || !!this.carne()));

  alternar(id: string) {
    this.seleccion.update(l => (l.includes(id) ? l.filter(x => x !== id) : [...l, id]));
  }

  enviar() {
    const p = this.precio(); if (!p || !this.valido()) return;
    this.store.crear({
      espacioIds: this.elegidos().map(e => e.id), nombre: this.nombre().trim(), correo: this.correo(),
      telefono: this.telefono(), inicio: this.inicio()!, fin: this.fin()!, esEstudiante: this.estudianteActivo(),
      subtotal: p.subtotal, descuento: p.descuento, total: p.total,
    }); // TODO: POST /api/solicitudes (y subir el carné)
    this.enviada.set(true);
  }
}
