import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { map, shareReplay, tap } from 'rxjs';

@Service()
export class HttpMotosApi {
  httpClient = inject(HttpClient);

  getMotos() {
    return this.httpClient
      .get<any>('https://vpic.nhtsa.dot.gov/api/vehicles/GetMakesForVehicleType/moto?format=json')
      .pipe(
        tap((data) => {
            console.log(data)
        }),
        map((res) => res.Results.map((moto:any)=>moto.MakeName)),
        shareReplay({ bufferSize: 1, refCount: false }),
      );
  }
}
