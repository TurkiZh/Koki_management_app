import { Routes } from '@angular/router';
import { Login } from './components/login/login';
import { HomeLayout } from './components/home/home-layout';
import { Home } from './components/home/page/home/home';
import { Orders } from './components/home/page/orders/orders';
import { Accounts } from './components/home/page/accounts/accounts';
import { Analytics } from './components/home/page/analytics/analytics';
import { Reports } from './components/home/page/reports/reports';
import { Products } from './components/home/page/products/products';
import { Settings } from './components/home/page/settings/settings';
import { authGuard } from './auth-guard';

export const routes: Routes = [
  // main route when app start 
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: '',
    component: HomeLayout,
    canActivate: [authGuard],
    children: [
      { path: 'home', component: Home },
      { path: 'orders', component: Orders },
      { path: 'products', component: Products },
      { path: 'accounts', component: Accounts },
      { path: 'analytics', component: Analytics },
      { path: 'reports', component: Reports },
      { path: 'settings', component: Settings },
    ],
  },
  // routes
  { path: 'login', component: Login },
  { path: '**', redirectTo: 'login' }
];

