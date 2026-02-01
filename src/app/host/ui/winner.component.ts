import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-winner',
  standalone: true,
  template: `
    <main class="min-h-dvh bg-white text-black">
      <section class="mx-auto flex min-h-dvh w-full max-w-5xl flex-col items-center justify-center px-6 py-10 text-center">
        <div class="text-xs uppercase tracking-[0.4em] text-black/40">{{ kicker }}</div>
        <h1 class="mt-6 text-3xl font-semibold tracking-wide sm:text-4xl md:text-5xl">
          {{ title }}
        </h1>
        <p class="mt-4 max-w-2xl text-base text-black/70 sm:text-lg md:text-xl">
          {{ message }}
        </p>
        <div class="mt-8 text-sm uppercase tracking-[0.3em] text-black/40">IMPOSTOR</div>
        <div class="mt-2 text-2xl font-semibold tracking-wide text-black/80">
          {{ impostorName || 'Desconocido' }}
        </div>
      </section>

      <div class="pointer-events-none fixed inset-0 overflow-hidden">
        <span class="confetti left-[10%] top-[-10%] bg-rose-400"></span>
        <span class="confetti left-[25%] top-[-15%] bg-amber-300"></span>
        <span class="confetti left-[40%] top-[-12%] bg-emerald-300"></span>
        <span class="confetti left-[55%] top-[-18%] bg-sky-300"></span>
        <span class="confetti left-[70%] top-[-14%] bg-violet-300"></span>
        <span class="confetti left-[85%] top-[-16%] bg-pink-300"></span>
      </div>

      <style>
        .confetti {
          position: absolute;
          width: 10px;
          height: 18px;
          border-radius: 9999px;
          opacity: 0.9;
          animation: confetti-fall 2.8s linear infinite;
        }
        .confetti:nth-child(2) {
          animation-delay: 0.2s;
        }
        .confetti:nth-child(3) {
          animation-delay: 0.4s;
        }
        .confetti:nth-child(4) {
          animation-delay: 0.6s;
        }
        .confetti:nth-child(5) {
          animation-delay: 0.8s;
        }
        .confetti:nth-child(6) {
          animation-delay: 1s;
        }
        @keyframes confetti-fall {
          0% {
            transform: translateY(0) rotate(0deg);
          }
          100% {
            transform: translateY(110vh) rotate(360deg);
          }
        }
      </style>
    </main>
  `,
})
export class WinnerComponent {
  @Input({ required: true }) title = '';
  @Input({ required: true }) message = '';
  @Input() kicker = 'Resultado';
  @Input() impostorName = '';
}
