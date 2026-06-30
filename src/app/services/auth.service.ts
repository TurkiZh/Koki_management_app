import { Injectable, signal, computed } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';

export interface User {
  email: string;
  role: 'admin' | 'owner';
  name: string;
  branch?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Signal to store the current user state
  private currentUserSignal = signal<User | null>(null);

  // Read-only public views of our state
  currentUser = this.currentUserSignal.asReadonly();
  isLoggedIn = computed(() => this.currentUserSignal() !== null);
  isAdmin = computed(() => this.currentUserSignal()?.role === 'admin');

  // Mock user database
  private mockUsers = [
    { email: 'admin@koki.com', password: 'admin123', role: 'admin' as const, name: 'Factory Owner' },
    { email: 'shop1@koki.com', password: 'shop123', role: 'owner' as const, name: 'Coffee Shop Riyadh', branch: 'Riyadh' },
    { email: 'shop2@koki.com', password: 'shop456', role: 'owner' as const, name: 'Coffee Shop Jeddah', branch: 'Jeddah' }
  ];

  constructor() {
    // Try to load session from localStorage if available
    const savedUser = localStorage.getItem('koki_user');
    if (savedUser) {
      try {
        this.currentUserSignal.set(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('koki_user');
      }
    }
  }

  /**
   * Mock login call returning an Observable to simulate an API request
   */
  login(email: string, password: string): Observable<User> {
    const user = this.mockUsers.find(
      u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );

    if (user) {
      const loggedInUser: User = {
        email: user.email,
        role: user.role,
        name: user.name,
        branch: user.branch
      };
      
      // Simulate network delay
      return new Observable<User>(observer => {
        setTimeout(() => {
          this.currentUserSignal.set(loggedInUser);
          localStorage.setItem('koki_user', JSON.stringify(loggedInUser));
          observer.next(loggedInUser);
          observer.complete();
        }, 1000); // 1s delay
      });
    } else {
      return new Observable<never>(observer => {
        setTimeout(() => {
          observer.error(new Error('Invalid email address or password.'));
        }, 1000);
      });
    }
  }

  /**
   * Log out the current user and clear local storage session
   */
  logout() {
    this.currentUserSignal.set(null);
    localStorage.removeItem('koki_user');
  }
}
