import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { HostEvent, HostSnapshot } from './models';

@Injectable({
  providedIn: 'root',
})
export class HostStoreService {
  private readonly snapshotSubject = new BehaviorSubject<HostSnapshot | null>(null);
  readonly snapshot$ = this.snapshotSubject.asObservable();

  setSnapshot(snapshot: HostSnapshot): void {
    this.snapshotSubject.next(snapshot);
  }

  applyEvent(event: HostEvent): void {
    if (event.type === 'HOST_SNAPSHOT') {
      this.setSnapshot(event.payload as HostSnapshot);
      return;
    }

    const current = this.snapshotSubject.value;
    if (!current) {
      return;
    }

    switch (event.type) {
      default: {
        this.snapshotSubject.next({ ...current });
        break;
      }
    }
  }
}
