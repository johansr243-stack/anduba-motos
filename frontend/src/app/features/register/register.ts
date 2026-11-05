import { Component, inject, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AsyncPipe } from '@angular/common';
import { BehaviorSubject } from 'rxjs';
import {
  getCountries,
  getStatesOfCountry,
  getCitiesOfState,
  type ICountry,
  type IState,
  type ICity,
} from '@countrystatecity/countries-browser';
import { HttpAuth } from '../../core/services/http-auth';
import { AlertService } from '../../core/services/alert';

function minAgeValidator(minAge: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null;
    }

    const birthDate = new Date(control.value);
    const today = new Date();

    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age < minAge ? { underage: { requiredAge: minAge, actualAge: age } } : null;
  };
}

function passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
  const password = group.get('password');
  const confirmPassword = group.get('confirmPassword');

  if (!password || !confirmPassword) {
    return null;
  }

  if (password.value !== confirmPassword.value) {
    confirmPassword.setErrors({ ...confirmPassword.errors, passwordMismatch: true });
    return { passwordMismatch: true };
  }

  if (confirmPassword.errors) {
    const { passwordMismatch, ...rest } = confirmPassword.errors;
    confirmPassword.setErrors(Object.keys(rest).length ? rest : null);
  }

  return null;
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, AsyncPipe],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export default class Register implements OnInit {
  formData: FormGroup;
  httpAuth = inject(HttpAuth)
  alert = inject(AlertService)
  router = inject(Router)

  readonly steps = [1, 2, 3];
  readonly totalSteps = 3;
  currentStep = 1;

  readonly stepTitles: Record<number, string> = {
    1: 'Crea tu cuenta',
    2: 'Cuéntanos quién eres',
    3: 'Dirección de envío',
  };

  readonly stepSubtitles: Record<number, string> = {
    1: 'Regístrate para gestionar tus motos y servicios',
    2: 'Necesitamos estos datos para tu perfil',
    3: 'A dónde te enviamos tus pedidos',
  };

  countriesList$ = new BehaviorSubject<ICountry[]>([]);
  departmentsList$ = new BehaviorSubject<IState[]>([]);
  citiesList$ = new BehaviorSubject<ICity[]>([]);
  private selectedCountryIso = '';
  private selectedDepartmentIso = '';

  constructor() {
    this.formData = new FormGroup(
      {
        // Paso 1 — Cuenta
        username: new FormControl('', [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(20),
        ]),
        email: new FormControl('', [Validators.required, Validators.email]),
        password: new FormControl('', [Validators.required, Validators.minLength(8)]),
        confirmPassword: new FormControl('', [Validators.required, Validators.minLength(8)]),
        terms: new FormControl(false, [Validators.requiredTrue]),

        // Paso 2 — Datos personales
        firstName: new FormControl('', [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(50),
        ]),
        middleName: new FormControl('', [Validators.minLength(2), Validators.maxLength(50)]),
        lastName: new FormControl('', [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(50),
        ]),
        secondLastName: new FormControl('', [Validators.maxLength(50)]),
        document: new FormControl('', [Validators.required, Validators.maxLength(16)]),
        birthDate: new FormControl('', [Validators.required, minAgeValidator(18)]),
        phoneNumber: new FormControl('', [Validators.required, Validators.maxLength(13)]),

        // Paso 3 — Dirección de envío
        address: new FormGroup({
          country: new FormControl('', [Validators.required]),
          department: new FormControl('', [Validators.required]),
          city: new FormControl('', [Validators.required]),
          neighborhood: new FormControl('', [Validators.required]),
          street: new FormControl('', [Validators.required]),
          carrera: new FormControl('', [Validators.required]),
        }),
      },
      { validators: passwordMatchValidator },
    );
  }

  ngOnInit() {
    this.loadCountries();
  }



  private getStepControls(step: number): AbstractControl[] {
    switch (step) {
      case 1:
        return [this.username, this.email, this.password, this.confirmPassword, this.terms].filter(
          (c): c is AbstractControl => !!c,
        );
      case 2:
        return [
          this.firstName,
          this.middleName,
          this.lastName,
          this.secondLastName,
          this.document,
          this.birthDate,
          this.phoneNumber,
        ].filter((c): c is AbstractControl => !!c);
      case 3:
        return [this.country, this.department, this.city, this.neighborhood, this.street, this.carrera].filter(
          (c): c is AbstractControl => !!c,
        );
      default:
        return [];
    }
  }

  isStepValid(step: number): boolean {
    return this.getStepControls(step).every((control) => control.valid);
  }

  private markStepTouched(step: number) {
    this.getStepControls(step).forEach((control) => control.markAsTouched());
  }

  nextStep() {
    if (!this.isStepValid(this.currentStep)) {
      this.markStepTouched(this.currentStep);
      return;
    }
    this.currentStep = Math.min(this.currentStep + 1, this.totalSteps);
  }

  prevStep() {
    this.currentStep = Math.max(this.currentStep - 1, 1);
  }

  goToStep(step: number) {

    for (let s = 1; s < step; s++) {
      if (!this.isStepValid(s)) {
        this.markStepTouched(s);
        this.currentStep = s;
        return;
      }
    }
    this.currentStep = step;
  }


  onSubmit() {
    if (this.formData.invalid) {
      return;
    }
     const formValue = this.formData.value
     delete formValue.terms
    this.httpAuth.register(formValue).subscribe({
      next:(data)=>{
        this.alert.success('Registrado','Ha sido registrado correctamente')
        this.router.navigateByUrl('/home')
      },
      error:(err)=>{
        this.alert.error('Error al registar', err?.error?.msg)
      }
    })
  }


  async loadCountries() {
    const countries = await getCountries();
    this.countriesList$.next(countries);
  }

  async onCountryChange(countryName: string) {
    const country = this.countriesList$.value.find((c) => c.name === countryName);
    this.selectedCountryIso = country?.iso2 ?? '';
    this.selectedDepartmentIso = '';

    this.addressGroup?.get('department')?.setValue('');
    this.addressGroup?.get('city')?.setValue('');
    this.departmentsList$.next([]);
    this.citiesList$.next([]);

    if (!this.selectedCountryIso) {
      return;
    }

    const states = await getStatesOfCountry(this.selectedCountryIso);
    this.departmentsList$.next(states);
  }

  async onDepartmentChange(departmentName: string) {
    const department = this.departmentsList$.value.find((s) => s.name === departmentName);
    this.selectedDepartmentIso = department?.iso2 ?? '';

    this.addressGroup?.get('city')?.setValue('');
    this.citiesList$.next([]);

    if (!this.selectedCountryIso || !this.selectedDepartmentIso) {
      return;
    }

    const cities = await getCitiesOfState(this.selectedCountryIso, this.selectedDepartmentIso);
    this.citiesList$.next(cities);
  }



  get username() {
    return this.formData.get('username');
  }
  get email() {
    return this.formData.get('email');
  }
  get password() {
    return this.formData.get('password');
  }
  get confirmPassword() {
    return this.formData.get('confirmPassword');
  }
  get terms() {
    return this.formData.get('terms');
  }

  get firstName() {
    return this.formData.get('firstName');
  }
  get middleName() {
    return this.formData.get('middleName');
  }
  get lastName() {
    return this.formData.get('lastName');
  }
  get secondLastName() {
    return this.formData.get('secondLastName');
  }
  get document() {
    return this.formData.get('document');
  }
  get birthDate() {
    return this.formData.get('birthDate');
  }
  get phoneNumber() {
    return this.formData.get('phoneNumber');
  }

  get addressGroup() {
    return this.formData.get('address');
  }
  get country() {
    return this.formData.get('address.country');
  }
  get department() {
    return this.formData.get('address.department');
  }
  get city() {
    return this.formData.get('address.city');
  }
  get neighborhood() {
    return this.formData.get('address.neighborhood');
  }
  get street() {
    return this.formData.get('address.street');
  }
  get carrera() {
    return this.formData.get('address.carrera');
  }
}