import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../../services/auth.service';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {
  authService = inject(AuthService);

  // menuItems based on user role
  userType = signal<string>(this.authService.userRole() ?? "Unknown");

  async logout() {
    await this.authService.logout();
    this.userType.set("Unknown");
  }
}
