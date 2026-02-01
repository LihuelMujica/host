import { Component } from '@angular/core';
import { GameShellComponent } from './host/game-shell.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [GameShellComponent],
  template: '<app-game-shell />',
})
export class AppComponent {}
