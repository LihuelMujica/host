import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { GameShellComponent } from './host/game-shell.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [GameShellComponent],
  template: `
    <button
      type="button"
      class="fixed left-4 top-4 z-50 flex items-center gap-2 rounded-full bg-slate-900/80 px-4 py-2 text-sm font-semibold text-white shadow-lg backdrop-blur transition hover:bg-slate-900/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-200"
      (click)="toggleMute()"
      [attr.aria-pressed]="isMuted"
      [attr.aria-label]="isMuted ? 'Activar música' : 'Mutear música'"
    >
      <span class="text-lg" aria-hidden="true">{{ isMuted ? '🔇' : '🔊' }}</span>
      <span>{{ isMuted ? 'Música apagada' : 'Música encendida' }}</span>
    </button>
    <audio #bgMusic src="assets/music.ogg" loop preload="auto"></audio>
    <app-game-shell />
  `,
})
export class AppComponent implements AfterViewInit {
  @ViewChild('bgMusic') bgMusic?: ElementRef<HTMLAudioElement>;
  isMuted = false;

  ngAfterViewInit(): void {
    this.syncAudioState();
  }

  toggleMute(): void {
    this.isMuted = !this.isMuted;
    this.syncAudioState();
  }

  private syncAudioState(): void {
    const audio = this.bgMusic?.nativeElement;
    if (!audio) {
      return;
    }
    audio.muted = this.isMuted;
    if (this.isMuted) {
      audio.pause();
      return;
    }
    void audio.play().catch(() => {
      // Autoplay might be blocked until user interaction.
    });
  }
}
