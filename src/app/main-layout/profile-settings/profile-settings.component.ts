import { Component, OnInit, OnDestroy } from '@angular/core';
import { UserService } from '../../services/user.service';
import { User } from '../../interfaces/user.interface';
import { AuthService } from '../../services/auth.service';
import { THEMES } from '../../services/themes';
import { ThemeService } from '../../services/themes.service';
import { AngularFireStorage } from '@angular/fire/compat/storage';
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
  selectedFile: File = null;

  constructor(
    private authService: AuthService,
    private userService: UserService,
    public themeService: ThemeService,
    private storage: AngularFireStorage
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

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  saveChanges() {
    const updatedData = {
      username: this.updatedUsername,
      email: this.updatedEmail,
    };

    if (this.selectedFile) {
      const filePath = `profile_pictures/${this.loggedInUser.id}_${this.selectedFile.name}`;
      const fileRef = this.storage.ref(filePath);
      this.storage.upload(filePath, this.selectedFile).then(() => {
        fileRef.getDownloadURL().subscribe(url => {
          updatedData['profileUrl'] = url;
          this.updateUserData(updatedData);
        });
      });
    } else {
      this.updateUserData(updatedData);
    }

    this.editMode = false;
  }

  updateUserData(updatedData: Partial<User>) {
    if (updatedData.username !== this.loggedInUser.username ||
        updatedData.email !== this.loggedInUser.email ||
        updatedData['profileUrl']) {
      this.userService.updateUser(this.loggedInUser.id, updatedData).subscribe(() => {
        this.themeService.setTheme(this.selectedTheme);
      }, error => {
        console.error('Failed to update user', error);
      });
    } else {
      this.themeService.setTheme(this.selectedTheme);
    }
  }

  ngOnDestroy() {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }
}
