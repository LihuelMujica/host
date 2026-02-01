import { Injectable } from '@angular/core';
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

  constructor(private readonly store: HostStoreService) {}

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

    this.eventSource.onmessage = (event) => {
      this.reconnectAttempts = 0;
      const parsed = this.safeParse(event.data);
      if (!parsed) {
        return;
      }
      this.store.applyEvent(parsed);
    };

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
      return null;
    }
  }
}
