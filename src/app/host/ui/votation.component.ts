import { NgFor } from '@angular/common';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { interval, Subject, takeUntil } from 'rxjs';
import { HostPlayerSnapshot } from '../models';

@Component({
  selector: 'app-votation',
  standalone: true,
  imports: [NgFor],
  template: `
    <main class="min-h-dvh bg-gradient-to-b from-slate-950 via-indigo-950 to-slate-900 text-slate-100">
      <div class="fixed right-6 top-6 z-10 sm:right-10 sm:top-8">
        <div class="flex items-center gap-2">
          <span class="text-xs text-emerald-200/70 tracking-wide sm:text-sm">TIEMPO</span>
          <div
            class="rounded-full border border-emerald-200/30 bg-slate-950/60 px-3 py-1 font-mono text-base tracking-widest text-emerald-100 sm:text-lg md:text-xl"
            aria-label="Timer"
          >
            {{ formattedTime }}
          </div>
        </div>
      </div>

      <main class="min-h-dvh px-6 py-6 sm:px-10 sm:py-8">
        <section class="mx-auto flex min-h-dvh w-full max-w-6xl flex-col">
          <div class="h-14 sm:h-16"></div>

          <div class="text-center">
            <h1 class="text-lg font-normal leading-snug text-slate-100/85 sm:text-xl md:text-2xl">
              Hora de votar! Si empatan o sale mayoría “saltear”, se pasará a la siguiente pregunta (si es la última
              ronda ante un empate ganaría el impostor)
            </h1>
            <div class="mt-4 h-px w-24 bg-emerald-200/20"></div>
          </div>

          <div class="mt-10 flex-1 min-h-0 sm:mt-12">
            <div class="h-full overflow-auto pr-1">
              <div
                class="grid justify-items-center gap-x-10 gap-y-10 [grid-template-columns:repeat(auto-fit,minmax(160px,1fr))] sm:[grid-template-columns:repeat(auto-fit,minmax(180px,1fr))]"
              >
                <div class="flex flex-col items-center text-center" *ngFor="let player of players">
                  <div
                    class="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-emerald-400/30 via-slate-950/80 to-fuchsia-400/30 md:h-24 md:w-24"
                  >
                    <img
                      class="h-full w-full object-contain"
                      [src]="'assets/img/avatar_' + player.avatarId + '.png'"
                      [alt]="player.name"
                      loading="lazy"
                    />
                  </div>
                  <div class="mt-3 break-words text-lg tracking-wide text-slate-100 sm:text-xl">
                    {{ player.name }}
                  </div>
                  <div class="mt-1 text-base text-emerald-100/80 sm:text-lg">
                    {{ getVoteLabel(player.playerId) }}
                  </div>
                </div>

                <div class="flex flex-col items-center text-center" aria-label="Opción Saltear">
                  <div
                    class="flex h-20 w-20 items-center justify-center rounded-full border border-emerald-200/30 bg-slate-950/60 md:h-24 md:w-24"
                    aria-hidden="true"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      class="h-7 w-7 text-emerald-100/80"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="1.8"
                    >
                      <path d="M5 12h12" />
                      <path d="M13 6l6 6-6 6" />
                    </svg>
                  </div>
                  <div class="mt-3 text-lg tracking-wide text-fuchsia-100 sm:text-xl">SALTEAR</div>
                  <div class="mt-1 text-base text-emerald-100/80 sm:text-lg">
                    {{ getVoteLabel(skipKey) }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="h-8 sm:h-10"></div>
        </section>
      </main>
    </main>
  `,
})
export class VotationComponent implements OnInit, OnDestroy {
  @Input({ required: true }) players: HostPlayerSnapshot[] = [];
  @Input({ required: true }) voteCounts: Record<string, number> = {};
  @Input({ required: true }) totalSeconds = 20;
  @Output() readonly finished = new EventEmitter<void>();

  private readonly destroy$ = new Subject<void>();
  remainingSeconds = 0;
  readonly skipKey = 'SKIP';

  get formattedTime(): string {
    return `00:${String(this.remainingSeconds).padStart(2, '0')}`;
  }

  getVoteLabel(key: string): string {
    const count = this.voteCounts[key] ?? 0;
    return `${count} voto${count === 1 ? '' : 's'}`;
  }

  ngOnInit(): void {
    this.remainingSeconds = this.totalSeconds;
    if (this.remainingSeconds <= 0) {
      this.finished.emit();
      return;
    }

    interval(1000)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        if (this.remainingSeconds <= 0) {
          return;
        }
        this.remainingSeconds -= 1;
        if (this.remainingSeconds === 0) {
          this.finished.emit();
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
