import { NgFor } from '@angular/common';
import { Component, Input } from '@angular/core';
import { HostPlayerSnapshot } from '../models';

@Component({
  selector: 'app-lobby',
  standalone: true,
  imports: [NgFor],
  template: `
    <main class="page-shell px-6 py-10">
      <section class="mx-auto w-full max-w-5xl card p-8 sm:p-12">
        <div class="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <p class="max-w-md text-xl leading-snug sm:text-2xl text-slate-700">
            Entren por sus celulares a<br />
            <span class="tracking-wide text-slate-900">GAMETITLE.IO</span> e<br />
            introduzcan el código
          </p>

          <div class="sm:text-right">
            <div class="room-code text-slate-900">
              {{ roomCode }}
            </div>
          </div>
        </div>

        <h2 class="mt-12 text-center tracking-[0.18em] text-2xl sm:text-3xl text-slate-600">
          JUGADORES
        </h2>

        <div class="mt-10 grid grid-cols-2 gap-8 sm:grid-cols-4">
          <div class="flex flex-col items-center" *ngFor="let player of players">
            <div class="player-chip" aria-hidden="true">
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
            <div class="mt-3 text-lg tracking-wide sm:text-xl text-slate-800">
              {{ player.name }}
            </div>
          </div>
        </div>

        <div class="mt-12 action-row">
          <button type="button" class="ghost-button">
            Cancelar
          </button>

          <button type="button" class="ghost-button uppercase">
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
