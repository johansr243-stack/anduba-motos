import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
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
import { HttpAuth } from '../../core/services/http-auth';
import { HttpUsers } from '../../core/services/http-users';
import { HttpHistory } from '../../core/services/http-history';
import { AlertService } from '../../core/services/alert';
import { ImageUrlPipe } from '../../core/pipes/image-url.pipe';

type AccountTab = 'perfil' | 'direccion' | 'seguridad' | 'historial';

@Component({
  selector: 'app-my-account',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ImageUrlPipe],
  // CommonModule ya trae AsyncPipe/CurrencyPipe/DatePipe usados en la pestaña de historial
  templateUrl: './my-account.html',
  styleUrl: './my-account.css',
})
export default class MyAccount implements OnInit {
  private httpAuth = inject(HttpAuth);
  private httpUsers = inject(HttpUsers);
  private httpHistory = inject(HttpHistory);
  private alert = inject(AlertService);
  private router = inject(Router);

  loading = signal(true);
  saving = signal(false);
  feedback = signal<{ type: 'success' | 'error'; message: string } | null>(null);
  activeTab = signal<AccountTab>('perfil');

  tabs: { id: AccountTab; label: string }[] = [
    { id: 'perfil', label: 'Perfil' },
    { id: 'direccion', label: 'Dirección' },
    { id: 'seguridad', label: 'Seguridad' },
    { id: 'historial', label: 'Historial' },
  ];

  // Historial propio del usuario logeado (mismo endpoint que usa el admin
  // para ver el historial de cualquier cliente, aquí con su propio _id)
  history$ = new BehaviorSubject<any>(null);

  getTotal(items: any[] | undefined, field: string): number {
    return (items ?? []).reduce((sum, item) => sum + (item?.[field] || 0), 0);
  }

  // Arma "2x Casco, 1x Aceite" a partir de order.products.
  // Soporta tanto { product: { name }, quantity } (populado) como { name, quantity } plano.
  getProductNames(items: any[] | undefined): string {
    if (!items?.length) return 'Sin productos';
    return items
      .map((item) => {
        const name = item?.product?.name || item?.name || 'Producto sin nombre';
        const qty = item?.quantity ?? 1;
        return `${qty}x ${name}`;
      })
      .join(', ');
  }

  get tabIndex(): number {
    return this.tabs.findIndex((t) => t.id === this.activeTab());
  }

  userId = signal<string | null>(null);
  roleLabel = signal('');
  memberSince = signal('');
  maxBirthDate = new Date().toISOString().slice(0, 10);


  countriesList$ = new BehaviorSubject<ICountry[]>([]);
  departmentsList$ = new BehaviorSubject<IState[]>([]);
  citiesList$ = new BehaviorSubject<ICity[]>([]);
  private selectedCountryIso = '';
  private selectedDepartmentIso = '';

  form = new FormGroup({
    firstName: new FormControl('', [Validators.required, Validators.maxLength(50)]),
    middleName: new FormControl('', Validators.maxLength(50)),
    lastName: new FormControl('', [Validators.required, Validators.maxLength(50)]),
    secondLastName: new FormControl('', Validators.maxLength(50)),
    username: new FormControl('', Validators.required),
    phoneNumber: new FormControl('', [Validators.required, Validators.maxLength(13)]),
    email: new FormControl('', [Validators.required, Validators.email]),
    document: new FormControl('', Validators.required),
    birthDate: new FormControl('', Validators.required),
    address: new FormGroup({
      country: new FormControl('', Validators.required),
      department: new FormControl('', Validators.required),
      city: new FormControl('', Validators.required),
      street: new FormControl('', Validators.required),
      carrera: new FormControl('', Validators.required),
      neighborhood: new FormControl('', Validators.required),
    }),
  });

  get addressGroup() {
    return this.form.get('address');
  }

  get initials(): string {
    const f = this.form.value.firstName?.[0] ?? '';
    const l = this.form.value.lastName?.[0] ?? '';
    return (f + l).toUpperCase() || '?';
  }

  ngOnInit(): void {
    this.loadCountries();

   
    const user = this.httpAuth.user;
    if (!user?._id) {
      this.loading.set(false);
      this.feedback.set({ type: 'error', message: 'Debes iniciar sesión para ver tu cuenta.' });
      return;
    }

    this.userId.set(user._id);
    this.fetchUser(user._id);
    this.loadHistory(user._id);
  }

  private loadHistory(userId: string): void {
    this.httpHistory.getHistoryByUserId(userId).subscribe({
      next: (res: any) => this.history$.next(res?.history ?? null),
      error: (err) => {
        if (err?.status !== 404) console.error('[my-account] error al pedir el historial:', err);
        this.history$.next(null);
      },
    });
  }

