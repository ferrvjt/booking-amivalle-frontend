import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <header>
      <b>Coworking AMIVALLE</b>
      <nav>
        <a routerLink="/" routerLinkActive="on" [routerLinkActiveOptions]="{ exact: true }">Solicitar</a>
        <a routerLink="/admin" routerLinkActive="on" [routerLinkActiveOptions]="{ exact: true }">Solicitudes</a>
        <a routerLink="/admin/calendario" routerLinkActive="on">Calendario</a>
      </nav>
    </header>
    <router-outlet />
  `,
  styles: `
    header{display:flex;justify-content:space-between;align-items:center;padding:0 40px;height:64px;background:#fff;border-bottom:1px solid var(--line)}
    b{color:var(--acc);font-size:18px}
    nav{display:flex;gap:6px}
    a{padding:10px 14px;border-radius:8px;color:var(--ink);text-decoration:none}
    a.on{background:var(--acc-bg);font-weight:700}
  `,
})
export class App {}
