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
import { BehaviorSubject } from 'rxjs';
import {
  getCountries,
  getStatesOfCountry,
  getCitiesOfState,
  type ICountry,
  type IState,
  type ICity,
} from '@countrystatecity/countries-browser';
import { HttpRoles } from '../../../core/services/http-roles';
import { BackButton } from '../../../shared/components/back-button/back-button';
import { HttpUsers } from '../../../core/services/http-users';
import { AlertService } from '../../../core/services/alert';
import { AsyncPipe, CommonModule, NgClass } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';


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
  const confirmPassword = group.get('ConfirmPassword');

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
  selector: 'app-user-form',
  imports: [ReactiveFormsModule, AsyncPipe, CommonModule, BackButton],
  templateUrl: './user-form.html',
  styleUrl: './user-form.css',
})
export default class UserForm implements OnInit {
  private httpRoles = inject(HttpRoles);
  private httpUsers = inject(HttpUsers);
  private alert = inject(AlertService);
  private activatedRoute = inject(ActivatedRoute);
  private router = inject(Router);

  rolesList$ = new BehaviorSubject<any[]>([]);
  countriesList$ = new BehaviorSubject<ICountry[]>([]);
  departmentsList$ = new BehaviorSubject<IState[]>([]);
  citiesList$ = new BehaviorSubject<ICity[]>([]);
  private selectedCountryIso = '';
  private selectedDepartmentIso = '';

  userFormData: FormGroup;

  // Variables que cambian

  isEditMode = false;
  userId: string | null = null;
  pageTitle = 'Registro Usuario';
  submitButtonText = 'Crear usuario';
  userOwner: boolean = false

  constructor() {
    this.userFormData = new FormGroup(
      {
        username: new FormControl('', [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(20),
        ]),
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
        email: new FormControl('', [Validators.required, Validators.email]),
        password: new FormControl(''),
        ConfirmPassword: new FormControl(''),
        address: new FormGroup({
          country: new FormControl('', [Validators.required]),
          department: new FormControl('', [Validators.required]),
          city: new FormControl('', [Validators.required]),
          street: new FormControl('', [Validators.required]),
          carrera: new FormControl('', [Validators.required]),
      
          neighborhood: new FormControl('',[Validators.required] ),
        }),
        
        rol: new FormControl('', [Validators.required]),
        status: new FormControl('active'),
      },
      { validators: passwordMatchValidator },
    );
  }

  ngOnInit() {
    this.getRoles();
    this.loadCountries();

    this.userId = this.activatedRoute.snapshot.paramMap.get('id');

    if (this.userId) {
      // Si si existe user id, significa que esta en edit, se activa, se cambia el titulo y el texto del boton
      this.isEditMode = true;
      this.pageTitle = 'Editar usuario';
      this.submitButtonText = 'Editar';

      // se desactiva la validacion de la contraseña (antes usaba clearAsyncValidators,
      // que no hacía nada porque no había async validators configurados)
      this.userFormData.get('password')?.clearValidators();
      this.userFormData.get('password')?.updateValueAndValidity();
      this.userFormData.get('ConfirmPassword')?.clearValidators();
      this.userFormData.get('ConfirmPassword')?.updateValueAndValidity();

      //Carga los datos del usuario
      this.loadUserData(this.userId);
    } else {
      // si no existe el user id, esta en modo de crear user, se pone en falso, cambia el titulo y el boton

      // Hace que los campos de contraseña sean requeridos
      this.userFormData
        .get('password')
        ?.setValidators([Validators.required, Validators.minLength(8)]);
      this.userFormData.get('password')?.updateValueAndValidity();

      this.userFormData
        .get('ConfirmPassword')
        ?.setValidators([Validators.required, Validators.minLength(8)]);
      this.userFormData.get('ConfirmPassword')?.updateValueAndValidity();
    }

    this.userFormData.updateValueAndValidity();
  }

