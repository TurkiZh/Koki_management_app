import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Topbar } from '../home/main_components/topbar/topbar';
import { Sidebar } from '../home/main_components/sidebar/sidebar';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-home-layout',
  standalone: true,
  imports: [RouterOutlet, Topbar, Sidebar],
  templateUrl: "./home-layout.html",
  styleUrl: "./home-layout.css"
})
export class HomeLayout implements OnInit {
  private authService = inject(AuthService);

  ngOnInit(): void {
    const user = this.authService.currentUser();
    console.log("Current authenticated user:", user);

    if (user && user.role !== 'Admin') {
      console.info(`Logged in as ${user.role}: ${user.name}`);
    }
  }
}