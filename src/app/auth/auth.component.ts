import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { Observable, from } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.scss'
})
export class AuthComponent {
  isStudent = true;
  isSignUp = false;
  isLoading = false;
  error: string = null;

  constructor(private authService: AuthService, private router: Router){}

  toggleRole() {
    this.isStudent = !this.isStudent;
    this.isSignUp = false;
  }

  switchAuth(){
    this.isSignUp = !this.isSignUp;
  }

  switchMode(){
    this.isStudent = !this.isStudent;
  }

  onSubmit(form: NgForm) {
    if (!form.valid) {
      return;
    }
    const email = form.value.email;
    const password = form.value.password;
    this.isLoading = true;
    const role = this.isStudent ? 'student' : 'teacher';

    let authObs;

    if (this.isSignUp) {
      authObs = from(this.authService.signUp(email, password, role));
    } else {
      authObs = from(this.authService.signIn(email, password));
    }

    authObs.subscribe(
      () => {
        this.isLoading = false;
        console.log('[ROUTER] - Navigating to classes after auth');
        this.router.navigate(['home/classes']);
      },
      errorMessage => {
        console.log(errorMessage);
        this.error = errorMessage;
        this.isLoading = false;
      }
    );
    form.reset();
  }
}
