import { Component, OnInit, Renderer2, inject } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import { AuthService } from './services/auth.service';
import { ThemeService } from './services/themes.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit{
  title = 'studentology';
  currentTheme: string;
  themeSubscription: Subscription;

  constructor(private authService: AuthService, private renderer: Renderer2, private themeService: ThemeService) {
    //this.renderer.addClass(document.documentElement, 'theme2');
  }

  ngOnInit() {
    this.themeService.initializeTheme();
    this.themeSubscription = this.themeService.theme$.subscribe(themeName => {
      if (this.currentTheme) {
        this.renderer.removeClass(document.body, this.currentTheme);
      }
      this.currentTheme = themeName;
      this.renderer.addClass(document.body, themeName);
    });
    this.authService.autoLogin();
  }
}
