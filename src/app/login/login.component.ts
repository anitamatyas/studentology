import { Component } from '@angular/core';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  isStudent: boolean = true;
  isSignUp: boolean = false;

  toggleRole(): void {
    this.isStudent = !this.isStudent;
    this.isSignUp = false;
  }

  toggleView(): void {
    this.isSignUp = !this.isSignUp;
  }
}
