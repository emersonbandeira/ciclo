import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute  } from '@angular/router'; 

@Component({
  selector: 'app-login-form',
  standalone: true,
  imports: [ ReactiveFormsModule, CommonModule],
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.css'],
})
export class LoginFormComponent {
  emailForm: FormGroup;
  message: string | null = null;

  constructor(private fb: FormBuilder, 
              private http: HttpClient, 
              private router: Router,
              private route: ActivatedRoute
            ) {
                this.emailForm = this.fb.group({
                email: ['', [Validators.required, Validators.email]],
    });
  }

  ngOnInit(): void {
    // Captura o parâmetro 'error' da URL e exibe a mensagem, se houver
    this.route.queryParams.subscribe((params) => {
      this.message = params['error'] || null;
    });
  }

  submitEmail() {
    if (this.emailForm.valid) {
      const email = this.emailForm.value.email;
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
}
