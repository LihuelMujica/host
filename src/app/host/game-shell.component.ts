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
import { DebateComponent } from './ui/debate.component';
import { VotationComponent } from './ui/votation.component';
import { HostSnapshot } from './models';

type GamePhase = 'HOME' | 'LOBBY' | 'ROLE_ASSIGNMENT' | 'QUESTIONS' | 'DEBATE' | 'VOTACION' | 'OTHER';

interface GameShellVm {
  phase: GamePhase;
  snapshot: HostSnapshot | null;
}

interface DebateData {
  question: string;
  answers: { playerName: string; answerText: string }[];
  totalSeconds: number;
}

interface VotationData {
  players: HostSnapshot['players'];
  voteCounts: Record<string, number>;
  totalSeconds: number;
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
    DebateComponent,
    VotationComponent,
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
        <app-debate
          *ngSwitchCase="'DEBATE'"
          [question]="debateData?.question ?? ''"
          [answers]="debateData?.answers ?? []"
          [totalSeconds]="debateData?.totalSeconds ?? 0"
          (finished)="onDebateFinished()"
        />
        <app-votation
          *ngSwitchCase="'VOTACION'"
          [players]="votationData?.players ?? []"
          [voteCounts]="votationData?.voteCounts ?? {}"
          [totalSeconds]="votationData?.totalSeconds ?? 20"
          (finished)="onVotationFinished()"
        />
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
  debateData: DebateData | null = null;
  votationData: VotationData | null = null;
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

    this.store.voteEvents$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((payload) => {
      const current = this.votationData?.voteCounts ?? {};
      const nextCounts = { ...current };
      nextCounts[payload.votedPlayerId] = (nextCounts[payload.votedPlayerId] ?? 0) + 1;
      this.votationData = this.votationData
        ? { ...this.votationData, voteCounts: nextCounts }
        : { players: [], voteCounts: nextCounts, totalSeconds: 20 };
    });

    this.store.snapshot$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((snapshot) => this.handleSnapshotPhase(snapshot));
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
    this.debateData = null;
    this.votationData = null;
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
        this.loadDebateData(snapshot.roomCode);
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

  onDebateFinished(): void {
    const snapshot = this.storeSnapshot();
    if (!snapshot) {
      return;
    }
    this.api.startVoting(snapshot.roomCode).subscribe({
      next: () => {
        this.loadVotationData(snapshot);
      },
      error: (error) => {
        const errorCode = error?.error?.error_code as string | undefined;
        if (errorCode === 'HOST_DISCONNECTED') {
          this.client.disconnect();
          this.client.connect(snapshot.roomCode);
          window.alert('Host desconectado. Reiniciamos la conexión.');
          return;
        }
        window.alert('No se pudo iniciar la votación.');
      },
    });
  }

  onVotationFinished(): void {
    const snapshot = this.storeSnapshot();
    if (!snapshot) {
      return;
    }
    this.api.processRound(snapshot.roomCode).subscribe({
      next: () => {
        this.phaseOverrideSubject.next('OTHER');
      },
      error: (error) => {
        const errorCode = error?.error?.error_code as string | undefined;
        if (errorCode === 'HOST_DISCONNECTED') {
          this.client.disconnect();
          this.client.connect(snapshot.roomCode);
          window.alert('Host desconectado. Reiniciamos la conexión.');
          return;
        }
        window.alert('No se pudo procesar la ronda.');
      },
    });
  }

  private loadDebateData(roomCode: string): void {
    this.api.fetchHostSnapshot(roomCode).subscribe({
      next: (snapshot) => {
        const question = snapshot.playerQuestion?.pregunta ?? '';
        const answers = (snapshot.currentRoundAnswers ?? [])
          .filter((answer) => answer.answerText?.trim())
          .map((answer) => ({
            playerName: answer.playerName,
            answerText: answer.answerText,
          }));
        const totalSeconds = answers.length * 10;
        this.debateData = {
          question,
          answers,
          totalSeconds,
        };
        this.phaseOverrideSubject.next('DEBATE');
      },
      error: () => {
        this.debateData = {
          question: '',
          answers: [],
          totalSeconds: 0,
        };
      },
    });
  }

  private handleSnapshotPhase(snapshot: HostSnapshot | null): void {
    if (!snapshot) {
      return;
    }
    if (snapshot.gameState === 'VOTANDO') {
      this.loadVotationData(snapshot);
      return;
    }
  }

  private loadVotationData(snapshot: HostSnapshot): void {
    const counts = (snapshot.currentRoundVotes ?? []).reduce<Record<string, number>>((acc, vote) => {
      const key = vote.votedPlayerId;
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    }, {});
    this.votationData = {
      players: snapshot.players,
      voteCounts: counts,
      totalSeconds: 20,
    };
    this.phaseOverrideSubject.next('VOTACION');
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

    if (snapshot.gameState === 'VOTANDO') {
      return 'VOTACION';
    }

    return 'OTHER';
  }
}
