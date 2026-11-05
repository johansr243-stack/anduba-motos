import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpAuth } from '../../core/services/http-auth';
import { AlertService } from '../../core/services/alert';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
})
export default class Login {
  httpAuth = inject(HttpAuth);
  alert = inject(AlertService);

  formData: FormGroup;

  constructor() {
    this.formData = new FormGroup({
      username: new FormControl('', [Validators.required]),
      password: new FormControl('', [Validators.required, Validators.minLength(8)]),
    });
  }

  onSubmit() {
    const data = this.formData.value;

    this.httpAuth.login(data.username, data.password).subscribe({
      next: (data ) => {
        this.alert.success('Login exitoso', 'Ya puede ingresar a la app');
        console.log(data);
      },
      error: (error) => {
        this.alert.error('No se pudo inicar sesion', error.error.msg);
        console.log(error);
      },
      complete: () => {
        console.log('yupiii');
      },
    });

    this.formData.reset();

    console.log(data);
  }

  get username() {
    return this.formData.get('username');
  }

  get password() {
    return this.formData.get('password');
  }
}
