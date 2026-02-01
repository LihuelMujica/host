import { NgFor, NgStyle } from '@angular/common';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { interval, Subject, takeUntil } from 'rxjs';
import { HostPlayerSnapshot } from '../models';

@Component({
  selector: 'app-questions',
  standalone: true,
  imports: [NgFor, NgStyle],
  template: `
    <main class="min-h-dvh bg-white text-black">
      <div class="fixed right-6 top-6 z-10 sm:right-10 sm:top-8">
        <div class="flex items-center gap-2">
          <span class="text-xs text-black/40 tracking-wide sm:text-sm">TIEMPO</span>
          <div
            class="rounded-full border border-black/15 bg-black/[0.03] px-3 py-1 font-mono text-base tracking-widest sm:text-lg md:text-xl"
            aria-label="Timer"
          >
            {{ formattedTime }}
          </div>
        </div>
      </div>

      <main class="min-h-dvh px-6 py-6 sm:px-10 sm:py-8">
        <section class="mx-auto flex min-h-dvh w-full max-w-6xl flex-col">
          <div class="h-14 sm:h-16"></div>

          <div class="mt-6 text-center sm:mt-8">
            <div class="mx-auto max-w-2xl">
              <p class="text-lg text-black/90 leading-snug sm:text-xl md:text-2xl">
                Ahora van a contestar una pregunta. El impostor contestará una pregunta similar a la de los
                ciudadanos. No compartan la pantalla de sus celulares, y no le den mucha información al impostor.
              </p>
            </div>
          </div>

          <div class="mt-10 flex-1 min-h-0 sm:mt-12">
            <div class="h-full overflow-auto pr-1">
              <div
                class="grid justify-items-center gap-x-10 gap-y-10 [grid-template-columns:repeat(auto-fit,minmax(120px,1fr))] sm:[grid-template-columns:repeat(auto-fit,minmax(140px,1fr))] md:[grid-template-columns:repeat(auto-fit,minmax(160px,1fr))]"
              >
                <div class="flex flex-col items-center text-center" *ngFor="let player of players">
                  <div
                    class="flex h-20 w-20 items-center justify-center rounded-full bg-purple-200/80 md:h-24 md:w-24"
                    aria-hidden="true"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      class="h-12 w-12 text-purple-900/70 md:h-14 md:w-14"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="1.8"
                    >
                      <path d="M20 21a8 8 0 1 0-16 0" />
                      <circle cx="12" cy="8" r="3.5" />
                    </svg>
                  </div>
                  <div class="mt-3 break-words text-lg tracking-wide sm:text-xl">{{ player.name }}</div>
                  <div class="mt-1 text-base text-black/80 sm:text-lg">
                    {{ isReady(player.playerId) ? 'Listo' : 'Contestando...' }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="mt-8">
            <div class="mx-auto w-full max-w-md">
              <div class="h-1.5 w-full overflow-hidden rounded-full bg-black/10">
                <div
                  class="h-full rounded-full bg-black/25 transition-[width]"
                  [ngStyle]="{ width: progressPercent + '%' }"
                ></div>
              </div>
            </div>
          </div>

          <div class="h-8 sm:h-10"></div>
        </section>
      </main>
    </main>
  `,
})
export class QuestionsComponent implements OnInit, OnDestroy {
  @Input({ required: true }) players: HostPlayerSnapshot[] = [];
  @Input({ required: true }) answeredPlayerIds = new Set<string>();
  @Output() readonly finished = new EventEmitter<void>();

  private readonly destroy$ = new Subject<void>();
  private readonly totalSeconds = 30;
  remainingSeconds = this.totalSeconds;

  get formattedTime(): string {
    return `00:${String(this.remainingSeconds).padStart(2, '0')}`;
  }

  get progressPercent(): number {
    const elapsed = this.totalSeconds - this.remainingSeconds;
    return Math.min(100, Math.max(0, (elapsed / this.totalSeconds) * 100));
  }

  isReady(playerId: string): boolean {
    return this.answeredPlayerIds.has(playerId);
  }

  ngOnInit(): void {
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
