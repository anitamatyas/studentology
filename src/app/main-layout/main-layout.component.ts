import { Component, EventEmitter, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-main-layout',
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.scss'],
})
export class MainLayoutComponent  implements OnInit {
  collapsed = true;
  @Output() navBarCollapsed = new EventEmitter<boolean>();
  sideNavWidth = '65px';

  constructor() { }

  ngOnInit() {}

  toggleNavbar() {
    this.collapsed = !this.collapsed;
    this.navBarCollapsed.emit(this.collapsed);
    this.sideNavWidth = this.sideNavWidth === '65px' ? '200px' : '65px';
  }

}
