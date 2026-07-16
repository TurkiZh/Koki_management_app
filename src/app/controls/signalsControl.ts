import { signal } from "@angular/core";

export class SignalsControl {
    notificationCount = signal<number>(0);
    // page = signal<string>("");
    // userType = signal<string>("");
    // pageTitle = computed(() => {
    //     return `${this.userType()} Dashboard - ${this.page()}`;
    // });

    constructor() {

    }

    setNotificationCount(count: number) {
        this.notificationCount.set(count);
    }

    getNotificationCount() {
        return this.notificationCount();
    }

}