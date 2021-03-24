import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';

import {HomeComponent} from './home';
import {PlayComponent} from './play/play.component';
import {PrizesComponent} from './prizes/prizes.component';
import {AuthGuard} from './_helpers';

const accountModule = () => import('./account/account.module').then(x => x.AccountModule);
const usersModule = () => import('./users/users.module').then(x => x.UsersModule);

const routes: Routes = [{
    path: 'home',
    component: HomeComponent
  },
  {
    path: 'users',
    loadChildren: usersModule,
    canActivate: [AuthGuard]
  },
  {
    path: 'prizes',
    component: PrizesComponent
  },
  {
    path: 'play',
    component: PlayComponent
  },
  {
    path: 'account',
    loadChildren: accountModule
  },

  // otherwise redirect to home
  {
    path: '',
    redirectTo: '/home',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: '/'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
