import {
  Component,
  ElementRef,
  HostListener,
  OnInit,
  ViewChild
} from '@angular/core';

import {
  AccountService, AlertService
} from './_services';
import {
  User
} from './_models';
import {
  ActivatedRoute,
  Router
} from '@angular/router';


@Component({
  selector: 'app',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent implements OnInit {
  currentUser: User;

  constructor(private accountService: AccountService, private router: Router, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.accountService.user.subscribe(async user => {
      this.currentUser = user
      if (!this.currentUser) await this.router.navigate(['/home']);
    });
  }

  ngAfterViewInit() {}

  async logout() {
    this.accountService.logout();
    await this.router.navigate(['/home']);
    window.location.reload();
  }
}
