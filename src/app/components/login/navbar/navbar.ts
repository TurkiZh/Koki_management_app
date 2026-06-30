import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-login-navbar',
  standalone: true,
  imports: [],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class LoginNavbar {
  // Support modal open state
  isSupportOpen = signal(false);

  toggleSupport() {
    this.isSupportOpen.update(v => !v);
  }
}
