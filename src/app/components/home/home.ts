import { Component } from '@angular/core';
import { Sidebar } from './sidebar/sidebar';
import { Topbar } from './topbar/topbar';
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [RouterLink, RouterOutlet, Sidebar, Topbar],
  templateUrl: './home.html',
  styleUrl: './home.css',
})

export class Home {

}
