import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';
import { User } from '../../interfaces/user.interface';
import { AuthService } from '../../services/auth.service';
import { THEMES } from '../../services/themes';
import { ThemeService } from '../../services/themes.service';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-profile-settings',
  templateUrl: './profile-settings.component.html',
  styleUrls: ['./profile-settings.component.scss'],
})
export class ProfileSettingsComponent  implements OnInit {
  loggedInUser: User;
  themes = THEMES;
  editMode = {
    username: false,
    email: false,
    profilePic: false
  };
  profileForm: FormGroup;

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private themeService: ThemeService,
    private fb: FormBuilder
  ) { }

  ngOnInit() {
    this.loggedInUser = this.authService.getSignedInUser();
    this.profileForm = this.fb.group({
      username: [this.loggedInUser.username],
      email: [this.loggedInUser.email]
    });
  }

  changeTheme(theme: string) {
    this.themeService.setTheme(theme);
  }

  toggleEditMode(field: string) {
    this.editMode[field] = !this.editMode[field];
  }

  saveChanges(field: string) {
    this.editMode[field] = false;
    console.log(this.profileForm.get(field).value);
    // this.userService.updateUser(this.loggedInUser.id, { [field]: this.profileForm.get(field).value })
    //   .subscribe(updatedUser => {
    //     this.loggedInUser[field] = updatedUser[field];
    //   });
  }

  handleProfilePicChange(event) {
    const file = event.target.files[0];
    if (file) {
      console.log(file);
      // this.userService.uploadProfilePic(this.loggedInUser.id, file).subscribe(url => {
      //   this.loggedInUser.profilePic = url;
      //   this.editMode.profilePic = false;
      // });
    }
  }

}
