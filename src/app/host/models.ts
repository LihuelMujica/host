export type GameState =
  | 'LOBBY'
  | 'ASIGNANDO_ROLES'
  | 'RESPONDIENDO'
  | 'DEBATIENDO'
  | 'VOTANDO'
  | 'EMPATE'
  | 'GANA_IMPOSTOR'
  | 'GANAN_JUGADORES';

export type ConnectionState = 'CONNECTED' | 'DISCONNECTED';

export interface HostPlayerSnapshot {
  playerId: string;
  name: string;
  avatarId: number;
  isImpostor: boolean;
  state: string;
  connectionState: ConnectionState;
}

export interface HostSnapshot {
  roomCode: string;
  gameId: string;
  questionSetName: string | null;
  gameState: GameState;
  hostConnectionState: ConnectionState | null;
  roundNumber: number;
  cycleNumber: number;
  players: HostPlayerSnapshot[];
}

export interface HostEvent<TPayload = unknown> {
  type: string;
  metadata?: Record<string, unknown>;
  payload: TPayload;
}

export interface CreateRoomResponse {
  roomCode: string;
  gameId: string;
  gameEngine: {
    hostSnapshot: HostSnapshot;
  };
}
