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

export type OrderItemInput = {
  productName: string;
  quantity: number;
  price: number;
};

export interface Order {
  id: string;
  userId?: string;
  shopName: string;
  branch?: string;
  deliveryDate?: string;
  notes?: string;
  status?: string;
  totalPrice?: number;
  isReported?: boolean;
  reportReason?: string;
  reportPriority?: string;
  itemsSummary?: string;
  itemsJson?: string;
  items?: OrderItemInput[];
  createdAt?: string;
}

export interface CreateOrderInput {
  userId?: string;
  shopName: string;
  branch?: string;
  deliveryDate?: string;
  notes?: string;
  status?: string;
  items: OrderItemInput[];
}

export type UpdateOrderInput = Partial<Omit<Order, 'items'>> & {
  items?: OrderItemInput[];
};

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private collectionName = 'orders';

  /**
   * Fetch all orders
   * TODO: If migrating to Firebase Data Connect (PostgreSQL), replace with Data Connect query:
   * e.g. const result = await listOrders(); return result.data.orders;
   */
  async getOrders(): Promise<Order[]> {
    try {
      const colRef = collection(db, this.collectionName);
      const snapshot = await getDocs(colRef);
      return snapshot.docs.map(d => {
        const data = d.data();
        let items: OrderItemInput[] = [];
        if (data['itemsJson']) {
          try {
            items = JSON.parse(data['itemsJson']);
          } catch {
            items = [];
          }
        }
        return {
          id: d.id,
          ...data,
          items: items.length > 0 ? items : (data['items'] || [])
        } as Order;
      });
    } catch (err) {
      console.error('Error loading orders from Firestore:', err);
      return [];
    }
  }

  /**
   * Fetch a single order by ID
   * TODO: If migrating to Firebase Data Connect (PostgreSQL), replace with Data Connect query:
   * e.g. const result = await getOrder({ id }); return result.data.order;
   */
  async getOrder(id: string): Promise<Order | null> {
    try {
      const docRef = doc(db, this.collectionName, id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        let items: OrderItemInput[] = [];
        if (data['itemsJson']) {
          try {
            items = JSON.parse(data['itemsJson']);
          } catch {
            items = [];
          }
        }
        return {
          id: docSnap.id,
          ...data,
          items: items.length > 0 ? items : (data['items'] || [])
        } as Order;
      }
      return null;
    } catch (err) {
      console.error('Error fetching single order from Firestore:', err);
      return null;
    }
  }

  /**
   * Create a new order
   * TODO: If migrating to Firebase Data Connect (PostgreSQL), replace with Data Connect mutation:
   * e.g. const result = await createOrder({ ...orderInput });
   */
  async createOrder(input: CreateOrderInput): Promise<Order> {
    try {
      const totalPrice = input.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const itemsSummary = input.items.map(i => `${i.productName} x${i.quantity}`).join(', ');
      const itemsJson = JSON.stringify(input.items);

      const targetId = doc(collection(db, this.collectionName)).id;
      const docRef = doc(db, this.collectionName, targetId);

      const newOrder: Order = {
        id: targetId,
        status: input.status || 'New',
        totalPrice,
        deliveryDate: input.deliveryDate || new Date().toISOString().split('T')[0],
        userId: input.userId,
        shopName: input.shopName,
        branch: input.branch || '',
        notes: input.notes || '',
        isReported: false,
        reportReason: '',
        reportPriority: 'Low',
        itemsSummary,
        itemsJson,
        items: input.items,
        createdAt: new Date().toISOString()
      };

      await setDoc(docRef, newOrder);
      return newOrder;
    } catch (err) {
      console.error('Failed in createOrder Firestore:', err);
      throw err;
    }
  }

  /**
   * Update an existing order
   * TODO: If migrating to Firebase Data Connect (PostgreSQL), replace with Data Connect mutation:
   * e.g. await updateOrder({ id, ...updates });
   */
  async updateOrder(id: string, updates: UpdateOrderInput): Promise<any> {
    try {
      const payload: any = { ...updates };

      if (updates.items && updates.items.length > 0) {
        payload.totalPrice = updates.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        payload.itemsSummary = updates.items.map(i => `${i.productName} x${i.quantity}`).join(', ');
        payload.itemsJson = JSON.stringify(updates.items);
      }

      const docRef = doc(db, this.collectionName, id);
      await updateDoc(docRef, payload);
      return { id, ...payload };
    } catch (err) {
      console.error('Failed to update order in Firestore:', err);
      throw err;
    }
  }

  async updateOrderStatus(id: string, status: string) {
    return this.updateOrder(id, { status });
  }

  async reportOrder(id: string, reportReason: string, reportPriority: string = 'Medium') {
    return this.updateOrder(id, {
      isReported: true,
      reportReason,
      reportPriority
    });
  }

  async cancelOrder(id: string) {
    return this.updateOrderStatus(id, 'Cancelled');
  }

  /**
   * Delete an order
   * TODO: If migrating to Firebase Data Connect (PostgreSQL), replace with Data Connect mutation:
   * e.g. await deleteOrder({ id });
   */
  async deleteOrder(id: string): Promise<boolean> {
    try {
      const docRef = doc(db, this.collectionName, id);
      await deleteDoc(docRef);
      return true;
    } catch (err) {
      console.error('Failed to delete order from Firestore:', err);
      throw err;
    }
  }
}
