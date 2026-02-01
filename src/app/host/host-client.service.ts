import { Injectable, NgZone } from '@angular/core';
import { HostStoreService } from './host-store.service';
import { HostEvent } from './models';

@Injectable({
  providedIn: 'root',
})
export class HostClientService {
  private eventSource: EventSource | null = null;
  private reconnectAttempts = 0;
  private readonly maxBackoffMs = 10000;
  private roomCode: string | null = null;

  constructor(
    private readonly store: HostStoreService,
    private readonly zone: NgZone,
  ) {}

  connect(roomCode: string): void {
    this.roomCode = roomCode;
    localStorage.setItem('host_room_code', roomCode);
    this.startEventSource();
  }

  disconnect(): void {
    this.eventSource?.close();
    this.eventSource = null;
  }

  private startEventSource(): void {
    if (!this.roomCode) {
      return;
    }

    this.eventSource?.close();
    const url = `https://caretas.up.railway.app/sse/host?roomName=${this.roomCode}`;
    this.eventSource = new EventSource(url);

    const handleEvent = (event: MessageEvent<string>) => {
      this.reconnectAttempts = 0;
      const parsed = this.safeParse(event.data);
      if (!parsed) {
        return;
      }
      this.zone.run(() => this.store.applyEvent(parsed));
    };

    this.eventSource.onmessage = handleEvent;
    [
      'HOST_SNAPSHOT',
      'PLAYER_JOINED',
      'PLAYER_CONNECTED',
      'PLAYER_DISCONNECTED',
      'RESPUESTA_ENVIADA',
      'VOTO_ENVIADO',
      'EMPATE',
      'GANAN_JUGADORES',
      'GANA_IMPOSTOR',
    ].forEach((type) => {
      this.eventSource?.addEventListener(type, handleEvent as EventListener);
    });

    this.eventSource.onerror = () => {
      this.eventSource?.close();
      this.eventSource = null;
      this.reconnectWithBackoff();
    };
  }

  private reconnectWithBackoff(): void {
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), this.maxBackoffMs);
    this.reconnectAttempts += 1;
    window.setTimeout(() => this.startEventSource(), delay);
  }

  private safeParse(raw: string): HostEvent | null {
    try {
      return JSON.parse(raw) as HostEvent;
    } catch {
      const start = raw.indexOf('{');
      const end = raw.lastIndexOf('}');
      if (start === -1 || end === -1 || end <= start) {
        console.warn('[HostClient] No se pudo parsear el evento SSE.', raw);
        return null;
      }
      try {
        return JSON.parse(raw.slice(start, end + 1)) as HostEvent;
      } catch {
        console.warn('[HostClient] No se pudo parsear el JSON extraído del SSE.', raw);
        return null;
      }
    }
  }
}