  selectTab(id: AccountTab) {
    this.activeTab.set(id);
  }

  async loadCountries() {
    const countries = await getCountries();
    this.countriesList$.next(countries);
  }

  fetchUser(userId: string) {
    this.loading.set(true);
    this.httpUsers.getUserById(userId).subscribe({
      next: (res: any) => {
        
        const userData = res?.user ?? res?.data ?? res;
        this.populateForm(userData);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('[my-account] error al pedir el usuario:', err);
        this.loading.set(false);
        this.feedback.set({ type: 'error', message: 'No pudimos cargar tu información. Intenta de nuevo.' });
      },
    });
  }

  private populateForm(userData: any) {
    this.roleLabel.set(this.mapRole(userData?.rol));
    this.memberSince.set(this.formatMonthYear(userData?.createdAt));

    this.form.patchValue({
      firstName: userData?.firstName,
      middleName: userData?.middleName,
      lastName: userData?.lastName,
      secondLastName: userData?.secondLastName,
      username: userData?.username,
      phoneNumber: userData?.phoneNumber,
      email: userData?.email,
      document: userData?.document ?? '',
      birthDate: this.toDateInputValue(userData?.birthDate),
      address: {
        country: userData?.address?.country ?? '',
        department: userData?.address?.department ?? '',
        city: userData?.address?.city ?? '',
        street: userData?.address?.street ?? '',
        carrera: userData?.address?.carrera ?? '',
        neighborhood: userData?.address?.neighborhood ?? '',
      },
    });
    this.form.markAsPristine();


    this.syncAddressLocation(userData?.address);
  }


  async syncAddressLocation(address: any) {
    if (!address) return;

    const countries = await getCountries();
    this.countriesList$.next(countries);

    const matchedCountry = countries.find(
      (c) => c.name.toLowerCase() === (address.country ?? '').toLowerCase(),
    );
    if (!matchedCountry) return;
    this.selectedCountryIso = matchedCountry.iso2;

    const states = await getStatesOfCountry(matchedCountry.iso2);
    this.departmentsList$.next(states);

    const matchedState = states.find(
      (s) => s.name.toLowerCase() === (address.department ?? '').toLowerCase(),
    );
    if (!matchedState) return;
    this.selectedDepartmentIso = matchedState.iso2;

    const cities = await getCitiesOfState(matchedCountry.iso2, matchedState.iso2);
    this.citiesList$.next(cities);
  }

  async onCountryChange(countryName: string) {
    const country = this.countriesList$.value.find((c) => c.name === countryName);
    this.selectedCountryIso = country?.iso2 ?? '';
    this.selectedDepartmentIso = '';

    this.addressGroup?.get('department')?.setValue('');
    this.addressGroup?.get('city')?.setValue('');
    this.departmentsList$.next([]);
    this.citiesList$.next([]);

    if (!this.selectedCountryIso) return;

    const states = await getStatesOfCountry(this.selectedCountryIso);
    this.departmentsList$.next(states);
  }

  async onDepartmentChange(departmentName: string) {
    const department = this.departmentsList$.value.find((s) => s.name === departmentName);
    this.selectedDepartmentIso = department?.iso2 ?? '';

    this.addressGroup?.get('city')?.setValue('');
    this.citiesList$.next([]);

    if (!this.selectedCountryIso || !this.selectedDepartmentIso) return;

    const cities = await getCitiesOfState(this.selectedCountryIso, this.selectedDepartmentIso);
    this.citiesList$.next(cities);
  }

  save() {
    const userId = this.userId();
    if (this.form.invalid || !userId) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    const payload = this.form.value;

    this.httpUsers.editUserbyId(userId, payload).subscribe({
      next: () => {
        this.saving.set(false);
        this.alert.success('Guardado!', 'Tus datos se actualizaron correctamente.');
        this.form.markAsPristine();
      },
      error: (err) => {
        this.saving.set(false);
        this.alert.error('No se pudo guardar', err?.error?.msg ?? 'Intenta de nuevo.');
      },
    });
  }

  requestPasswordReset(): void {
    this.router.navigateByUrl('/forgot-password');
  }

  discardChanges() {
    const userId = this.userId();
    if (!userId) return;
    this.fetchUser(userId);
  }

  private mapRole(rol: string): string {
    const map: Record<string, string> = {
      admin: 'Administrador',
      owner: 'Propietario',
      employee: 'Empleado',
      client: 'Cliente',
    };
    return map[rol] ?? rol ?? '';
  }

  private toDateInputValue(dateStr: string): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (Number.isNaN(date.getTime())) return '';
    return date.toISOString().slice(0, 10);
  }

  private formatMonthYear(dateStr: string): string {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('es-CO', { year: 'numeric', month: 'long' });
  }
}