import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from "./shared/components/header/header";
import { Footer } from "./shared/components/footer/footer";
import { CartDrawer } from './shared/components/cart-drawer/cart-drawer';


@Component({
  selector: 'app-root',
  imports: [Header, Footer, RouterOutlet, CartDrawer ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('FrontEnd');
}
