import { AsyncPipe, NgIf, NgSwitch, NgSwitchCase, NgSwitchDefault } from '@angular/common';
import { Component, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BehaviorSubject, combineLatest, map } from 'rxjs';
import { HostApiService } from './host-api.service';
import { HostClientService } from './host-client.service';
import { HostStoreService } from './host-store.service';
import { LobbyComponent } from './ui/lobby.component';
import { HomeComponent } from './ui/home.component';
import { RoleAssignmentComponent } from './ui/role-assignment.component';
import { QuestionsComponent } from './ui/questions.component';
import { DebatePlaceholderComponent } from './ui/debate-placeholder.component';
import { HostSnapshot } from './models';

type GamePhase = 'HOME' | 'LOBBY' | 'ROLE_ASSIGNMENT' | 'QUESTIONS' | 'DEBATE' | 'OTHER';

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
    QuestionsComponent,
    DebatePlaceholderComponent,
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
        <app-questions
          *ngSwitchCase="'QUESTIONS'"
          [players]="vm.snapshot?.players ?? []"
          [answeredPlayerIds]="answeredPlayerIds$ | async"
          (finished)="onQuestionsFinished(vm.snapshot)"
        />
        <app-debate-placeholder *ngSwitchCase="'DEBATE'" />
        <div *ngSwitchDefault class="min-h-dvh flex items-center justify-center text-xl">
          En construcción...
        </div>
      </main>
    </ng-container>
  `,
})
export class GameShellComponent {
  private readonly phaseOverrideSubject = new BehaviorSubject<GamePhase | null>(null);
  private readonly answeredPlayerIdsSubject = new BehaviorSubject<Set<string>>(new Set());
  readonly answeredPlayerIds$ = this.answeredPlayerIdsSubject.asObservable();
  private debateRequestInFlight = false;
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
    private readonly destroyRef: DestroyRef,
  ) {
    this.store.answerEvents$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((payload) => {
      const nextIds = new Set(this.answeredPlayerIdsSubject.value);
      nextIds.add(payload.playerId);
      this.answeredPlayerIdsSubject.next(nextIds);

      const snapshot = this.storeSnapshot();
      if (!snapshot) {
        return;
      }
      const totalPlayers = snapshot.players.length;
      if (totalPlayers > 0 && nextIds.size >= totalPlayers) {
        this.startDebate(snapshot);
      }
    });
  }

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
    this.answeredPlayerIdsSubject.next(new Set());
    this.debateRequestInFlight = false;
  }

  onRoleAssignmentFinished(snapshot: HostSnapshot | null): void {
    if (!snapshot) {
      return;
    }

    this.api.nextRound(snapshot.roomCode).subscribe({
      next: () => {
        this.answeredPlayerIdsSubject.next(new Set());
        this.phaseOverrideSubject.next('QUESTIONS');
      },
      error: () => {
        window.alert('No se pudo avanzar a la siguiente ronda.');
      },
    });
  }

  onQuestionsFinished(snapshot: HostSnapshot | null): void {
    if (!snapshot) {
      return;
    }
    this.startDebate(snapshot);
  }

  private startDebate(snapshot: HostSnapshot): void {
    if (this.debateRequestInFlight) {
      return;
    }
    this.debateRequestInFlight = true;
    this.api.startDebate(snapshot.roomCode).subscribe({
      next: () => {
        this.phaseOverrideSubject.next('DEBATE');
      },
      error: (error) => {
        this.debateRequestInFlight = false;
        const errorCode = error?.error?.error_code as string | undefined;
        if (errorCode === 'HOST_DISCONNECTED') {
          this.client.disconnect();
          this.client.connect(snapshot.roomCode);
          window.alert('Host desconectado. Reiniciamos la conexión.');
          return;
        }
        window.alert('No se pudo iniciar el debate.');
      },
    });
  }

  private storeSnapshot(): HostSnapshot | null {
    return this.store.getSnapshot();
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
