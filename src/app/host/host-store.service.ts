import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { ConnectionState, HostEvent, HostPlayerSnapshot, HostSnapshot } from './models';

@Injectable({
  providedIn: 'root',
})
export class HostStoreService {
  private readonly snapshotSubject = new BehaviorSubject<HostSnapshot | null>(null);
  readonly snapshot$ = this.snapshotSubject.asObservable();
  private readonly answerEventSubject = new Subject<AnswerEventPayload>();
  readonly answerEvents$ = this.answerEventSubject.asObservable();
  private readonly voteEventSubject = new Subject<VoteEventPayload>();
  readonly voteEvents$ = this.voteEventSubject.asObservable();
  private readonly gameEventSubject = new Subject<GameEventPayload>();
  readonly gameEvents$ = this.gameEventSubject.asObservable();

  setSnapshot(snapshot: HostSnapshot): void {
    this.snapshotSubject.next(this.normalizeSnapshot(snapshot));
  }

  clearSnapshot(): void {
    this.snapshotSubject.next(null);
  }

  getSnapshot(): HostSnapshot | null {
    return this.snapshotSubject.value;
  }

  applyEvent(event: HostEvent): void {
    if (event.type === 'HOST_SNAPSHOT') {
      this.setSnapshot(event.payload as HostSnapshot);
      return;
    }

    if (event.type === 'EMPATE' || event.type === 'GANAN_JUGADORES' || event.type === 'GANA_IMPOSTOR') {
      const roomCode = typeof event.metadata?.roomCode === 'string' ? event.metadata.roomCode : null;
      this.gameEventSubject.next({ type: event.type, payload: event.payload, roomCode });
      return;
    }

    const current = this.snapshotSubject.value;
    if (!current) {
      return;
    }

    switch (event.type) {
      case 'PLAYER_JOINED':
      case 'PLAYER_CONNECTED':
      case 'PLAYER_DISCONNECTED': {
        const payload = event.payload as PlayerEventPayload;
        const players = this.upsertPlayer(current.players, payload);
        this.snapshotSubject.next({ ...current, players });
        break;
      }
      case 'RESPUESTA_ENVIADA': {
        const payload = event.payload as AnswerEventPayload;
        this.answerEventSubject.next(payload);
        break;
      }
      case 'VOTO_ENVIADO': {
        const payload = event.payload as VoteEventPayload;
        this.voteEventSubject.next(payload);
        break;
      }
      default: {
        this.snapshotSubject.next({ ...current });
        break;
      }
    }
  }

  private normalizeSnapshot(snapshot: HostSnapshot): HostSnapshot {
    return {
      ...snapshot,
      players: snapshot.players.map((player) => ({
        ...player,
        connectionState: player.connectionState ?? 'CONNECTED',
      })),
    };
  }

  private upsertPlayer(players: HostPlayerSnapshot[], payload: PlayerEventPayload): HostPlayerSnapshot[] {
    const normalized = this.normalizePlayer(payload);
    const index = players.findIndex((player) => player.playerId === normalized.playerId);
    if (index === -1) {
      return [...players, normalized];
    }

    return players.map((player) =>
      player.playerId === normalized.playerId ? { ...player, ...normalized } : player,
    );
  }

  private normalizePlayer(payload: PlayerEventPayload): HostPlayerSnapshot {
    return {
      playerId: payload.playerId,
      name: payload.name,
      avatarId: payload.avatarId,
      isImpostor: payload.isImpostor ?? payload.impostor ?? false,
      state: payload.state ?? 'IN_LOBBY',
      connectionState: (payload.connectionState ?? 'CONNECTED') as ConnectionState,
    };
  }
}

interface PlayerEventPayload {
  playerId: string;
  name: string;
  avatarId: number;
  state?: string | null;
  connectionState?: ConnectionState | null;
  impostor?: boolean;
  isImpostor?: boolean;
}

interface AnswerEventPayload {
  playerId: string;
  playerName: string;
  answerText: string;
}

interface VoteEventPayload {
  playerId: string;
  playerName: string;
  votedPlayerId: string;
  votedPlayerName: string;
}

interface GameEventPayload {
  type: 'EMPATE' | 'GANAN_JUGADORES' | 'GANA_IMPOSTOR';
  payload: unknown;
  roomCode: string | null;
}
