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
            <div class="text-sm tracking-wide text-emerald-100/70 sm:text-base">La pregunta era...</div>
            <h1 class="mt-3 text-lg font-normal leading-snug text-fuchsia-100 sm:text-xl md:text-2xl">
              {{ question }}
            </h1>
            <p class="mt-4 text-base text-slate-200/80 leading-snug sm:text-lg md:text-xl">
              Estas son sus respuestas — debatan quién es el impostor.
            </p>
          </div>

          <div class="mt-10 flex-1 min-h-0 sm:mt-12">
            <div class="h-full overflow-auto pr-1">
              <div
                class="grid justify-items-center gap-x-10 gap-y-10 [grid-template-columns:repeat(auto-fit,minmax(160px,1fr))] sm:[grid-template-columns:repeat(auto-fit,minmax(180px,1fr))]"
              >
                <div class="flex flex-col items-center text-center" *ngFor="let answer of answers">
                  <div
                    class="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-emerald-400/30 via-slate-950/80 to-fuchsia-400/30 md:h-24 md:w-24"
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
                  <div class="mt-3 break-words text-lg tracking-wide text-slate-100 sm:text-xl">
                    {{ answer.playerName }}
                  </div>
                  <div class="mt-2 text-base text-slate-200/85 leading-snug sm:text-lg">
                    {{ answer.answerText }}
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
export class DebateComponent implements OnInit, OnDestroy {
  @Input({ required: true }) question = '';
  @Input({ required: true }) answers: DebateAnswer[] = [];
  @Input({ required: true }) totalSeconds = 0;
  @Output() readonly finished = new EventEmitter<void>();

  private readonly destroy$ = new Subject<void>();
  remainingSeconds = 0;

  get formattedTime(): string {
    return `00:${String(this.remainingSeconds).padStart(2, '0')}`;
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
