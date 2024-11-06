// auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { jwtDecode, JwtPayload } from 'jwt-decode';

interface MyTokenPayload extends JwtPayload {
  email: string;
}


@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient, private router: Router) {}

  login(email: string, password: string) {
    return this.http.post<{ token: string }>(`${this.apiUrl}/login`, { email, password }).subscribe(
      (response) => {
        localStorage.setItem('token', response.token); // Armazena o token no localStorage
        this.router.navigate(['/']); // Redireciona para a página principal
      },
      (error) => {
        console.error('Erro de autenticação:', error);
      }
    );

  
  }

  verifyCodeAuth(email: string, code: string){

    return this.http.post<{ token: string }>(`${this.apiUrl}/verifyCodeAuth`, { email, code }).subscribe(
      (response) => {
        localStorage.setItem('token', response.token); // Armazena o token no localStorage
        this.router.navigate(['/main']); // Redireciona para a página principal
      },
      (error) => {
        console.error('Erro de autenticação:', error);
      }
    );

  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    if (token) {
      const decodedToken = jwtDecode<JwtPayload>(token);
      const expiration = decodedToken.exp;
      const currentTime = Math.floor(Date.now() / 1000);
      return expiration ? currentTime < expiration : false;
    }
    return false;
  }

  getUserEmail(): string | null {
    const token = this.getToken();
    if (token) {
      const decodedToken = jwtDecode<MyTokenPayload>(token);
      return decodedToken.email || null;
    }
    return null;
  }

  getToken() {
    return localStorage.getItem('token');
  }

  logout() {
    localStorage.removeItem('token');
    this.router.navigate(['/login']); // Redireciona para a página de login
  }
}
