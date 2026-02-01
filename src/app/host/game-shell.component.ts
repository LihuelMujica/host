import { AsyncPipe, NgIf, NgSwitch, NgSwitchCase, NgSwitchDefault } from '@angular/common';
import { Component } from '@angular/core';
import { BehaviorSubject, combineLatest, map } from 'rxjs';
import { HostApiService } from './host-api.service';
import { HostClientService } from './host-client.service';
import { HostStoreService } from './host-store.service';
import { LobbyComponent } from './ui/lobby.component';
import { HomeComponent } from './ui/home.component';
import { RoleAssignmentComponent } from './ui/role-assignment.component';
import { QuestionsPlaceholderComponent } from './ui/questions-placeholder.component';
import { HostSnapshot } from './models';

type GamePhase = 'HOME' | 'LOBBY' | 'ROLE_ASSIGNMENT' | 'QUESTIONS' | 'OTHER';

interface GameShellVm {
  phase: GamePhase;
  snapshot: HostSnapshot | null;
}

@Component({
  selector: 'app-game-shell',
  standalone: true,
  imports: [
    AsyncPipe,
    NgIf,
    NgSwitch,
    NgSwitchCase,
    NgSwitchDefault,
    LobbyComponent,
    HomeComponent,
    RoleAssignmentComponent,
    QuestionsPlaceholderComponent,
  ],
  template: `
    <ng-container *ngIf="vm$ | async as vm">
      <main [ngSwitch]="vm.phase">
        <app-home *ngSwitchCase="'HOME'" (startGame)="onStartGame()" />
        <app-lobby
          *ngSwitchCase="'LOBBY'"
          [roomCode]="vm.snapshot?.roomCode ?? ''"
          [players]="vm.snapshot?.players ?? []"
          (cancel)="onCancel()"
          (start)="onLobbyStart(vm.snapshot)"
        />
        <app-role-assignment
          *ngSwitchCase="'ROLE_ASSIGNMENT'"
          (finished)="onRoleAssignmentFinished(vm.snapshot)"
        />
        <app-questions-placeholder *ngSwitchCase="'QUESTIONS'" />
        <div *ngSwitchDefault class="min-h-dvh flex items-center justify-center text-xl">
          En construcción...
        </div>
      </main>
    </ng-container>
  `,
})
export class GameShellComponent {
  private readonly phaseOverrideSubject = new BehaviorSubject<GamePhase | null>(null);
  readonly vm$ = combineLatest([this.store.snapshot$, this.phaseOverrideSubject]).pipe(
    map(([snapshot, phaseOverride]) => ({
      snapshot,
      phase: phaseOverride ?? this.resolvePhase(snapshot),
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

  onLobbyStart(snapshot: HostSnapshot | null): void {
    if (!snapshot) {
      return;
    }

    this.api.startGame(snapshot.roomCode).subscribe({
      next: () => {
        this.phaseOverrideSubject.next('ROLE_ASSIGNMENT');
      },
      error: (error) => {
        const errorCode = error?.error?.error_code as string | undefined;
        if (errorCode === 'HOST_DISCONNECTED') {
          this.client.disconnect();
          this.client.connect(snapshot.roomCode);
          window.alert('Host desconectado. Reiniciamos la conexión.');
          return;
        }
        if (errorCode === 'VALIDATION_ERROR') {
          window.alert('No hay suficientes jugadores para iniciar la partida.');
          return;
        }
        window.alert('No se pudo iniciar la partida.');
      },
    });
  }

  onCancel(): void {
    this.client.disconnect();
    this.store.clearSnapshot();
    this.phaseOverrideSubject.next(null);
  }

  onRoleAssignmentFinished(snapshot: HostSnapshot | null): void {
    if (!snapshot) {
      return;
    }

    this.api.nextRound(snapshot.gameId).subscribe({
      next: () => {
        this.phaseOverrideSubject.next('QUESTIONS');
      },
      error: () => {
        window.alert('No se pudo avanzar a la siguiente ronda.');
      },
    });
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
