import { Component, OnInit, OnDestroy } from '@angular/core';
import { UserService } from '../../services/user.service';
import { User } from '../../interfaces/user.interface';
import { AuthService } from '../../services/auth.service';
import { THEMES } from '../../services/themes';
import { ThemeService } from '../../services/themes.service';
import { Observable, Subscription } from 'rxjs';
import { tap, take } from 'rxjs/operators';

@Component({
  selector: 'app-profile-settings',
  templateUrl: './profile-settings.component.html',
  styleUrls: ['./profile-settings.component.scss'],
})
export class ProfileSettingsComponent implements OnInit, OnDestroy {
  loggedInUser$: Observable<User>;
  loggedInUser: User;
  userSubscription: Subscription;
  themes = THEMES;
  editMode: boolean = false;
  updatedUsername: string;
  updatedEmail: string;
  selectedTheme: string;

  constructor(
    private authService: AuthService,
    private userService: UserService,
    public themeService: ThemeService
  ) { }

  ngOnInit() {
    this.loggedInUser$ = this.authService.getSignedInUserObservable().pipe(
      tap(user => {
        if (user) {
          this.loggedInUser = user;
          this.updatedUsername = user.username;
          this.updatedEmail = user.email;
        }
      })
    );
    this.selectedTheme = this.themeService.getCurrentTheme();
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
      username: this.updatedUsername,
      email: this.updatedEmail
    };

    console.log(updatedData);

    // Check if any data has changed
    if (updatedData.username !== this.loggedInUser.username ||
        updatedData.email !== this.loggedInUser.email) {
      this.userService.updateUser(this.loggedInUser.id, updatedData).subscribe(() => {
        this.themeService.setTheme(this.selectedTheme);
      }, error => {
        console.error('Failed to update user', error);
      });
    } else {
      this.themeService.setTheme(this.selectedTheme);
    }

    this.editMode = false;
  }

  ngOnDestroy() {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }
}
