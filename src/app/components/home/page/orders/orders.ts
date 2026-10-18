import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../services/auth.service';
import { OrderService, Order, OrderItemInput } from '../../../../services/order.service';
import { ProductService, Product } from '../../../../services/product.service';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './orders.html',
  styleUrl: './orders.css',
})
export class Orders implements OnInit {
  authService = inject(AuthService);
  private orderService = inject(OrderService);
  private productService = inject(ProductService);
  private fb = inject(FormBuilder);

  // State Signals
  allOrders = signal<Order[]>([]);
  availableProducts = signal<Product[]>([]);
  selectedOrder = signal<Order | null>(null);
  activeTab = signal<string>('All');

  // Modals state
  isOrderModalOpen = signal(false);
  isEditMode = signal(false);
  isReportModalOpen = signal(false);

  // Cart / Items in current modal
  modalItems = signal<OrderItemInput[]>([]);
  selectedProductIndex = 0;
  itemQuantityInput = 1;

  // Forms
  orderForm: FormGroup = this.fb.group({
    id: [''],
    shopName: ['', Validators.required],
    branch: [''],
    deliveryDate: ['', Validators.required],
    notes: [''],
  });

  reportForm: FormGroup = this.fb.group({
    orderId: ['', Validators.required],
    reason: ['', [Validators.required, Validators.minLength(3)]],
    priority: ['Medium', Validators.required],
  });

  // User & Role helpers
  currentUser = this.authService.currentUser;
  isAdmin = computed(() => this.currentUser()?.role === 'Admin');
  isEmployee = computed(() => this.currentUser()?.role === 'Employee');
  isOwner = computed(() => this.currentUser()?.role === 'Owner');

  // Filtered orders list based on role & active tab
  displayedOrders = computed(() => {
    let list = this.allOrders();
    const role = this.currentUser()?.role;
    const shop = this.currentUser()?.name;
    const branch = this.currentUser()?.branch;

    // If Owner, filter to their shop/branch
    if (role === 'Owner') {
      list = list.filter(o =>
        (shop && o.shopName?.toLowerCase().includes(shop.toLowerCase())) ||
        (branch && o.branch?.toLowerCase().includes(branch.toLowerCase())) ||
        o.userId === this.currentUser()?.email
      );
    }

    const tab = this.activeTab();
    if (tab === 'All') return list;
    if (tab === 'Reported') return list.filter(o => o.isReported);
    return list.filter(o => o.status?.toLowerCase() === tab.toLowerCase());
  });

  // Reported orders list for reports panel
  reportedOrders = computed(() => {
    return this.allOrders().filter(o => o.isReported);
  });

  async ngOnInit() {
    await Promise.all([this.loadOrders(), this.loadProducts()]);
  }

  async loadOrders() {
    const orders = await this.orderService.getOrders();
    // Sort descending by creation / id
    const sorted = [...orders].sort((a, b) => ((b as any).createdAt || '').localeCompare((a as any).createdAt || ''));
    this.allOrders.set(sorted);

    // Keep selected order in sync or default to first
    if (sorted.length > 0) {
      const currentSelected = this.selectedOrder();
      const matched = sorted.find(o => o.id === currentSelected?.id);
      this.selectedOrder.set(matched || sorted[0]);
    } else {
      this.selectedOrder.set(null);
    }
  }

  async loadProducts() {
    try {
      const products = await this.productService.getProducts();
      this.availableProducts.set(products.filter(p => p.isAvailable));
    } catch (e) {
      console.error('Failed to load products', e);
    }
  }

  selectOrder(order: Order) {
    this.selectedOrder.set(order);
  }

  setTab(tab: string) {
    this.activeTab.set(tab);
  }

  formatPrice(price?: number | null): string {
    return (price ?? 0).toFixed(2);
  }

  /**
   * Shop owners can modify or cancel orders as long as they are not pending or in progress
   */
  canOwnerModify(order?: Order | null): boolean {
    if (!order) return false;
    if (this.isAdmin()) return true;
    if (!this.isOwner()) return false;
    const status = (order.status || '').toLowerCase();
    // Cannot modify/cancel if pending, in progress, success, or completed
    return status !== 'pending' && status !== 'in progress' && status !== 'success' && status !== 'completed';
  }

  // --- Order Status Management (Kitchen staff / Admin) ---
  async markStatus(status: 'Pending' | 'In Progress' | 'Success' | 'Issue' | 'Cancelled') {
    const order = this.selectedOrder();
    if (!order) return;
    try {
      await this.orderService.updateOrderStatus(order.id, status);
      await this.loadOrders();
    } catch (e) {
      alert('Failed to update order status');
    }
  }

