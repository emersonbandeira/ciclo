import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute  } from '@angular/router'; 
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login-form',
  standalone: true,
  imports: [ ReactiveFormsModule, CommonModule],
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.css'],
})
export class LoginFormComponent {
  loginForm: FormGroup;
  isCodeLogin = true;
  message: string | null = null;
  isRegistrationComplete = false;

  constructor(private fb: FormBuilder, 
              private http: HttpClient, 
              private router: Router,
              private route: ActivatedRoute,
              private authService: AuthService
            ) {
                this.loginForm = this.fb.group({
                email: ['', [Validators.required, Validators.email]],
                password: ['']
    });
  }

  ngOnInit(): void {
    // Captura o parâmetro 'error' da URL e exibe a mensagem, se houver
    this.route.queryParams.subscribe((params) => {
      this.message = params['error'] || null;
    });
  }

  toggleLoginMode() {
    this.isCodeLogin = !this.isCodeLogin;
    this.message = null;
    this.loginForm.get('password')?.setValue(''); // Limpa o campo de senha ao alternar modo
  }
  
  submitEmail() {
    if (this.loginForm.valid) {
      const email = this.loginForm.value.email;
      console.log("email: " + email);
      this.http
        .post<{ message: string }>('/api/send-code', { email })
        .subscribe(
          (response) => {
            this.message = response.message;
            this.router.navigate(['/verify-code']);
          },
          (error) => (this.message = 'Erro ao enviar o código, tente novamente.')
        );
    }
  }

  loginWithPassword() {
    const { email, password } = this.loginForm.value;

    this.http.post<{ token: string }>('http://localhost:3000/api/login', { email, password }).subscribe({
      next: (response) => {
        localStorage.setItem('token', response.token);
        
        // Verifica o status do cadastro e atualiza o BehaviorSubject
        this.authService.checkRegistrationStatus(email).subscribe({
          next: (data) => {
            this.authService.setRegistrationCompleteStatus(data.cadastroCompleto);
            this.router.navigate(['/main']);
          },
          error: (error) => {
            console.error('Erro ao verificar o status do cadastro:', error);
          }
        });
      },
      error: (error) => {
        this.message = 'E-mail ou senha incorretos.';
        console.error(error);
      }
    });
  }
}
