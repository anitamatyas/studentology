import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  isStudent: boolean = true;
  isSignUp: boolean = false;

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

  onSubmit(form: NgForm){
    console.log(form.value);
    form.reset();
  }
}
