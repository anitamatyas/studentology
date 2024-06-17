import { Component, Input, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-stud-sidenav',
  templateUrl: './stud-sidenav.component.html',
  styleUrls: ['./stud-sidenav.component.scss'],
})
export class StudSidenavComponent  implements OnInit {

  @Input() collapsed = true;

  constructor(private authService: AuthService) { }

  ngOnInit() {}
  navItems: NavItem[] = [
    { icon: 'home', label: 'Classes', route: '/home/classes' },
    { icon: 'library_books', label: 'Assignments', route: '/home/assignments' },
    { icon: 'checklist', label: 'Tests', route: '/home/tests' },
    { icon: 'settings', label: 'Settings', route: '/home/settings' },
  ];

  onLogout(){
    this.authService.logout();
  }
}

export interface NavItem {
  icon: string;
  label: string;
  route: string;
}
