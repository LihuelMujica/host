import { NgFor, NgIf } from '@angular/common';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { interval, Subject, takeUntil } from 'rxjs';

interface DebateAnswer {
  playerName: string;
  answerText: string;
  avatarId?: number | null;
}

@Component({
  selector: 'app-debate',
  standalone: true,
  imports: [NgFor, NgIf],
  template: `
    <main class="min-h-dvh overflow-hidden bg-gradient-to-b from-slate-950 via-indigo-950 to-slate-900 text-slate-100">
      <div class="fixed right-4 top-4 z-10 sm:right-8 sm:top-6">
        <div class="font-mono text-sm tracking-widest text-emerald-100/80 sm:text-base md:text-lg">
          TIMER: {{ formattedTime }}
        </div>
      </div>

      <main class="min-h-dvh px-4 py-4 sm:px-8 sm:py-6">
        <section class="flex min-h-dvh flex-col items-center justify-center gap-6 pb-12 pt-10 sm:gap-8 sm:pt-12">
          <header class="w-full max-w-6xl text-center">
            <div class="text-sm tracking-wide text-emerald-100/70 sm:text-base">La pregunta era...</div>
            <h1 class="mt-3 max-w-5xl text-lg font-normal leading-snug text-fuchsia-100 sm:text-xl md:text-2xl">
              {{ question }}
            </h1>
            <div class="mt-4 max-w-4xl text-base text-slate-200/80 leading-snug sm:text-lg md:text-xl">
              Estas son sus respuestas — debatan quién es el impostor.
            </div>
          </header>

          <div class="flex w-full flex-1 items-center justify-center">
            <div
              class="[--board-w:1200px] [--board-h:620px] [--pad:2rem] [--s:min(1.1,calc((100vw-var(--pad))/var(--board-w)),calc((100vh-10rem)/var(--board-h)))] [transform:scale(var(--s))] [transform-origin:top_center] w-[var(--board-w)]"
            >
              <div class="grid grid-cols-5 gap-x-12 gap-y-12 [grid-auto-rows:1fr]">
                <article
                  class="flex h-[150px] flex-col items-center justify-center px-2 text-center"
                  *ngFor="let answer of answers"
                >
                  <div
                    class="flex aspect-square h-20 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-emerald-400/30 via-slate-950/80 to-fuchsia-400/30 shadow-[0_25px_55px_-35px_rgba(45,212,191,0.6)]"
                    aria-hidden="true"
                  >
                    <ng-container *ngIf="answer.avatarId !== null && answer.avatarId !== undefined; else fallbackAvatar">
                      <img
                        class="h-full w-full object-contain"
                        [src]="'assets/img/avatar_' + answer.avatarId + '.png'"
                        [alt]="answer.playerName"
                        loading="lazy"
                      />
                    </ng-container>
                    <ng-template #fallbackAvatar>
                      <svg
                        viewBox="0 0 24 24"
                        class="block h-9 w-9 text-emerald-100/80"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="1.8"
                      >
                        <path d="M20 21a8 8 0 1 0-16 0" />
                        <circle cx="12" cy="8" r="3.5" />
                      </svg>
                    </ng-template>
                  </div>

                  <div class="mt-3 text-lg tracking-wide text-slate-100">{{ answer.playerName }}</div>

                  <div class="mt-2 text-base text-slate-200/85 leading-snug break-words whitespace-normal">
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
