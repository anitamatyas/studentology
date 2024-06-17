import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { AuthComponent } from './auth/auth.component';
import { AppRoutingModule } from './app-routing.module';
import { FormsModule } from '@angular/forms';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatToolbarModule} from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button'
import { MatIconModule } from '@angular/material/icon'
import { ClassListComponent } from './main-layout/class-list/class-list.component';
import { MainLayoutComponent } from './main-layout/main-layout.component';
import {MatListModule} from '@angular/material/list';
import { StudSidenavComponent } from './main-layout/stud-sidenav/stud-sidenav.component';
import { AssignmentsComponent } from './main-layout/assignments/assignments.component';
import { TestsComponent } from './main-layout/tests/tests.component';
import { ClassService } from './services/class.service';
import { ClassItemComponent } from './main-layout/class-list/class-item/class-item.component';
import { ClassComponent } from './main-layout/class-list/class/class.component';
import { HttpClientModule } from '@angular/common/http';
import { AngularFireModule } from '@angular/fire/compat'
import { environment } from '../environments/environment';
import { LoadingSpinnerComponent } from './shared/loading-spinner/loading-spinner.component';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import { PostComponent } from './main-layout/class-list/class/post/post.component';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';
import {MatTabsModule} from '@angular/material/tabs';
import {MatTableModule} from '@angular/material/table';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialogModule } from '@angular/material/dialog';
import { CreateTestDialogComponent } from './popups/create-test-dialog/create-test-dialog.component';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatDatepickerModule} from '@angular/material/datepicker';
import { ProfileSettingsComponent } from './main-layout/profile-settings/profile-settings.component';
import {MatSelectModule} from '@angular/material/select';
import {MatInputModule} from '@angular/material/input';
import {MatRadioModule} from '@angular/material/radio';
import {MatCheckboxModule} from '@angular/material/checkbox';
import { MatNativeDateModule } from '@angular/material/core';
import { ReactiveFormsModule } from '@angular/forms';
import { AddMemberDialogComponent } from './popups/add-member-dialog/add-member-dialog.component';
import { InfoDialogComponent } from './popups/info-dialog/info-dialog.component';
import { AngularFireStorageModule } from '@angular/fire/compat/storage';
import { EditNameDialogComponent } from './popups/edit-name-dialog/edit-name-dialog.component';
import { MatSortModule } from '@angular/material/sort';
import { NgxMatDatetimePickerModule, NgxMatNativeDateModule, NgxMatTimepickerModule } from '@angular-material-components/datetime-picker';
import { CreateClassDialogComponent } from './popups/create-class-dialog/create-class-dialog.component';
import { SolveTestComponent } from './main-layout/tests/solve-test/solve-test.component';
import { ConfirmDialogComponent } from './popups/confirm-dialog/confirm-dialog.component';
import { GradesDialogComponent } from './popups/grades-dialog/grades-dialog.component';
import { NgChartsModule } from 'ng2-charts';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';

@NgModule({
  declarations: [
    AppComponent,
    ClassListComponent,
    AuthComponent,
    MainLayoutComponent,
    StudSidenavComponent,
    AssignmentsComponent,
    TestsComponent,
    ClassItemComponent,
    ClassComponent,
    LoadingSpinnerComponent,
    PostComponent,
    CreateTestDialogComponent,
    ProfileSettingsComponent,
    AddMemberDialogComponent,
    InfoDialogComponent,
    EditNameDialogComponent,
    CreateClassDialogComponent,
    SolveTestComponent,
    ConfirmDialogComponent,
    GradesDialogComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    MatSidenavModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatSidenavModule,
    MatListModule,
    MatTabsModule,
    MatTableModule,
    MatMenuModule,
    MatDialogModule,
    MatFormFieldModule,
    MatDatepickerModule,
    HttpClientModule,
    MatCheckboxModule,
    MatRadioModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatSortModule,
    MatNativeDateModule,
    NgxMatDatetimePickerModule,
    NgxMatTimepickerModule,
    NgxMatNativeDateModule,
    NgChartsModule,
    MatProgressSpinnerModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFirestoreModule,
    AngularFireAuthModule,
    AngularFireStorageModule,
  ],
  providers: [
    provideAnimationsAsync(),
    ClassService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
