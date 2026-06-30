import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  private authService = inject(AuthService);
  private router = inject(Router);

  // Expose the read-only signal of the logged-in user
  currentUser = this.authService.currentUser;

  onLogout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
