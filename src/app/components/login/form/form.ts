import { Component, signal, computed, output, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';
import { auth } from '../../../app.config';
import { sendPasswordResetEmail } from 'firebase/auth';

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

    // List of mock user emails for local development
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
      // Firebase Auth Flow
      try {
        const user = await this.authService.loginWithFirebase(emailVal, passwordVal);
        this.successMessage.set(`Welcome back, ${user.name}! Redirecting...`);
        setTimeout(() => {
          this.loginSuccess.emit(user);
          this.isLoading.set(false);
        }, 800);
      } catch (error: any) {
        let msg = 'Authentication failed. Please try again.';
        if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password') {
          msg = 'Invalid email or password.';
        } else if (error.code === 'auth/user-not-found') {
          msg = 'No account found with this email.';
        } else if (error.message) {
          msg = error.message;
        }
        this.errorMessage.set(msg);
        this.isLoading.set(false);
      }
    }
  }

  async onForgotPassword() {
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

    try {
      await sendPasswordResetEmail(auth, this.email().trim());
      this.isLoading.set(false);
      this.successMessage.set(`A password reset link has been sent to ${this.email().trim()}`);
    } catch (err: any) {
      this.isLoading.set(false);
      this.errorMessage.set(err.message || 'Failed to send password reset email.');
    }
  }
}
