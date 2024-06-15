import { Component, EventEmitter, OnInit, Output, Renderer2 } from '@angular/core';
import { ThemeService } from '../services/themes.service';

@Component({
  selector: 'app-main-layout',
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.scss'],
})
export class MainLayoutComponent  implements OnInit {
  collapsed = true;
  @Output() navBarCollapsed = new EventEmitter<boolean>();
  sideNavWidth = '55px';
  currentTheme: string;

  constructor(private themeService: ThemeService, private renderer: Renderer2) { }

  ngOnInit() {
    this.themeService.theme$.subscribe(themeName => {
      this.currentTheme = themeName;
      this.setBackground(themeName);
    });
  }

  private setBackground(themeName: string) {
    const bgImageUrl = `url('../../assets/images/${themeName}.svg')`;
    const navContent = document.querySelector('.nav-content');
    if (navContent) {
      this.renderer.setStyle(navContent, 'background-image', bgImageUrl);
    }
  }

  toggleNavbar() {
    this.collapsed = !this.collapsed;
    this.navBarCollapsed.emit(this.collapsed);
    this.sideNavWidth = this.sideNavWidth === '55px' ? '200px' : '55px';
  }

}
