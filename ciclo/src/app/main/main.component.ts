import { Component, OnInit } from '@angular/core';
import { SideMenuComponent } from '../side-menu/side-menu.component';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import  Swal  from 'sweetalert2';

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [SideMenuComponent],
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css'],
})
export class MainComponent implements OnInit {
  isMenuOpen = false;
  userEmail: string | null = null;
  
  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    if (!this.authService.isAuthenticated()) {
      // Redireciona para a página de login se o token não for válido
      console.log("Não autenticado! Redirecioando pro login");
      this.router.navigate(['/login']);
    }
    this.userEmail = this.authService.getUserEmail();
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  logout() {
    Swal.fire({
      title: 'Você tem certeza?',
      text: "Você será deslogado da aplicação.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sim, sair',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.authService.logout();
        Swal.fire({
          title: 'Logout realizado!',
          text: 'Você foi deslogado com sucesso.',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });
      }
    });
     
  }

}
