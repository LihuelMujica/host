import { NgFor } from '@angular/common';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { interval, Subject, takeUntil } from 'rxjs';
import { HostPlayerSnapshot } from '../models';

@Component({
  selector: 'app-votation',
  standalone: true,
  imports: [NgFor],
  template: `
    <main class="min-h-dvh overflow-hidden bg-gradient-to-b from-slate-950 via-indigo-950 to-slate-900 text-slate-100">
      <div class="fixed right-4 top-4 z-10 sm:right-8 sm:top-6">
        <div class="font-mono text-xs tracking-widest text-emerald-100/80 sm:text-sm md:text-base">
          TIMER: {{ formattedTime }}
        </div>
      </div>

      <main class="min-h-dvh px-4 py-4 sm:px-8 sm:py-6">
        <section class="flex min-h-dvh flex-col items-center justify-start">
          <header class="w-full max-w-6xl pt-10 sm:pt-12">
            <h1 class="max-w-5xl text-base font-normal leading-snug text-slate-100/85 sm:text-lg md:text-xl">
              Hora de votar! Si empatan o sale mayoría “saltear”, se pasará a la siguiente pregunta (si es la última
              ronda ante un empate ganaría el impostor)
            </h1>

            <div class="mt-4 h-px w-24 bg-emerald-200/20"></div>
          </header>

          <div class="mt-4 flex w-full flex-1 items-start justify-center sm:mt-6">
            <div
              class="[--board-w:1100px] [--board-h:560px] [--pad:2rem] [--s:min(1,calc((100vw-var(--pad))/var(--board-w)),calc((100vh-12rem)/var(--board-h)))] [transform:scale(var(--s))] [transform-origin:top_center] w-[var(--board-w)]"
            >
              <div class="grid grid-cols-5 gap-x-10 gap-y-10 [grid-auto-rows:1fr]">
                <article
                  class="flex h-[120px] flex-col items-center justify-center px-2 text-center"
                  *ngFor="let player of firstRowPlayers"
                >
                  <div
                    class="flex aspect-square h-14 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-emerald-400/30 via-slate-950/80 to-fuchsia-400/30"
                  >
                    <img
                      class="h-full w-full object-contain"
                      [src]="'assets/img/avatar_' + player.avatarId + '.png'"
                      [alt]="player.name"
                      loading="lazy"
                    />
                  </div>

                  <div class="mt-2 text-base tracking-wide text-slate-100">{{ player.name }}</div>
                  <div class="mt-1 text-sm text-emerald-100/80">{{ getVoteLabel(player.playerId) }}</div>
                </article>

                <article
                  class="flex h-[120px] flex-col items-center justify-center px-2 text-center"
                  *ngFor="let placeholder of placeholders"
                  aria-hidden="true"
                >
                  <div class="h-14 w-14 opacity-0"></div>
                </article>

                <article
                  class="flex h-[120px] flex-col items-center justify-center px-2 text-center"
                  aria-label="Opción Saltear"
                >
                  <div class="flex items-center gap-2 text-base tracking-wide text-fuchsia-100">
                    <span>SALTEAR</span>
                    <svg
                      viewBox="0 0 24 24"
                      class="h-4 w-4 text-fuchsia-200"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="1.6"
                      aria-hidden="true"
                    >
                      <path d="M3 21l7-7" />
                      <path d="M6 18l2 2" />
                      <path d="M14 4l6 6-6 6-6-6z" />
                    </svg>
                    <span aria-hidden="true">→</span>
                  </div>

                  <div
                    class="mt-2 flex h-10 w-10 items-center justify-center rounded-full border border-emerald-200/30 bg-slate-950/60"
                    aria-hidden="true"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      class="h-6 w-6 text-emerald-100/80"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="1.8"
                    >
                      <path d="M5 12h12" />
                      <path d="M13 6l6 6-6 6" />
                    </svg>
                  </div>

                  <div class="mt-2 text-sm text-emerald-100/80">{{ getVoteLabel(skipKey) }}</div>
                </article>

                <article
                  class="flex h-[120px] flex-col items-center justify-center px-2 text-center"
                  *ngFor="let player of remainingPlayers"
                >
                  <div
                    class="flex aspect-square h-14 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-emerald-400/30 via-slate-950/80 to-fuchsia-400/30"
                  >
                    <img
                      class="h-full w-full object-contain"
                      [src]="'assets/img/avatar_' + player.avatarId + '.png'"
                      [alt]="player.name"
                      loading="lazy"
                    />
                  </div>

                  <div class="mt-2 text-base tracking-wide text-slate-100">{{ player.name }}</div>
                  <div class="mt-1 text-sm text-emerald-100/80">{{ getVoteLabel(player.playerId) }}</div>
                </article>
              </div>
            </div>
          </div>
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
  private readonly firstRowCount = 4;
  remainingSeconds = 0;
  readonly skipKey = 'SKIP';

  get formattedTime(): string {
    return String(this.remainingSeconds).padStart(3, '0');
  }

  get firstRowPlayers(): HostPlayerSnapshot[] {
    return this.players.slice(0, this.firstRowCount);
  }

  get remainingPlayers(): HostPlayerSnapshot[] {
    return this.players.slice(this.firstRowCount);
  }

  get placeholders(): number[] {
    const count = Math.max(0, this.firstRowCount - this.firstRowPlayers.length);
    return Array.from({ length: count }, (_, index) => index);
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