  async onSubmit() {
    if (!this.userFormData.valid) {
      return;
    }

    const formValue = this.userFormData.value;

    if(this.userOwner){
     delete formValue.rol

    }

    if (formValue.birthDate && !formValue.birthDate.includes('T')) {
      formValue.birthDate = `${formValue.birthDate}T00:00:00.000+00:00`;
    }

    if (this.isEditMode && this.userId) {
      // Confirmación antes de guardar los cambios (modo edición)
      const confirmed = await this.alert.confirmSave('el usuario', true);
      if (!confirmed) {
        return;
      }

      delete formValue.password

      this.httpUsers.editUserbyId(this.userId, formValue).subscribe({
        next: (data) => {
          console.log(data);
        },
        error: (error) => {
          this.alert.error('No se pudo editar el usuario', error.error?.msg);
          console.log(error);
        },
        complete: () => {
          console.log('Usuario actualizado');
          this.alert.success('Guardado!', 'Usuario actualizado');
          this.router.navigate(['/dashboard/users']);
        },
      });
    } else {
      // si no activa el service de create
      this.httpUsers.createUser(formValue).subscribe({
        next: (data) => {
          console.log(data);
          this.userFormData.reset();
        },
        error: (error) => {
          this.alert.error('No se pudo crear el usuario', error.error?.msg);
          console.log(error);
        },
        complete: () => {
          console.log('Usuario creado');
          this.alert.success('Creado!', 'Usuario creado');
          this.router.navigate(['/dashboard/users']);
        },
      });
    }
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

  async syncAddressLocation(address: any) {
    if (!address) {
      return;
    }

    const countries = await getCountries();
    this.countriesList$.next(countries);

    const matchedCountry = countries.find(
      (c) => c.name.toLowerCase() === (address.country ?? '').toLowerCase(),
    );
    if (!matchedCountry) {
      return;
    }
    this.selectedCountryIso = matchedCountry.iso2;

    const states = await getStatesOfCountry(matchedCountry.iso2);
    this.departmentsList$.next(states);

    const matchedState = states.find(
      (s) => s.name.toLowerCase() === (address.department ?? '').toLowerCase(),
    );
    if (!matchedState) {
      return;
    }
    this.selectedDepartmentIso = matchedState.iso2;

    const cities = await getCitiesOfState(matchedCountry.iso2, matchedState.iso2);
    this.citiesList$.next(cities);
  }

  getRoles() {
    this.httpRoles.getRoles().subscribe({
      next: (roles) => {
        console.log(roles);
        this.rolesList$.next(roles.roles);
      },
      error: (error) => {
        console.log(error);
      },
      complete: () => {
        console.log('Roles cargados');
      },
    });
  }

  loadUserData(userId: string) {
    this.httpUsers.getUserById(userId).subscribe({
      next: (userData: any) => {
        if(userData.user.rol == 'owner'){
          this.userOwner = true
        }
        this.userFormData.patchValue(userData.user);
        console.log(userData.user);



        this.syncAddressLocation(userData.user.address);

        if (userData.user.birthDate) {
          const date = new Date(userData.user.birthDate);
          const formattedDate = date.toISOString().split('T')[0];
          this.userFormData.get('birthDate')?.setValue(formattedDate);
          console.log(formattedDate);
        }
      },
      error: (error) => {
        console.log(error);
      },
    });
  }

  get name() {
    return this.userFormData.get('username');
  }

  get document() {
    return this.userFormData.get('document');
  }

  get birthDate() {
    return this.userFormData.get('birthDate');
  }

  get phoneNumber() {
    return this.userFormData.get('phoneNumber');
  }

  get email() {
    return this.userFormData.get('email');
  }

  get password() {
    return this.userFormData.get('password');
  }

  get confirmPassword() {
    return this.userFormData.get('ConfirmPassword');
  }

  get addressGroup() {
    return this.userFormData.get('address');
  }

  get country() {
    return this.userFormData.get('address.country');
  }

  get street() {
    return this.userFormData.get('address.street');
  }

  get carrera() {
    return this.userFormData.get('address.carrera');
  }

  get neighborhood() {
    return this.userFormData.get('address.neighborhood');
  }

  get city() {
    return this.userFormData.get('address.city');
  }

  get department() {
    return this.userFormData.get('address.department');
  }

  get rol() {
    return this.userFormData.get('rol');
  }

  get firstName() {
    return this.userFormData.get('firstName');
  }
  get middleName() {
    return this.userFormData.get('middleName');
  }
  get lastName() {
    return this.userFormData.get('lastName');
  }
  get secondLastName() {
    return this.userFormData.get('secondLastName');
  }
}