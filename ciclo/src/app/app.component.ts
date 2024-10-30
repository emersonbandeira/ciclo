import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  imports: [RouterModule], // Adicione o RouterModule se precisar de rotas
})
export class AppComponent {
  title = 'meu-projeto';
}
