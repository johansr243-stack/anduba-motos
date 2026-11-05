import { Component, ElementRef, EventEmitter, HostListener, Input, Output, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AsyncPipe } from '@angular/common';
import { HttpAuth } from '../../../core/services/http-auth';

@Component({
  selector: 'app-mobile-menu',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, AsyncPipe],
  templateUrl: './mobile-menu.html',
  styleUrl: './mobile-menu.css',
})
export class MobileMenu {
  @Input() open = false;
  @Output() closeMenu = new EventEmitter<void>();

  elementRef = inject(ElementRef)

  public httpAuth = inject(HttpAuth);

  onLinkClick() {
    this.closeMenu.emit();
  }

  logOut() {
    this.httpAuth.logoutUser();
    this.closeMenu.emit();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.closeMenu.emit();
    }
  }
}