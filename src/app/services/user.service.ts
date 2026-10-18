import { Injectable } from '@angular/core';
import { db } from '../app.config';
import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc
} from 'firebase/firestore';

export interface User {
  id?: string;
  email: string;
  name: string;
  role: 'Admin' | 'Owner' | 'Employee';
  branch?: string;
  shopName?: string;
  phone?: string;
  password?: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private collectionName = 'users';

  /**
   * Fetch all users
   * TODO: If migrating to Firebase Data Connect (PostgreSQL), replace with Data Connect query:
   * e.g. const result = await listUsers(); return result.data.users;
   */
  async getUsers(): Promise<User[]> {
    try {
      const colRef = collection(db, this.collectionName);
      const snapshot = await getDocs(colRef);
      return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as User));
    } catch (error) {
      console.error('Error fetching users from Firestore:', error);
      return [];
    }
  }

  /**
   * Fetch a single user by ID
   * TODO: If migrating to Firebase Data Connect (PostgreSQL), replace with Data Connect query:
   * e.g. const result = await getUser({ id }); return result.data.user;
   */
  async getUser(id: string): Promise<User | null> {
    try {
      const docRef = doc(db, this.collectionName, id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as User;
      }
      return null;
    } catch (error) {
      console.error('Error fetching user from Firestore:', error);
      return null;
    }
  }

  /**
   * Create a new user profile
   * TODO: If migrating to Firebase Data Connect (PostgreSQL), replace with Data Connect mutation:
   * e.g. await createUser({ ...userInput });
   */
  async createUser(user: {
    id?: string;
    email: string;
    name: string;
    role: 'Admin' | 'Owner' | 'Employee';
    branch?: string;
    shopName?: string;
    phone?: string;
    password?: string;
  }): Promise<User> {
    try {
      const { password, ...userRecord } = user;
      const targetId = user.id || doc(collection(db, this.collectionName)).id;
      const docRef = doc(db, this.collectionName, targetId);

      const finalUser: User = {
        ...userRecord,
        id: targetId
      };

      await setDoc(docRef, finalUser);
      return finalUser;
    } catch (error) {
      console.error('Error creating user in Firestore:', error);
      throw error;
    }
  }

  /**
   * Update an existing user profile
   * TODO: If migrating to Firebase Data Connect (PostgreSQL), replace with Data Connect mutation:
   * e.g. await updateUser({ id, ...updates });
   */
  async updateUser(user: {
    id: string;
    email: string;
    name: string;
    role: string;
    branch: string;
    shopName: string;
    phone: string;
  }): Promise<any> {
    try {
      const docRef = doc(db, this.collectionName, user.id);
      await updateDoc(docRef, { ...user });
      return user;
    } catch (error) {
      console.error('Error updating user in Firestore:', error);
      throw error;
    }
  }

  /**
   * Delete a user profile by ID
   * TODO: If migrating to Firebase Data Connect (PostgreSQL), replace with Data Connect mutation:
   * e.g. await deleteUser({ id });
   */
  async deleteUser(id: string): Promise<boolean> {
    try {
      const docRef = doc(db, this.collectionName, id);
      await deleteDoc(docRef);
      return true;
    } catch (error) {
      console.error('Error deleting user from Firestore:', error);
      throw error;
    }
  }
}