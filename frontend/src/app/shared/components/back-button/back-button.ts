import { Component, inject, Input } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-back-button',
  imports: [FontAwesomeModule],
  templateUrl: './back-button.html',
  styleUrl: './back-button.css',
})
export class BackButton {
  @Input() fallback = '/dashboard';

  faArrowLeft = faArrowLeft;

  private location = inject(Location);
  private router = inject(Router);

  goBack() {
    if (window.history.length > 1) {
      this.location.back();
    } else {
      this.router.navigateByUrl(this.fallback);
    }
  }
}
