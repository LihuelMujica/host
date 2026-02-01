import { NgStyle } from '@angular/common';
import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { interval, Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-role-assignment',
  standalone: true,
  imports: [NgStyle],
  template: `
    <main class="min-h-dvh bg-gradient-to-b from-slate-950 via-indigo-950 to-slate-900 text-slate-100">
      <section class="mx-auto w-full max-w-6xl min-h-dvh px-6 py-6 sm:px-10 sm:py-8">
        <div class="flex items-start justify-between">
          <div class="text-xs text-emerald-200/70 tracking-wide sm:text-sm">Host · Asignación de Roles</div>
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

        <div class="mt-10 flex flex-col items-center justify-center text-center sm:mt-14">
          <div
            class="flex h-14 w-14 items-center justify-center rounded-full border border-emerald-200/30 bg-slate-950/60 sm:h-16 sm:w-16"
            aria-hidden="true"
          >
            <svg
              viewBox="0 0 24 24"
              class="h-8 w-8 text-emerald-100 sm:h-9 sm:w-9"
              fill="none"
              stroke="currentColor"
              stroke-width="1.7"
            >
              <path d="M12 22s8-4 8-10V6l-8-4-8 4v6c0 6 8 10 8 10z" />
              <path d="M9.5 12.5l1.8 1.8L15 10.6" />
            </svg>
          </div>

          <h1 class="mt-6 text-xl font-semibold tracking-wide text-fuchsia-100 sm:text-2xl md:text-3xl">
            Sus roles aparecerán en pantalla
          </h1>

          <p class="mt-3 max-w-xl text-base text-slate-200/80 leading-snug sm:text-lg md:text-xl">
            No los compartan. Cuando todos hayan visto su rol, esperen a que el host inicie la ronda.
          </p>

          <div class="mt-10 h-px w-24 bg-emerald-200/20"></div>

          <div class="mt-8 text-sm text-emerald-100/70 tracking-wide sm:text-base">
            Preparando asignación…
          </div>

          <div class="mt-3 w-full max-w-sm">
            <div class="h-1.5 w-full overflow-hidden rounded-full bg-emerald-200/20">
              <div
                class="h-full rounded-full bg-fuchsia-300/60 transition-[width]"
                [ngStyle]="{ width: progressPercent + '%' }"
              ></div>
            </div>
          </div>
        </div>

        <div class="h-10 sm:h-14"></div>
      </section>
    </main>
  `,
})
export class RoleAssignmentComponent implements OnInit, OnDestroy {
  @Output() readonly finished = new EventEmitter<void>();

  private readonly destroy$ = new Subject<void>();
  private readonly totalSeconds = 10;
  remainingSeconds = this.totalSeconds;

  get formattedTime(): string {
    return `00:${String(this.remainingSeconds).padStart(2, '0')}`;
  }

  get progressPercent(): number {
    const elapsed = this.totalSeconds - this.remainingSeconds;
    return Math.min(100, Math.max(0, (elapsed / this.totalSeconds) * 100));
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
