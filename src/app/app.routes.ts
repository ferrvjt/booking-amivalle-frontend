import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    title: 'Solicitar reserva',
    loadComponent: () => import('./pages/solicitud-page/solicitud-page').then(m => m.Solicitud)
  },
  // TODO: protege /admin con un guard de autenticación
  {
    path: 'admin',
    title: 'Solicitudes',
    loadComponent: () => import('./pages/admin-page/admin-page').then(m => m.Admin)
  },
  {
    path: 'admin/calendario',
    title: 'Calendario',
    loadComponent: () => import('./pages/calendario-page/calendario-page').then(m => m.Calendario)
  },
  {
    path: '**',
    redirectTo: ''
  },
];
