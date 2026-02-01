import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-home',
  standalone: true,
  template: `
    <main class="min-h-dvh bg-gradient-to-b from-slate-950 via-indigo-950 to-slate-900 text-slate-100">
      <section class="min-h-dvh flex items-center justify-center px-6">
        <div
          class="w-full max-w-3xl rounded-[2.5rem] border border-emerald-300/40 bg-slate-950/70 p-10 text-center shadow-[0_35px_120px_-60px_rgba(14,116,144,0.75)] backdrop-blur sm:p-14"
        >
          <p class="text-xs uppercase tracking-[0.5em] text-emerald-200/80">
            Host experience
          </p>
          <h1
            class="mt-6 text-4xl font-semibold uppercase tracking-[0.22em] text-fuchsia-200 drop-shadow-[0_4px_18px_rgba(236,72,153,0.45)] sm:text-5xl md:text-6xl lg:text-7xl"
          >
            CARETAS
          </h1>
          <p class="mt-6 text-lg text-slate-200/80">
            Prepara la sala, comparte el código y comienza una ronda con
            amigos.
          </p>
          <div class="mt-10">
            <button
              type="button"
              class="text-base font-semibold tracking-[0.25em] text-emerald-200 underline decoration-emerald-300/70 underline-offset-8 transition hover:text-emerald-100 hover:opacity-90"
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
