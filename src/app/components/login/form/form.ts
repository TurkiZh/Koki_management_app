import { Component, signal, computed, output, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';
import { signIn } from 'aws-amplify/auth';

@Component({
  selector: 'app-login-form',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './form.html',
  styleUrl: './form.css'
})
export class LoginForm {
  email = signal('');
  password = signal('');
  isLoading = signal(false);
  errorMessage = signal('');
  successMessage = signal('');

  private authService = inject(AuthService);
  private router = inject(Router);
  loginSuccess = output<any>();

  // Regex for basic email validation
  private emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  // Computed validity signals
  isEmailValid = computed(() => this.emailRegex.test(this.email().trim()));
  isPasswordValid = computed(() => this.password().trim().length >= 6);
  isFormValid = computed(() => this.isEmailValid() && this.isPasswordValid());
  isButtonDisabled = computed(() => !this.isFormValid() || this.isLoading());

  async onSubmitLogin() {
    if (!this.isFormValid() || this.isLoading()) return;

    const emailVal = this.email().trim();
    const passwordVal = this.password();

    this.isLoading.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    // List of mock user emails for debug purposes
    const mockEmails = ['admin@koki.com', 'emp@koki.com', 'shop1@koki.com', 'shop2@koki.com'];

    if (mockEmails.includes(emailVal.toLowerCase())) {
      // Mock Users Auth Flow
      this.authService.login(emailVal, passwordVal).subscribe({
        next: (user) => {
          this.successMessage.set(`Welcome back, ${user.name}! Redirecting...`);
          setTimeout(() => {
            this.loginSuccess.emit(user);
            this.isLoading.set(false);
          }, 800);
        },
        error: (error) => {
          this.isLoading.set(false);
          this.errorMessage.set(error.message || 'Authentication failed. Please try again.');
        }
      });
    } else {
      // AWS Cognito Auth Flow
      try {
        const result = await signIn({
          username: emailVal,
          password: passwordVal,
        });
        this.successMessage.set('Sign in successful! Redirecting...');
        setTimeout(() => {
          this.loginSuccess.emit({ email: emailVal, role: 'Employee', name: 'Cognito User' });
          this.isLoading.set(false);
        }, 800);
      } catch (error: any) {
        this.errorMessage.set(error.message || 'Authentication failed. Please try again.');
        this.isLoading.set(false);
      }
    }
  }

  onForgotPassword() {
    if (!this.email().trim()) {
      this.errorMessage.set('Please enter your email address to reset your password.');
      return;
    }
    if (!this.isEmailValid()) {
      this.errorMessage.set('Please enter a valid email address.');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    // Simulate password reset request or trigger AWS Cognito forgot password
    setTimeout(() => {
      this.isLoading.set(false);
      this.successMessage.set(`A password reset link has been sent to ${this.email().trim()}`);
    }, 1200);
  }
}
