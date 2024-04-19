import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-stud-sidenav',
  templateUrl: './stud-sidenav.component.html',
  styleUrls: ['./stud-sidenav.component.scss'],
})
export class StudSidenavComponent  implements OnInit {

  @Input() collapsed = true;

  constructor() { }

  ngOnInit() {}
  navItems: NavItem[] = [
    { icon: 'home', label: 'Classes', route: '/home/classes' },
    { icon: 'library_books', label: 'Assignments', route: '/home/assignments' },
    { icon: 'checklist', label: 'Tests', route: '/home/tests' },
    { icon: 'calendar_month', label: 'Calendar', route: '/home/calendar' }
  ];
}

export interface NavItem {
  icon: string;
  label: string;
  route: string;
}
