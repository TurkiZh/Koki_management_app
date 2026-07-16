import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Topbar } from '../home/main_components/topbar/topbar';
import { Sidebar } from '../home/main_components/sidebar/sidebar';

@Component({
  selector: 'app-home-layout',
  standalone: true,
  imports: [RouterOutlet, Topbar, Sidebar],
  templateUrl: "./home-layout.html",
  styleUrl: "./home-layout.css"
})
export class HomeLayout { }