  // --- Order Placement & Modification ---
  openNewOrderModal() {
    this.isEditMode.set(false);
    this.modalItems.set([]);
    this.orderForm.reset({
      shopName: this.currentUser()?.name || '',
      branch: this.currentUser()?.branch || '',
      deliveryDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      notes: '',
    });
    this.isOrderModalOpen.set(true);
  }

  openEditOrderModal(order: Order) {
    this.isEditMode.set(true);
    this.orderForm.patchValue({
      id: order.id,
      shopName: order.shopName,
      branch: order.branch,
      deliveryDate: order.deliveryDate,
      notes: order.notes,
    });
    this.modalItems.set(this.parseOrderItems(order));
    this.isOrderModalOpen.set(true);
  }

  closeOrderModal() {
    this.isOrderModalOpen.set(false);
    this.orderForm.reset();
    this.modalItems.set([]);
  }

  addItemToModal() {
    const products = this.availableProducts();
    if (products.length === 0) return;
    const prod = products[this.selectedProductIndex] || products[0];
    const qty = Math.max(1, Number(this.itemQuantityInput) || 1);

    const items = [...this.modalItems()];
    const existing = items.find(i => i.productName === prod.name);
    if (existing) {
      existing.quantity += qty;
    } else {
      items.push({
        productName: prod.name,
        quantity: qty,
        price: prod.price,
      });
    }
    this.modalItems.set(items);
    this.itemQuantityInput = 1;
  }

  removeItemFromModal(index: number) {
    const items = [...this.modalItems()];
    items.splice(index, 1);
    this.modalItems.set(items);
  }

  get modalTotal(): number {
    return this.modalItems().reduce((acc, i) => acc + (i.price * i.quantity), 0);
  }

  async onSubmitOrder() {
    if (this.orderForm.invalid || this.modalItems().length === 0) {
      alert('Please fill all required fields and add at least one item.');
      return;
    }

    try {
      const formVal = this.orderForm.getRawValue();
      const id = formVal.id || '';
      const shopName = formVal.shopName || '';
      const branch = formVal.branch || '';
      const deliveryDate = formVal.deliveryDate || '';
      const notes = formVal.notes || '';

      if (this.isEditMode()) {
        await this.orderService.updateOrder(id, {
          shopName,
          branch,
          deliveryDate,
          notes,
          items: this.modalItems(),
        });
      } else {
        await this.orderService.createOrder({
          shopName,
          branch,
          deliveryDate,
          notes,
          userId: this.currentUser()?.email,
          status: 'New',
          items: this.modalItems(),
        });
      }
      this.closeOrderModal();
      await this.loadOrders();
    } catch (err) {
      console.error('Error submitting order', err);
      alert('Error saving order.');
    }
  }

  async onCancelOrder(order: Order) {
    if (!confirm(`Are you sure you want to cancel order #${order.id.slice(0, 6)}?`)) return;
    try {
      await this.orderService.cancelOrder(order.id);
      await this.loadOrders();
    } catch (e) {
      alert('Failed to cancel order.');
    }
  }

  async onDeleteOrder(orderId: string) {
    if (!confirm('Are you sure you want to permanently delete this order?')) return;
    try {
      await this.orderService.deleteOrder(orderId);
      await this.loadOrders();
    } catch (e) {
      alert('Failed to delete order.');
    }
  }

  // --- Reporting Order to Admin ---
  openReportModal(order: Order) {
    this.reportForm.reset({
      orderId: order.id,
      reason: '',
      priority: 'Medium',
    });
    this.isReportModalOpen.set(true);
  }

  closeReportModal() {
    this.isReportModalOpen.set(false);
    this.reportForm.reset();
  }

  async onSubmitReport() {
    if (this.reportForm.invalid) return;
    const reportVal = this.reportForm.getRawValue();
    const orderId = reportVal.orderId || '';
    const reason = reportVal.reason || '';
    const priority = reportVal.priority || 'Medium';

    if (!orderId || !reason) return;

    try {
      await this.orderService.reportOrder(orderId, reason, priority);
      this.closeReportModal();
      await this.loadOrders();
      alert('Order reported to administrator successfully.');
    } catch (e) {
      alert('Failed to report order.');
    }
  }

  // Helper to parse items
  parseOrderItems(order?: Order | null): OrderItemInput[] {
    if (!order) return [];
    if (order.itemsJson) {
      try {
        return JSON.parse(order.itemsJson);
      } catch (e) {
        // fallback
      }
    }
    if (order.itemsSummary) {
      return order.itemsSummary.split(',').map(s => {
        const parts = s.trim().split(' x');
        return {
          productName: parts[0] || 'Item',
          quantity: parseInt(parts[1] || '1', 10) || 1,
          price: 0
        };
      });
    }
    return [];
  }
}
