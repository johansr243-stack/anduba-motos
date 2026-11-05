import { Component, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpAuth } from '../../core/services/http-auth';
import { AlertService } from '../../core/services/alert';

type ResetStep = 'email' | 'code' | 'password';

@Component({
  selector: 'app-reset-password',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.css',
})
export default class ResetPassword {
  private httpAuth = inject(HttpAuth);
  private alert = inject(AlertService);
  private router = inject(Router);

  step = signal<ResetStep>('email');
  loading = signal(false);

  emailControl = new FormControl('', [Validators.required, Validators.email]);
  codeControl = new FormControl('', [
    Validators.required,
    Validators.minLength(4),
    Validators.maxLength(4),
  ]);
  newPasswordControl = new FormControl('', [Validators.required, Validators.minLength(8)]);

  onRequestCode() {
    if (this.emailControl.invalid || this.loading()) return;
    this.loading.set(true);

    this.httpAuth.forgotPassword({ email: this.emailControl.value }).subscribe({
      next: (res) => {
        this.alert.success('Código enviado', res.message);
        this.step.set('code');
      },
      error: (error) => {
        this.alert.error('No se pudo enviar el código', error.error?.msg ?? error.error?.message);
      },
      complete: () => this.loading.set(false),
    });
  }

  onVerifyCode() {
    if (this.codeControl.invalid || this.loading()) return;
    this.loading.set(true);

    const payload = { email: this.emailControl.value, code: this.codeControl.value };

    this.httpAuth.validateCode(payload).subscribe({
      next: (res) => {
        this.alert.success('Código válido', res.message);
        this.step.set('password');
      },
      error: (error) => {
        this.alert.error('Código inválido', error.error?.msg ?? error.error?.message);
      },
      complete: () => this.loading.set(false),
    });
  }

 onResetPassword() {
  if (this.newPasswordControl.invalid || this.loading()) return;
  this.loading.set(true);

  const payload = {
    email: this.emailControl.value,
    code: this.codeControl.value,
    newPassword: this.newPasswordControl.value,
  };

  this.httpAuth.resetPassword(payload).subscribe({
    next: (res) => {
      this.alert.success('Listo', res.message);
      this.router.navigateByUrl('/login');
    },
    error: (error) => {
      this.alert.error(
        'No se pudo cambiar la contraseña',
        error.error?.msg ?? error.error?.message,
      );
    },
    complete: () => this.loading.set(false),
  });
}
  private loginAndRedirect(email: string, password: string) {
    
    this.httpAuth.login(email, password).subscribe({
      error: () => this.router.navigateByUrl('/login'),
      complete: () => this.loading.set(false),
    });
  }
}