import { Component, signal, computed, output, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-login-form',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './form.html',
  styleUrl: './form.css'
})
export class LoginForm {
  private authService = inject(AuthService);

  // Form signals
  email = signal('');
  password = signal('');
  isLoading = signal(false);
  errorMessage = signal('');
  successMessage = signal('');

  // Output event to notify parent on login success
  loginSuccess = output<any>();

  // Regex for basic email validation
  private emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  // Computed validity signals
  isEmailValid = computed(() => this.emailRegex.test(this.email().trim()));
  isPasswordValid = computed(() => this.password().trim().length >= 6);
  isFormValid = computed(() => this.isEmailValid() && this.isPasswordValid());
  isButtonDisabled = computed(() => !this.isFormValid() || this.isLoading());

  onLogin() {
    if (!this.isFormValid() || this.isLoading()) return;

    this.isLoading.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    this.authService.login(this.email().trim(), this.password()).subscribe({
      next: (user) => {
        this.isLoading.set(false);
        this.successMessage.set(`Welcome back, ${user.name}! Redirecting...`);
        
        // Let the success message show briefly before emitting the event
        setTimeout(() => {
          this.loginSuccess.emit(user);
        }, 800);
      },
      error: (error) => {
        this.isLoading.set(false);
        this.errorMessage.set(error.message || 'Authentication failed. Please try again.');
      }
    });
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

    // Simulate password reset request
    setTimeout(() => {
      this.isLoading.set(false);
      this.successMessage.set(`A password reset link has been sent to ${this.email().trim()}`);
    }, 1200);
  }
}
