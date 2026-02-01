import { Component } from '@angular/core';

@Component({
  selector: 'app-processing-round',
  standalone: true,
  template: `
    <main class="min-h-dvh flex items-center justify-center bg-gradient-to-b from-slate-950 via-indigo-950 to-slate-900 text-slate-100">
      <div class="flex flex-col items-center gap-6">
        <div
          class="h-12 w-12 animate-spin rounded-full border-4 border-emerald-200/20 border-t-fuchsia-200"
          aria-label="Procesando"
        ></div>
        <p class="text-sm uppercase tracking-[0.3em] text-emerald-100/70">Procesando ronda...</p>
      </div>
    </main>
  `,
})
export class ProcessingRoundComponent {}
