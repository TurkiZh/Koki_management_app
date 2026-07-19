import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../../services/auth.service';
import { UserService, User } from '../../../../services/user.service';

@Component({
  selector: 'app-accounts',
  imports: [ReactiveFormsModule],
  templateUrl: './accounts.html',
  styleUrl: './accounts.css',
})
export class Accounts {
  authService = inject(AuthService);
  // signals to open and close add/edit user dialog
  isEditModalOpen = signal(false);
  isAddModalOpen = signal(false);
  //Form for adding a new user
  userForm!: FormGroup;

  editUser = {
    id: '',
    email: '',
    name: '',
    role: '',
    shopName: '',
    branch: '',
    phone: '',
  }

  // filters
  allUsers = signal<User[]>([]);
  shopOwners = signal<User[]>([]);
  employees = signal<User[]>([]);

  // create user dialog (USER TYPE)
  // default selected button is Owner
  userType = signal('Owner');
  showShopNameField = signal(true);

  // change the fields based on user type
  userTypeChange(role: string) {
    this.userType.set(role);
    if (this.userType() === 'Owner') {
      this.showShopNameField.set(true);
    } else {
      this.showShopNameField.set(false);
    }
  }


  constructor(
    private userService: UserService,
    private fb: FormBuilder
  ) {
  }

  openModal() {
    this.isEditModalOpen.set(true);
    this.isAddModalOpen.set(true);
  }

  async openEditModal(userId: string) {
    this.isEditModalOpen.set(true);
    this.isAddModalOpen.set(false);
    const userValue = await this.userService.getUser(userId);
    this.userForm.patchValue({
      id: userId,
      name: userValue?.name,
      email: userValue?.email,
      role: userValue?.role,
      branch: userValue?.branch,
      shopName: userValue?.shopName,
      phone: userValue?.phone,
    });
  }

  closeModal() {
    this.isAddModalOpen.set(false);
    this.isEditModalOpen.set(false);
    this.userForm.reset();
  }

  async ngOnInit() {
    try {
      // Call the service function and await the data array
      const users = await this.userService.getUsers();
      this.allUsers.set(users || []);

      //Filter the data array using native JavaScript logic
      this.filterUsers();
    } catch (error) {
      console.error('Error initializing users component:', error);
    }
    this.userForm = this.fb.group({
      id: [''],
      name: ['', [Validators.required, Validators.minLength(1)]],
      email: ['', [Validators.required]],
      role: ['', [Validators.required]],
      branch: ['', this.userType() === 'Owner' ? Validators.required : null],
      shopName: ['', this.userType() === 'Owner' ? Validators.required : null],
      phone: ['',],
    });
  }

  loadUsers() {
    this.userService.getUsers().then(users => {
      this.allUsers.set(users || []);
      this.filterUsers();
    });
  }

  async onSubmitUser() {
    if (this.userForm.invalid) {
      alert('Please fill in the form correctly!');
      return;
    }
    try {
      if (this.isEditModalOpen()) {
        await this.userService.updateUser(this.userForm.value);
      } else if (this.isAddModalOpen()) {
        await this.userService.createUser(this.userForm.value);
      }
      this.loadUsers();
      this.closeModal();
    }
    catch (error) {
      console.error('Error creating user:', error);
    }
  }

  filterUsers() {
    // Example A: Get products out of stock or low in stock (e.g., stock is 0)
    // Note: Ensure your schema has a "stock" field, or filter by availability:
    this.shopOwners.set(this.allUsers().filter(p => p.role === 'Owner'));
    this.employees.set(this.allUsers().filter(p => p.role === 'Employee'));
  }
}
