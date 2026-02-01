import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-home',
  standalone: true,
  template: `
    <main class="min-h-dvh flex flex-col items-center justify-center px-6 bg-white text-black">
      <h1
        class="text-center font-sans font-normal tracking-[0.18em] uppercase text-4xl sm:text-5xl md:text-6xl lg:text-7xl"
      >
        GAME TITLE
      </h1>

      <div class="mt-16 sm:mt-20 md:mt-24 flex flex-col items-center gap-4 sm:gap-5">
        <button
          type="button"
          class="text-base sm:text-lg md:text-xl font-semibold tracking-wide underline underline-offset-4 decoration-2 hover:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-black"
          (click)="startGame.emit()"
        >
          JUGAR
        </button>
      </div>
    </main>
  `,
})
export class HomeComponent {
  @Output() readonly startGame = new EventEmitter<void>();
}
