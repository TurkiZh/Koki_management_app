import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { LoginNavbar } from './navbar/navbar';
import { LoginForm } from './form/form';
import { LoginFooter } from './footer/footer';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [LoginNavbar, LoginForm, LoginFooter, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private router = inject(Router);

  /**
   * Triggered when the LoginForm child component fires its success event.
   * Redirects the user to the application home (Dashboard).
   */
  handleLoginSuccess(user: any) {
    console.log('User authenticated successfully. Redirecting to home...', user);
    this.router.navigate(['/home']);
  }
}
