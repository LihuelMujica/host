import { NgFor } from '@angular/common';
import { Component, Input } from '@angular/core';
import { HostPlayerSnapshot } from '../models';

@Component({
  selector: 'app-lobby',
  standalone: true,
  imports: [NgFor],
  template: `
    <main class="min-h-dvh bg-white text-black px-6 py-8 sm:px-10 sm:py-10">
      <section class="mx-auto w-full max-w-5xl">
        <div class="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <p class="max-w-md text-xl leading-snug sm:text-2xl">
            Entren por sus celulares a<br />
            <span class="tracking-wide">GAMETITLE.IO</span> e<br />
            introduzcan el código
          </p>

          <div class="sm:text-right">
            <div class="font-sans font-normal tracking-widest text-6xl sm:text-7xl md:text-8xl">
              {{ roomCode }}
            </div>
          </div>
        </div>

        <h2 class="mt-10 text-center font-sans font-normal tracking-[0.18em] text-2xl sm:text-3xl">
          JUGADORES
        </h2>

        <div
          class="mt-8 grid grid-cols-2 gap-x-10 gap-y-8 sm:grid-cols-4 sm:gap-x-12 md:gap-x-16"
        >
          <div class="flex flex-col items-center" *ngFor="let player of players">
            <div
              class="h-20 w-20 rounded-full bg-purple-200/80 flex items-center justify-center"
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
            <div class="mt-3 text-lg tracking-wide sm:text-xl">{{ player.name }}</div>
          </div>
        </div>

        <div class="mt-12 flex items-center justify-center gap-16 sm:gap-28">
          <button
            type="button"
            class="text-2xl font-semibold underline underline-offset-8 decoration-2 hover:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-black"
          >
            Cancelar
          </button>

          <button
            type="button"
            class="text-2xl font-semibold uppercase tracking-wide underline underline-offset-8 decoration-2 hover:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-black"
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
