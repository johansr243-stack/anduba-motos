import { Component, ElementRef, HostListener, inject } from '@angular/core';
import { HttpAuth } from '../../../core/services/http-auth';
import { faUser } from '@fortawesome/free-solid-svg-icons';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { AsyncPipe } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-account-menu',
  imports: [FaIconComponent,AsyncPipe, RouterLink],
  templateUrl: './account-menu.html',
  styleUrl: './account-menu.css',
})
export class AccountMenu {
  public httpAuth = inject(HttpAuth)
  private elementRef = inject(ElementRef)
  faUser = faUser
  isOpen = false

  toggle(){
    this.isOpen = !this.isOpen
  }

  close(){
    this.isOpen = false
  }

  onLogout(){
    this.httpAuth.logoutUser()
    this.close()

  }
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.close();
    }
  }

  @HostListener('document:keydown.escape')
  onEscape() {
    this.close();
  }
}
