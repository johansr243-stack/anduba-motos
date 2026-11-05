import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { HttpAuth } from '../../../core/services/http-auth';
import { AsyncPipe } from '@angular/common';
import { faUser, faCartShopping, faBars, faXmark } from '@fortawesome/free-solid-svg-icons';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { AccountMenu } from '../account-menu/account-menu';
import { CartService } from '../../../core/services/http-cart';
import { MobileMenu } from '../mobile-menu/mobile-menu';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive, AsyncPipe, FaIconComponent, AccountMenu, MobileMenu],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  menuOpen = false;
  public httpAuth = inject(HttpAuth);
  faUser = faUser;
  faCartShopping = faCartShopping;
  faBars = faBars;
  faXmark = faXmark;
  cartService = inject(CartService);

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  closeMenu() {
    this.menuOpen = false;
  }

  logOut() {
    this.httpAuth.logoutUser();
    this.closeMenu();
  }

  logged() {
    return this.httpAuth.isLogged();
  }
}