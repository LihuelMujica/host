import { AsyncPipe, NgIf, NgSwitch, NgSwitchCase, NgSwitchDefault } from '@angular/common';
import { Component } from '@angular/core';
import { map } from 'rxjs';
import { HostApiService } from './host-api.service';
import { HostClientService } from './host-client.service';
import { HostStoreService } from './host-store.service';
import { LobbyComponent } from './ui/lobby.component';
import { HomeComponent } from './ui/home.component';
import { HostSnapshot } from './models';

interface GameShellVm {
  phase: 'HOME' | 'LOBBY' | 'OTHER';
  snapshot: HostSnapshot | null;
}

@Component({
  selector: 'app-game-shell',
  standalone: true,
  imports: [AsyncPipe, NgIf, NgSwitch, NgSwitchCase, NgSwitchDefault, LobbyComponent, HomeComponent],
  template: `
    <ng-container *ngIf="vm$ | async as vm">
      <main [ngSwitch]="vm.phase">
        <app-home *ngSwitchCase="'HOME'" (startGame)="onStartGame()" />
        <app-lobby
          *ngSwitchCase="'LOBBY'"
          [roomCode]="vm.snapshot?.roomCode ?? ''"
          [players]="vm.snapshot?.players ?? []"
          (cancel)="onCancel()"
        />
        <div *ngSwitchDefault class="min-h-dvh flex items-center justify-center text-xl">
          En construcción...
        </div>
      </main>
    </ng-container>
  `,
})
export class GameShellComponent {
  readonly vm$ = this.store.snapshot$.pipe(
    map((snapshot) => ({
      snapshot,
      phase: this.resolvePhase(snapshot),
    })),
  );

  constructor(
    private readonly store: HostStoreService,
    private readonly api: HostApiService,
    private readonly client: HostClientService,
  ) {}

  onStartGame(): void {
    this.api.createRoom().subscribe({
      next: (response) => {
        this.store.setSnapshot(response.gameEngine.hostSnapshot);
        this.client.connect(response.roomCode);
      },
      error: () => {
        window.alert('No se pudo crear la sala. Intenta nuevamente.');
      },
    });
  }

  onCancel(): void {
    this.client.disconnect();
    this.store.clearSnapshot();
  }

  private resolvePhase(snapshot: HostSnapshot | null): GameShellVm['phase'] {
    if (!snapshot) {
      return 'HOME';
    }

    if (snapshot.gameState === 'LOBBY') {
      return 'LOBBY';
    }

    return 'OTHER';
  }
}
