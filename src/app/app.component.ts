import { Component, OnInit, inject } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit{
  title = 'studentology';

  constructor(private authService: AuthService) {

  }

  ngOnInit() {
    this.authService.autoLogin();
  }
}
