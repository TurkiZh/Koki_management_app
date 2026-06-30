import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface OrderItem {
  id: number;
  name: string;
  quantity: number;
  price: number;
}

@Component({
  standalone: true,
  selector: 'app-new-order',
  imports: [FormsModule],
  templateUrl: './new-order.html',
  styleUrl: './new-order.css',
})

export class NewOrder {
  productNameInput = '';
  quantityInput = 1;
  orderItems = signal<OrderItem[]>([]);

  items = [
    {
      id: 1,
      name: "Peanut sweet",
      price: 5
    },
    {
      id: 2,
      name: "Almond sweet",
      price: 10
    },
    {
      id: 3,
      name: "Pistachio sweet",
      price: 15
    }
  ];

  totalItemsCount = computed(() => {
    return this.orderItems().reduce((total, item) => total + item.quantity, 0);
  })

  totalPrice = computed(() => {
    return this.orderItems().reduce((total, item) => total + item.quantity * item.price, 0);
  })

  onAddOrder() {
    if (this.quantityInput <= 0 || !this.productNameInput.trim()) {
      alert("Please enter a valid product name and quantity!");
      return;
    }
    const matchedItem = this.items.find(item => item.name === this.productNameInput);
    if (!matchedItem) {
      alert("Selected product is invalid");
      return;
    }

    const currentItems = this.orderItems();
    const existingItem = currentItems.find(item => item.name === this.productNameInput);

    if (existingItem) {
      this.orderItems.update(items => items.map(
        item =>
          item.name === this.productNameInput
            ? { ...item, quantity: item.quantity + this.quantityInput }
            : item
      ))
    } else {
      const newItem: OrderItem = {
        id: Date.now(),
        name: this.productNameInput,
        quantity: this.quantityInput,
        price: matchedItem.price
      };

      this.orderItems.update(items => [...items, newItem]);
    }

    this.productNameInput = '';
    this.quantityInput = 1;

  }

  // Submits the whole cart/order list
  onCheckout() {
    if (this.orderItems().length === 0) {
      alert("Nothing ordered yet!");
      return;
    }

    alert(`Order placed successfully! Total items: ${this.totalItemsCount()}`);

    // Clear the signal array back to empty
    this.orderItems.set([]);
  }
}
