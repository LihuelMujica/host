import { NgFor } from '@angular/common';
import { Component, Input } from '@angular/core';
import { HostPlayerSnapshot } from '../models';

@Component({
  selector: 'app-lobby',
  standalone: true,
  imports: [NgFor],
  template: `
    <main class="min-h-dvh bg-gradient-to-b from-violet-50 via-white to-slate-50 px-6 py-10">
      <section
        class="mx-auto w-full max-w-5xl rounded-3xl border border-slate-200/60 bg-white/90 p-8 shadow-[0_30px_80px_-50px_rgba(15,23,42,0.5)] backdrop-blur sm:p-12"
      >
        <div class="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <p class="max-w-md text-xl leading-snug text-slate-700 sm:text-2xl">
            Entren por sus celulares a<br />
            <span class="tracking-wide text-slate-900">GAMETITLE.IO</span> e<br />
            introduzcan el código
          </p>

          <div class="sm:text-right">
            <div
              class="text-5xl font-semibold uppercase tracking-[0.4em] text-slate-900 sm:text-6xl md:text-7xl"
            >
              {{ roomCode }}
            </div>
          </div>
        </div>

        <h2
          class="mt-12 text-center text-2xl uppercase tracking-[0.18em] text-slate-500 sm:text-3xl"
        >
          JUGADORES
        </h2>

        <div class="mt-10 grid grid-cols-2 gap-8 sm:grid-cols-4">
          <div class="flex flex-col items-center" *ngFor="let player of players">
            <div
              class="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-purple-200/70 to-pink-200/50 shadow-[0_20px_45px_-35px_rgba(88,28,135,0.6)]"
              aria-hidden="true"
            >
              <svg
                viewBox="0 0 24 24"
                class="h-12 w-12 text-purple-900/70"
                fill="none"
                stroke="currentColor"
                stroke-width="1.8"
              >
                <path d="M20 21a8 8 0 1 0-16 0" />
                <circle cx="12" cy="8" r="3.5" />
              </svg>
            </div>
            <div class="mt-3 text-lg tracking-wide text-slate-800 sm:text-xl">
              {{ player.name }}
            </div>
          </div>
        </div>

        <div class="mt-12 flex flex-wrap justify-center gap-12">
          <button
            type="button"
            class="text-lg font-semibold tracking-[0.2em] text-slate-700 underline underline-offset-8 transition hover:opacity-70 sm:text-xl"
          >
            Cancelar
          </button>

          <button
            type="button"
            class="text-lg font-semibold uppercase tracking-[0.2em] text-slate-900 underline underline-offset-8 transition hover:opacity-70 sm:text-xl"
          >
            EMPEZAR
          </button>
        </div>
      </section>
    </main>
  `,
})
export class LobbyComponent {
  @Input({ required: true }) roomCode = '';
  @Input({ required: true }) players: HostPlayerSnapshot[] = [];
}
