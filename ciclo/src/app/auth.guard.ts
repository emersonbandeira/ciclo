import { CanActivateFn } from '@angular/router';
import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from './auth.service';
import  Swal  from 'sweetalert2';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): boolean {
    if (this.authService.isAuthenticated()) {
      return true;
    } else {
      Swal.fire({
        title: 'Não Autenticado!',
        text: 'Você precisa estar autenticado para acessar esta página.',
        icon: 'warning',
        confirmButtonText: 'OK',
      }).then(() => {
        this.router.navigate(['/login']);
      });
      return false;
    }
  }
}

export const authGuard: CanActivateFn = (route, state) => {
  return true;
};
