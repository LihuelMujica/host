import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { CreateRoomResponse, HostEvent, HostSnapshot } from './models';

@Injectable({
  providedIn: 'root',
})
export class HostApiService {
  private readonly baseUrl = 'https://caretas.up.railway.app';

  constructor(private readonly http: HttpClient) {}

  createRoom(): Observable<CreateRoomResponse> {
    return this.http.post<CreateRoomResponse>(`${this.baseUrl}/room/create`, {});
  }

  startGame(roomCode: string): Observable<unknown> {
    return this.http.post(`${this.baseUrl}/game/${roomCode}/start`, {
      conjunto: 'string',
      maxRounds: 10,
    });
  }

  nextRound(roomCode: string): Observable<unknown> {
    return this.http.post(`${this.baseUrl}/game/${roomCode}/next-round`, {});
  }

  startDebate(roomCode: string): Observable<unknown> {
    return this.http.post(`${this.baseUrl}/game/${roomCode}/start-debate`, {});
  }

  startVoting(roomCode: string): Observable<unknown> {
    return this.http.post(`${this.baseUrl}/game/${roomCode}/start-voting`, {});
  }

  fetchHostSnapshot(roomCode: string): Observable<HostSnapshot> {
    return this.http
      .get<HostEvent<HostSnapshot>>(`${this.baseUrl}/game/${roomCode}/host/snapshot`)
      .pipe(map((response) => response.payload));
  }
}
