import { NgFor } from '@angular/common';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { interval, Subject, takeUntil } from 'rxjs';
import { HostPlayerSnapshot } from '../models';

@Component({
  selector: 'app-votation',
  standalone: true,
  imports: [NgFor],
  template: `
    <main class="min-h-dvh overflow-hidden bg-white text-black">
      <div class="fixed right-4 top-4 z-10 sm:right-8 sm:top-6">
        <div class="font-mono text-xs tracking-widest text-black/80 sm:text-sm md:text-base">
          TIMER: {{ formattedTime }}
        </div>
      </div>

      <main class="min-h-dvh px-4 py-4 sm:px-8 sm:py-6">
        <section class="flex min-h-dvh flex-col items-center justify-start">
          <header class="w-full max-w-6xl pt-10 sm:pt-12">
            <h1 class="max-w-5xl text-base font-normal leading-snug sm:text-lg md:text-xl">
              Hora de votar! Si empatan o sale mayoría “saltear”, se pasará a la siguiente pregunta (si es la última
              ronda ante un empate ganaría el impostor)
            </h1>

            <div class="mt-4 h-px w-24 bg-black/10"></div>
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
                    class="flex aspect-square h-14 items-center justify-center rounded-full bg-purple-200/80"
                    aria-hidden="true"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      class="block h-8 w-8 text-purple-900/70"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="1.8"
                    >
                      <path d="M20 21a8 8 0 1 0-16 0" />
                      <circle cx="12" cy="8" r="3.5" />
                    </svg>
                  </div>

                  <div class="mt-2 text-base tracking-wide">{{ player.name }}</div>
                  <div class="mt-1 text-sm text-black/80">{{ getVoteLabel(player.playerId) }}</div>
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
                  <div class="text-base tracking-wide">
                    SALTEAR <span aria-hidden="true">→</span>
                  </div>

                  <div
                    class="mt-2 flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-black/[0.04]"
                    aria-hidden="true"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      class="h-6 w-6 text-black/55"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="1.8"
                    >
                      <path d="M5 12h12" />
                      <path d="M13 6l6 6-6 6" />
                    </svg>
                  </div>

                  <div class="mt-2 text-sm text-black/80">{{ getVoteLabel(skipKey) }}</div>
                </article>

                <article
                  class="flex h-[120px] flex-col items-center justify-center px-2 text-center"
                  *ngFor="let player of remainingPlayers"
                >
                  <div
                    class="flex aspect-square h-14 items-center justify-center rounded-full bg-purple-200/80"
                    aria-hidden="true"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      class="block h-8 w-8 text-purple-900/70"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="1.8"
                    >
                      <path d="M20 21a8 8 0 1 0-16 0" />
                      <circle cx="12" cy="8" r="3.5" />
                    </svg>
                  </div>

                  <div class="mt-2 text-base tracking-wide">{{ player.name }}</div>
                  <div class="mt-1 text-sm text-black/80">{{ getVoteLabel(player.playerId) }}</div>
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
