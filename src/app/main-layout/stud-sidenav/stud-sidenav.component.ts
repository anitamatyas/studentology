import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { User } from '../../interfaces/user.interface';
import { Observable, Subscription, tap } from 'rxjs';

@Component({
  selector: 'app-stud-sidenav',
  templateUrl: './stud-sidenav.component.html',
  styleUrls: ['./stud-sidenav.component.scss'],
})
export class StudSidenavComponent  implements OnInit, OnDestroy {
  loggedInUser: User;
  loggedInUserSub: Subscription;
  @Input() collapsed = true;

  constructor(private authService: AuthService) { }

  ngOnInit() {
    this.loggedInUser = this.authService.getSignedInUser();
    this.loggedInUserSub = this.authService.getSignedInUserObservable().subscribe(user => {
      this.loggedInUser = user;
    })
  }
  navItems: NavItem[] = [
    { icon: 'home', label: 'Classes', route: '/home/classes' },
    { icon: 'library_books', label: 'Assignments', route: '/home/assignments' },
    { icon: 'checklist', label: 'Tests', route: '/home/tests' },
    { icon: 'settings', label: 'Settings', route: '/home/settings' },
  ];

  onLogout(){
    this.authService.logout();
  }

  ngOnDestroy() {
    if (this.loggedInUserSub) this.loggedInUserSub.unsubscribe();
  }
}

export interface NavItem {
  icon: string;
  label: string;
  route: string;
}
