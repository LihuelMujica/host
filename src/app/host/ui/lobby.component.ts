import { NgFor, NgIf } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { HostPlayerSnapshot } from '../models';

@Component({
  selector: 'app-lobby',
  standalone: true,
  imports: [NgFor, NgIf],
  template: `
    <main class="min-h-dvh bg-gradient-to-b from-slate-950 via-indigo-950 to-slate-900 px-6 py-10 text-slate-100">
      <section
        class="mx-auto w-full max-w-5xl rounded-[2.5rem] border border-emerald-300/30 bg-slate-950/70 p-8 shadow-[0_35px_120px_-60px_rgba(14,116,144,0.75)] backdrop-blur sm:p-12"
      >
        <div class="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <p class="max-w-md text-xl leading-snug text-slate-100/80 sm:text-2xl">
            Entren por sus celulares a<br />
            <span class="tracking-wide text-emerald-200">GAMETITLE.IO</span> e<br />
            introduzcan el código
          </p>

          <div class="sm:text-right">
            <div
              class="text-5xl font-semibold uppercase tracking-[0.4em] text-fuchsia-200 drop-shadow-[0_4px_18px_rgba(236,72,153,0.45)] sm:text-6xl md:text-7xl"
            >
              {{ roomCode }}
            </div>
          </div>
        </div>

        <h2
          class="mt-12 text-center text-2xl uppercase tracking-[0.2em] text-emerald-100/70 sm:text-3xl"
        >
          JUGADORES
        </h2>

        <div class="mt-10 grid grid-cols-2 gap-8 sm:grid-cols-4">
          <div class="flex flex-col items-center" *ngFor="let player of players">
            <div
              class="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-emerald-400/30 via-slate-950/80 to-fuchsia-400/30 shadow-[0_25px_55px_-35px_rgba(45,212,191,0.6)] transition"
              [class.opacity-50]="player.connectionState === 'DISCONNECTED'"
              [class.grayscale]="player.connectionState === 'DISCONNECTED'"
            >
              <img
                class="h-full w-full object-contain"
                [src]="'assets/img/avatar_' + player.avatarId + '.png'"
                [alt]="player.name"
                loading="lazy"
              />
            </div>
            <div
              class="mt-3 text-lg tracking-wide text-slate-100 sm:text-xl"
              [class.text-slate-400]="player.connectionState === 'DISCONNECTED'"
              [class.line-through]="player.connectionState === 'DISCONNECTED'"
            >
              {{ player.name }}
            </div>
            <div
              *ngIf="player.connectionState === 'DISCONNECTED'"
              class="mt-1 text-xs uppercase tracking-[0.3em] text-rose-300"
            >
              Desconectado
            </div>
          </div>
        </div>

        <div class="mt-12 flex flex-wrap justify-center gap-12">
          <button
            type="button"
            class="text-lg font-semibold tracking-[0.25em] text-slate-200 underline decoration-slate-200/60 underline-offset-8 transition hover:text-slate-100 sm:text-xl"
            (click)="cancel.emit()"
          >
            Cancelar
          </button>

          <button
            type="button"
            class="text-lg font-semibold uppercase tracking-[0.25em] text-emerald-200 underline decoration-emerald-300/70 underline-offset-8 transition hover:text-emerald-100 sm:text-xl"
            (click)="start.emit()"
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
  @Output() readonly cancel = new EventEmitter<void>();
  @Output() readonly start = new EventEmitter<void>();
}
