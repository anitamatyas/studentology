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
export class ProfileSettingsComponent implements OnInit {
  loggedInUser: User;
  themes = THEMES;
  editMode: boolean = false;
  profileForm: FormGroup;
  selectedTheme: string;

  constructor(
    private authService: AuthService,
    private userService: UserService,
    public themeService: ThemeService,
    private fb: FormBuilder
  ) { }

  ngOnInit() {
    this.loggedInUser = this.authService.getSignedInUser();
    this.selectedTheme = this.themeService.getCurrentTheme();
    this.profileForm = this.fb.group({
      username: [this.loggedInUser.username],
      email: [this.loggedInUser.email],
      profilePic: [null]
    });
  }

  changeTheme(theme: string) {
    this.selectedTheme = theme;
    if (!this.editMode) {
      this.themeService.setTheme(theme);
    }
  }

  toggleEditMode() {
    this.editMode = !this.editMode;
    if (!this.editMode) {
      this.saveChanges();
    }
  }

  saveChanges() {
    const updatedData = {
      username: this.profileForm.get('username').value,
      email: this.profileForm.get('email').value,
      profilePic: this.profileForm.get('profilePic').value
    };

    this.userService.updateUser(this.loggedInUser.id, updatedData).subscribe(updatedUser => {
      this.loggedInUser = updatedUser;
      this.themeService.setTheme(this.selectedTheme);
    }, error => {
      console.error('Failed to update user', error);
    });

    this.editMode = false;
  }

  handleProfilePicChange(event) {
    const file = event.target.files[0];
    if (file) {
      this.profileForm.get('profilePic').setValue(file);
    }
  }
}
