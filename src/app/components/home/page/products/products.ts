import { Component, inject, signal } from '@angular/core';
import { AuthService } from '../../../../services/auth.service';
import { ProductService, Product } from '../../../../services/product.service';
import { FormBuilder, FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './products.html',
  styleUrl: './products.css',
})
export class Products {
  authService = inject(AuthService);
  // signals to open and close add/edit product dialog
  isEditModalOpen = signal(false);
  isAddModalOpen = signal(false);
  //Form for adding a new product
  productForm!: FormGroup;

  editProduct = {
    name: '',
    price: 0,
    stockQuantity: 0,
    isAvailable: false,
    imageUrl: '',
    description: '',
  };

  // filters 
  allProducts = signal<Product[]>([]);
  lowStockProducts = signal<Product[]>([]);
  availableProducts = signal<Product[]>([]);
  outOfStockProducts = signal<Product[]>([]);

  constructor(
    private productService: ProductService,
    private fb: FormBuilder
  ) {}

  openModal() {
    this.isEditModalOpen.set(true);
    this.isAddModalOpen.set(true);
  }

  async openEditModal(productId: string) {
    this.isEditModalOpen.set(true);
    this.isAddModalOpen.set(false);
    const productValue = await this.productService.getProduct(productId);
    this.productForm.patchValue({
      id: productId,
      name: productValue?.name,
      price: productValue?.price,
      stockQuantity: productValue?.stockQuantity,
      isAvailable: productValue?.isAvailable,
      imageUrl: productValue?.imageUrl,
      description: productValue?.description,
    });
  }

  closeModal() {
    this.isAddModalOpen.set(false);
    this.isEditModalOpen.set(false);
    this.productForm.reset();
  }

  async ngOnInit() {
    try {
      // Call the service function and await the data array
      const products = await this.productService.getProducts();
      this.allProducts.set(products || []);

      // Filter the data array using native JavaScript logic
      this.filterInventory();
    } catch (error) {
      console.error('Error initializing products component:', error);
    }
    this.productForm = this.fb.group({
      id: [''],
      name: ['', [Validators.required, Validators.minLength(1)]],
      price: [0, [Validators.required, Validators.min(0)]],
      stockQuantity: [0, [Validators.required, Validators.min(0)]],
      description: ['', Validators.required],
      imageUrl: [''],
      isAvailable: [true],
    });
  }

  loadProducts() {
    this.productService.getProducts().then(products => {
      this.allProducts.set(products || []);
      this.filterInventory();
    });
  }

  async onSubmitProduct() {
    if (this.productForm.invalid) {
      alert('Please fill in the form correctly!');
      return;
    }
    try {
      if (this.isEditModalOpen()) {
        await this.productService.updateProduct(this.productForm.value);
      } else if (this.isAddModalOpen()) {
        await this.productService.createProduct(this.productForm.value);
      }
      this.loadProducts();
      this.closeModal();
    } catch (error) {
      console.error('Error saving product:', error);
    }
  }

  async onDeleteProduct(productId: string) {
    try {
      await this.productService.deleteProduct(productId);
      this.loadProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  }

  // JavaScript array filtering method
  filterInventory() {
    this.availableProducts.set(this.allProducts().filter(p => p.isAvailable === true && p.stockQuantity > 20));
    this.lowStockProducts.set(this.allProducts().filter(p => p.isAvailable === true && p.stockQuantity <= 20 && p.stockQuantity > 0));
    this.outOfStockProducts.set(this.allProducts().filter(p => p.stockQuantity === 0 || p.isAvailable === false));
  }
}
