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

export interface Product {
  id?: string;
  name: string;
  price: number;
  stockQuantity: number;
  isAvailable: boolean;
  imageUrl?: string;
  description?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private collectionName = 'products';

  /**
   * Fetch all products
   * TODO: If migrating to Firebase Data Connect (PostgreSQL), replace with Data Connect query:
   * e.g. const result = await listProducts(); return result.data.products;
   */
  async getProducts(): Promise<Product[]> {
    try {
      const colRef = collection(db, this.collectionName);
      const snapshot = await getDocs(colRef);
      return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Product));
    } catch (error) {
      console.error('Error fetching products from Firestore:', error);
      return [];
    }
  }

  /**
   * Fetch a single product by ID
   * TODO: If migrating to Firebase Data Connect (PostgreSQL), replace with Data Connect query:
   * e.g. const result = await getProduct({ id }); return result.data.product;
   */
  async getProduct(id: string): Promise<Product | null> {
    try {
      const docRef = doc(db, this.collectionName, id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Product;
      }
      return null;
    } catch (error) {
      console.error('Error fetching product from Firestore:', error);
      return null;
    }
  }

  /**
   * Create a new product
   * TODO: If migrating to Firebase Data Connect (PostgreSQL), replace with Data Connect mutation:
   * e.g. await createProduct({ ...productInput });
   */
  async createProduct(product: {
    id?: string;
    name: string;
    price: number;
    stockQuantity: number;
    isAvailable: boolean;
    imageUrl?: string;
    description?: string;
  }): Promise<Product> {
    try {
      const targetId = product.id || doc(collection(db, this.collectionName)).id;
      const docRef = doc(db, this.collectionName, targetId);

      const finalProduct: Product = {
        ...product,
        id: targetId
      };

      await setDoc(docRef, finalProduct);
      return finalProduct;
    } catch (error) {
      console.error('Error creating product in Firestore:', error);
      throw error;
    }
  }

  /**
   * Update an existing product
   * TODO: If migrating to Firebase Data Connect (PostgreSQL), replace with Data Connect mutation:
   * e.g. await updateProduct({ id, ...updates });
   */
  async updateProduct(product: {
    id: string;
    name: string;
    price: number;
    stockQuantity: number;
    isAvailable: boolean;
    imageUrl?: string;
    description?: string;
  }): Promise<any> {
    try {
      const docRef = doc(db, this.collectionName, product.id);
      await updateDoc(docRef, { ...product });
      return product;
    } catch (error) {
      console.error('Error updating product in Firestore:', error);
      throw error;
    }
  }

  /**
   * Delete a product by ID
   * TODO: If migrating to Firebase Data Connect (PostgreSQL), replace with Data Connect mutation:
   * e.g. await deleteProduct({ id });
   */
  async deleteProduct(id: string): Promise<boolean> {
    try {
      const docRef = doc(db, this.collectionName, id);
      await deleteDoc(docRef);
      return true;
    } catch (error) {
      console.error('Error deleting product from Firestore:', error);
      throw error;
    }
  }
}