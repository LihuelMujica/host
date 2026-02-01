import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CreateRoomResponse } from './models';

@Injectable({
  providedIn: 'root',
})
export class HostApiService {
  private readonly baseUrl = 'https://caretas.up.railway.app';

  constructor(private readonly http: HttpClient) {}

  createRoom(): Observable<CreateRoomResponse> {
    return this.http.post<CreateRoomResponse>(`${this.baseUrl}/room/create`, {});
  }
}
