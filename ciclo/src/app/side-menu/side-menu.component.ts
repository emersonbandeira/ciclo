import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../auth.service';
import { Observable } from 'rxjs';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-side-menu',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule],
  templateUrl: './side-menu.component.html',
  styleUrl: './side-menu.component.css'
})
export class SideMenuComponent {
  isRegistrationComplete$: Observable<boolean>;
  faExclamationTriangle = faExclamationTriangle;
  

  constructor(private authService: AuthService){
    this.isRegistrationComplete$ = this.authService.isRegistrationComplete$;
    console.log("isRegistrationComplete:"+this.isRegistrationComplete$);
  }


  @Input() isOpen = false;
}
