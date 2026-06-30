import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-topbar',
  imports: [],
  templateUrl: './topbar.html',
  styleUrl: './topbar.css',
})
export class Topbar {

  notificationCount = signal<number>(0);
  hasNotifications = signal<boolean>(false);
  constructor() {
    //TODO: call api to get notification count
    this.notificationCount.set(0);
    if (this.notificationCount() > 0) {
      this.hasNotifications.set(true);
    }
  }

  setNotifcationCount(count: number) {
    this.notificationCount.set(count);
    if (count > 0) {
      this.hasNotifications.set(true);
    } else {
      this.hasNotifications.set(false);
    }
  }
}
