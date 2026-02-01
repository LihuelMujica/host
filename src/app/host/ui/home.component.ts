import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-home',
  standalone: true,
  template: `
    <main class="min-h-dvh bg-gradient-to-b from-violet-50 via-white to-slate-50">
      <section class="min-h-dvh flex items-center justify-center px-6">
        <div
          class="w-full max-w-3xl rounded-3xl border border-slate-200/60 bg-white/90 p-10 text-center shadow-[0_30px_80px_-50px_rgba(15,23,42,0.5)] backdrop-blur sm:p-14"
        >
          <p class="text-xs uppercase tracking-[0.4em] text-slate-400">
            Host experience
          </p>
          <h1
            class="mt-6 text-4xl font-normal uppercase tracking-[0.18em] text-slate-900 sm:text-5xl md:text-6xl lg:text-7xl"
          >
            GAME TITLE
          </h1>
          <p class="mt-6 text-lg text-slate-600">
            Prepara la sala, comparte el código y comienza una ronda con
            amigos.
          </p>
          <div class="mt-10">
            <button
              type="button"
              class="text-base font-semibold tracking-[0.2em] text-slate-900 underline underline-offset-8 transition hover:opacity-70"
              (click)="startGame.emit()"
            >
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
