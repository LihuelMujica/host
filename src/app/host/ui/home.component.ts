import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-home',
  standalone: true,
  template: `
    <main class="page-shell">
      <section
        class="min-h-dvh flex flex-col items-center justify-center px-6 gap-16"
      >
        <div class="card max-w-3xl w-full p-10 sm:p-14 text-center">
          <p class="uppercase tracking-[0.3em] text-sm text-slate-400">
            Host experience
          </p>
          <h1 class="hero-title mt-6">GAME TITLE</h1>
          <p class="mt-6 text-lg text-slate-600">
            Prepara la sala, comparte el código y comienza una ronda con
            amigos.
          </p>
          <div class="mt-10">
            <button type="button" class="primary-link" (click)="startGame.emit()">
              JUGAR
            </button>
          </div>
        </div>
      </section>
    </main>
  `,
})
export class HomeComponent {
  @Output() readonly startGame = new EventEmitter<void>();
}
