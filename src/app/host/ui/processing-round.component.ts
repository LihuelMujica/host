import { Component } from '@angular/core';

@Component({
  selector: 'app-processing-round',
  standalone: true,
  template: `
    <main class="min-h-dvh flex items-center justify-center bg-white text-black">
      <div class="flex flex-col items-center gap-6">
        <div
          class="h-12 w-12 animate-spin rounded-full border-4 border-black/10 border-t-black/70"
          aria-label="Procesando"
        ></div>
        <p class="text-sm uppercase tracking-[0.3em] text-black/50">Procesando ronda...</p>
      </div>
    </main>
  `,
})
export class ProcessingRoundComponent {}
