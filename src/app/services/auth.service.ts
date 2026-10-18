import { Injectable, signal, computed } from '@angular/core';
import { Observable, from, of } from 'rxjs';
import { auth, db } from '../app.config';
import { signInWithEmailAndPassword, signOut as firebaseSignOut, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

export interface User {
  id?: string;
  email: string;
  role: 'Admin' | 'Owner' | 'Employee';
  name: string;
  branch?: string;
  shopName?: string;
  phone?: string;
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
  userRole = computed(() => this.currentUserSignal()?.role);

  getUserData() {
    return this.currentUserSignal();
  }

  // Mock users database for local development and offline testing
  private mockUsers: User[] = [
    { email: 'admin@koki.com', role: 'Admin', name: 'Turki' },
    { email: 'emp@koki.com', role: 'Employee', name: 'mohammed' },
    { email: 'shop1@koki.com', role: 'Owner', name: 'Coffee Shop Riyadh', branch: 'Riyadh', shopName: 'Roast Riyadh' },
    { email: 'shop2@koki.com', role: 'Owner', name: 'Coffee Shop Dammam', branch: 'Dammam', shopName: 'Dammam Brew' }
  ];

  constructor() {
    // 1. Try to load saved session from localStorage
    const savedUser = localStorage.getItem('koki_user');
    if (savedUser) {
      try {
        this.currentUserSignal.set(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem('koki_user');
      }
    }

    // 2. Listen to Firebase Auth state changes
    onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        // If not already set by mock or local state
        if (!this.currentUserSignal()) {
          const userProfile = await this.fetchUserProfile(firebaseUser);
          this.setCurrentUser(userProfile);
        }
      } else if (!savedUser) {
        this.currentUserSignal.set(null);
      }
    });
  }

  /**
   * Set the currently active user and persist to localStorage
   */
  setCurrentUser(user: User | null) {
    this.currentUserSignal.set(user);
    if (user) {
      localStorage.setItem('koki_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('koki_user');
    }
  }

  /**
   * Fetch additional user metadata (role, branch, name) from Firestore
   * TODO: If migrating to Firebase Data Connect (PostgreSQL), fetch user profile using the Data Connect generated query instead.
   */
  async fetchUserProfile(firebaseUser: FirebaseUser): Promise<User> {
    const email = firebaseUser.email || '';
    const name = firebaseUser.displayName || email.split('@')[0] || 'User';

    try {
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const data = userDocSnap.data();
        return {
          id: firebaseUser.uid,
          email,
          name: data['name'] || name,
          role: (data['role'] as 'Admin' | 'Owner' | 'Employee') || 'Employee',
          branch: data['branch'] || '',
          shopName: data['shopName'] || '',
          phone: data['phone'] || ''
        };
      }
    } catch (err) {
      console.warn('Could not load user profile from Firestore, falling back to defaults:', err);
    }

    // Default fallback user profile
    return {
      id: firebaseUser.uid,
      email,
      name,
      role: 'Employee'
    };
  }

  /**
   * Sign in using Firebase Authentication
   */
  async loginWithFirebase(email: string, password: string): Promise<User> {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    const user = await this.fetchUserProfile(credential.user);
    this.setCurrentUser(user);
    return user;
  }

  /**
   * Mock login call returning an Observable for mock accounts
   */
  loginMock(email: string): Observable<User> {
    const user = this.mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (user) {
      this.setCurrentUser(user);
      return of(user);
    }
    throw new Error('Invalid mock credentials.');
  }

  /**
   * General login helper supporting mock users or Firebase
   */
  login(email: string, password?: string): Observable<User> {
    const mockUser = this.mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (mockUser) {
      return this.loginMock(email);
    }

    return from(this.loginWithFirebase(email, password || ''));
  }

  /**
   * Log out from Firebase and clear local storage session
   */
  async logout() {
    try {
      await firebaseSignOut(auth);
    } catch (err) {
      console.warn('Firebase signOut error:', err);
    }
    this.setCurrentUser(null);
  }
}
