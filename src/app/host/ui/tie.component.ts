import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { interval, Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-tie',
  standalone: true,
  template: `
    <main class="min-h-dvh bg-white text-black">
      <section class="mx-auto flex min-h-dvh w-full max-w-5xl flex-col items-center justify-center px-6 py-10 text-center">
        <div class="text-xs uppercase tracking-[0.4em] text-black/40">Empate</div>
        <h1 class="mt-6 text-3xl font-semibold tracking-wide sm:text-4xl md:text-5xl">
          La votación terminó empatada
        </h1>
        <p class="mt-4 max-w-2xl text-base text-black/70 sm:text-lg md:text-xl">
          Se pasa automáticamente a la siguiente pregunta.
        </p>
        <div class="mt-6 text-sm uppercase tracking-[0.3em] text-black/40">
          Rondas restantes: {{ roundsRemaining }}
        </div>

        <div class="mt-10 flex items-center gap-3 text-sm tracking-[0.3em] text-black/50">
          <span>CONTINUAMOS EN</span>
          <span class="font-mono text-base text-black/70">{{ formattedTime }}</span>
        </div>
      </section>
    </main>
  `,
})
export class TieComponent implements OnInit, OnDestroy {
  @Input({ required: true }) roundsRemaining = 0;
  @Output() readonly finished = new EventEmitter<void>();

  private readonly destroy$ = new Subject<void>();
  private readonly totalSeconds = 5;
  remainingSeconds = this.totalSeconds;

  get formattedTime(): string {
    return `00:${String(this.remainingSeconds).padStart(2, '0')}`;
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
