import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common'; 
import { Router } from '@angular/router';

@Component({
  selector: 'app-verify-code',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './verify-code.component.html',
  styleUrls: ['./verify-code.component.css'],
})
export class VerifyCodeComponent {
  codeForm: FormGroup;
  message: string | null = null;

  constructor(private fb: FormBuilder, 
              private http: HttpClient, 
              private router: Router) {
    this.codeForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      code: ['', [Validators.required, Validators.pattern(/^[0-9]{6}$/)]], // Código de 6 dígitos
    });
  }

  submitCode() {
    if (this.codeForm.valid) {
      const { email, code } = this.codeForm.value;
      console.log("code: " + code );
      this.http
        .post<{ message: string }>('/api/verify-code', { email, code })
        .subscribe(
          (response) => (this.router.navigate(['/main'])),
          (error) => {
            this.router.navigate(['/'], {
              queryParams: { error: 'Código inválido ou expirado.' },
            });
          }
        );
    }
  }
}
