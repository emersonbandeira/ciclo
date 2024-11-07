import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service'; 
import { ReactiveFormsModule } from '@angular/forms';
import { cpfValidator } from '../validators/cpf-validator';
import { NgxMaskDirective } from 'ngx-mask';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, NgxMaskDirective],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  registerForm: FormGroup;
  userEmail: string | null = null; 
  
  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private authService: AuthService, 
    private router: Router
    
  ) {
    this.registerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      nome: ['', Validators.required],
      cpf: ['', [Validators.required, Validators.pattern('^[0-9]*$'), cpfValidator()]], // Aplica o validator do CPF
      data_nascimento: ['', Validators.required],
      senha: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  ngOnInit(): void {
    // Obter o e-mail do usuário do AuthService e definir o valor inicial no formulário
    this.userEmail = this.authService.getUserEmail();
    if (this.userEmail) {
      this.registerForm.patchValue({ email: this.userEmail });
      //this.registerForm.get('email')?.disable(); 
    }
  }

  registerUser() {
    if (this.registerForm.valid) {
      console.log("email: " + this.userEmail);
      this.registerForm.patchValue({email: this.userEmail});
      console.log(this.registerForm.value);
      this.http.post('http://localhost:3000/api/register', this.registerForm.value)
        .subscribe({
          next: () => {
            alert('Usuário cadastrado com sucesso!');
            this.router.navigate(['/main']);
          },
          error: (error) => {
            console.error('Erro no cadastro:', error);
            alert('Erro ao cadastrar usuário.');
          }
        });
    }
  }

  allowOnlyNumbers(event: KeyboardEvent): void {
    const charCode = event.charCode ? event.charCode : event.keyCode;
    if (charCode < 48 || charCode > 57) {
      event.preventDefault();
    }
  }
}
