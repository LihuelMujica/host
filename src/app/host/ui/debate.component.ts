import { NgFor } from '@angular/common';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { interval, Subject, takeUntil } from 'rxjs';

interface DebateAnswer {
  playerName: string;
  answerText: string;
}

@Component({
  selector: 'app-debate',
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
            <div class="text-xs tracking-wide text-black/40 sm:text-sm">La pregunta era...</div>
            <h1 class="mt-2 max-w-5xl text-base font-normal leading-snug sm:text-lg md:text-xl">
              {{ question }}
            </h1>
            <div class="mt-3 max-w-4xl text-sm text-black/70 leading-snug sm:text-base md:text-lg">
              Estas son sus respuestas — debatan quién es el impostor.
            </div>
          </header>

          <div class="mt-4 flex w-full flex-1 items-start justify-center sm:mt-6">
            <div
              class="[--board-w:1100px] [--board-h:560px] [--pad:2rem] [--s:min(1,calc((100vw-var(--pad))/var(--board-w)),calc((100vh-12rem)/var(--board-h)))] [transform:scale(var(--s))] [transform-origin:top_center] w-[var(--board-w)]"
            >
              <div class="grid grid-cols-5 gap-x-10 gap-y-10 [grid-auto-rows:1fr]">
                <article
                  class="flex h-[120px] flex-col items-center justify-center px-2 text-center"
                  *ngFor="let answer of answers"
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

                  <div class="mt-2 text-base tracking-wide">{{ answer.playerName }}</div>

                  <div class="mt-1 text-sm text-black/90 leading-snug break-words whitespace-normal">
                    {{ answer.answerText }}
                  </div>
                </article>
              </div>
            </div>
          </div>
        </section>
      </main>
    </main>
  `,
})
export class DebateComponent implements OnInit, OnDestroy {
  @Input({ required: true }) question = '';
  @Input({ required: true }) answers: DebateAnswer[] = [];
  @Input({ required: true }) totalSeconds = 0;
  @Output() readonly finished = new EventEmitter<void>();

  private readonly destroy$ = new Subject<void>();
  remainingSeconds = 0;

  get formattedTime(): string {
    return String(this.remainingSeconds).padStart(3, '0');
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
