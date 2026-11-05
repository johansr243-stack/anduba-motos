import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-about-us',
  imports: [RouterLink],
  templateUrl: './about-us.html',
  styleUrl: './about-us.css',
})
export default class AboutUs {
  stats = [
    { value: '20+', label: 'Años de experiencia' },
    { value: '20.000+', label: 'Motos atendidas' },
    { value: '25+', label: 'Servicios especializados' },
    { value: '98%', label: 'Clientes satisfechos' },
  ];

  values = [
    {
      title: 'Diagnóstico honesto',
      description: 'Te decimos exactamente qué necesita tu moto, sin inventar reparaciones ni cobrar de más.',
    },
    {
      title: 'Repuestos de calidad',
      description: 'Trabajamos solo con piezas que garantizan durabilidad, no las más baratas del mercado.',
    },
    {
      title: 'Rapidez sin descuidar el detalle',
      description: 'Sabemos que necesitas tu moto en la calle, por eso optimizamos cada proceso sin saltarnos pasos.',
    },
    {
      title: 'Trazabilidad total',
      description: 'Cada servicio queda registrado en tu historial: sabrás exactamente qué se le hizo a tu moto y cuándo.',
    },
  ];
}
