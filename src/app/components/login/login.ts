import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { LoginNavbar } from './navbar/navbar';
import { LoginForm } from './form/form';
import { LoginFooter } from './footer/footer';
import { signIn } from 'aws-amplify/auth';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [LoginNavbar, LoginForm, LoginFooter, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private router = inject(Router);
  // loginForm!: FormGroup;

  // constructor(private fb: FormBuilder, private router: Router) {
  //   this.loginForm = this.fb.group({
  //     username: ['', Validators.required],
  //     password: ['', Validators.required],
  //   });
  // }

  // async onSubmitLogin() {
  //   if (this.loginForm.invalid) return;
  //   const { username, password } = this.loginForm.value;
  //   try {
  //     const result = await signIn({
  //       username,
  //       password,
  //     });
  //     this.router.navigate(['/home']);
  //   } catch (error: any) {
  //     // Handles incorrect passwords, non-existent users, etc.
  //     console.error('AWS Login Failed:', error);
  //   }
  // }

  /**
   * Triggered when the LoginForm child component fires its success event.
   * Redirects the user to the application home (Dashboard).
   */
  handleLoginSuccess(user: any) {
    console.log('User authenticated successfully. Redirecting to home...', user);
    this.router.navigate(['/home']);
  }
}
