import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginFormComponent } from './login-form/login-form.component';
import { VerifyCodeComponent } from './verify-code/verify-code.component';

const routes: Routes = [
  { path: '', component: LoginFormComponent }, // Rota inicial
  { path: 'verify-code', component: VerifyCodeComponent }, // Verificacao do codigo
  { path: '**', redirectTo: '', pathMatch: 'full' } // Redireciona para a página inicial se a rota não existir
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
