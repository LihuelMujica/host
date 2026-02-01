import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { GameShellComponent } from './host/game-shell.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [GameShellComponent],
  template: `
    <div
      class="fixed left-4 top-4 z-50 flex items-center gap-3 rounded-full bg-slate-900/80 px-4 py-2 text-sm font-semibold text-white shadow-lg backdrop-blur"
    >
      <button
        type="button"
        class="flex items-center gap-2 transition hover:text-slate-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-200"
        (click)="toggleMute()"
        [attr.aria-pressed]="isMuted"
        [attr.aria-label]="isMuted ? 'Activar música' : 'Mutear música'"
      >
        <span class="text-lg" aria-hidden="true">{{ isMuted ? '🔇' : '🔊' }}</span>
        <span>{{ isMuted ? 'Música apagada' : 'Música encendida' }}</span>
      </button>
      <input
        type="range"
        class="h-2 w-24 accent-sky-400"
        min="0"
        max="100"
        [value]="volume"
        (input)="onVolumeInput($event)"
        [attr.aria-label]="'Volumen de la música'"
      />
      <span class="text-xs tabular-nums text-slate-200">{{ volume }}%</span>
    </div>
    <audio #bgMusic src="assets/music.ogg" loop preload="auto" autoplay></audio>
    <app-game-shell />
  `,
})
export class AppComponent implements AfterViewInit {
  @ViewChild('bgMusic') bgMusic?: ElementRef<HTMLAudioElement>;
  isMuted = false;
  volume = 70;
  private resumeOnInteraction = false;

  ngAfterViewInit(): void {
    this.syncAudioState();
  }

  toggleMute(): void {
    this.isMuted = !this.isMuted;
    this.syncAudioState();
  }

  onVolumeInput(event: Event): void {
    const target = event.target as HTMLInputElement | null;
    const nextVolume = Number(target?.value ?? this.volume);
    this.volume = Number.isNaN(nextVolume) ? this.volume : nextVolume;
    if (this.volume > 0 && this.isMuted) {
      this.isMuted = false;
    }
    this.syncAudioState();
  }

  private syncAudioState(): void {
    const audio = this.bgMusic?.nativeElement;
    if (!audio) {
      return;
    }
    audio.volume = Math.min(1, Math.max(0, this.volume / 100));
    audio.muted = this.isMuted;
    if (this.isMuted) {
      audio.pause();
      return;
    }
    void audio.play().catch(() => {
      if (this.resumeOnInteraction) {
        return;
      }
      this.resumeOnInteraction = true;
      const resume = () => {
        this.resumeOnInteraction = false;
        void audio.play();
      };
      window.addEventListener('pointerdown', resume, { once: true });
      window.addEventListener('keydown', resume, { once: true });
    });
  }
}
