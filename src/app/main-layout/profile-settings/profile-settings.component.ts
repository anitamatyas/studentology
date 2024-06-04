import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';
import { User } from '../../interfaces/user.interface';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-profile-settings',
  templateUrl: './profile-settings.component.html',
  styleUrls: ['./profile-settings.component.scss'],
})
export class ProfileSettingsComponent  implements OnInit {
  loggedInUser: User;

  constructor(private authService: AuthService, private userService: UserService) { }

  ngOnInit() {
    this.loggedInUser = this.authService.getSignedInUser();
  }

}
