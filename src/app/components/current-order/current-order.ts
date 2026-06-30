import { Component, computed, signal } from '@angular/core';

/*
  CurrentOrder Component
  ----------------------
  This component demonstrates the use of Angular signals introduced in Step 3.
  It defines three primary signals:
    - orderItems: array of items in the current order (hard‑coded for now)
    - orderTime: when the order was placed (signal of Date)
    - canCancel: boolean indicating if the order can still be cancelled (computed)
  A computed signal `totalPrice` aggregates the total cost of the order.
  The template (current-order.html) uses these signals to display the order summary
  and conditionally render a "Cancel Order" button.
*/

interface OrderItem {
  id: number;
  name: string;
  quantity: number;
  price: number;
}

@Component({
  selector: 'app-current-order',
  templateUrl: './current-order.html',
  styleUrl: './current-order.css',
})
export class CurrentOrder {
  // Hard‑coded order items – replace with service data later
  orderItems = signal<OrderItem[]>([
    { id: 101, name: 'Peanut sweet', quantity: 2, price: 5 },
    { id: 102, name: 'Almond sweet', quantity: 1, price: 10 },
  ]);

  // Signal storing the time the order was placed
  orderTime = signal<Date>(new Date());

  // Computed: the order can be cancelled within 5 minutes of placement
  canCancel = computed(() => {
    const now = new Date();
    const diffMs = now.getTime() - this.orderTime().getTime();
    const diffMins = diffMs / 60000;
    return diffMins < 5;
  });

  // Computed total price for the current order
  totalPrice = computed(() =>
    this.orderItems().reduce((sum, item) => sum + item.quantity * item.price, 0)
  );

  // Cancel handler – simply clears the order for this demo
  onCancel() {
    if (this.canCancel()) {
      this.orderItems.set([]);
      console.log('Order cancelled');
    }
  }
}
