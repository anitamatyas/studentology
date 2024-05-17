import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { HeaderComponent } from './header/header.component';
import { LoginComponent } from './login/login.component';
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
import { CalendarComponent } from './main-layout/calendar/calendar.component';
import { AssignmentsComponent } from './main-layout/assignments/assignments.component';
import { TestsComponent } from './main-layout/tests/tests.component';
import { ClassService } from './services/class.service';
import { ClassItemComponent } from './main-layout/class-list/class-item/class-item.component';
import { CommonModule } from '@angular/common';
import { ClassComponent } from './main-layout/class-list/class/class.component';
import { HttpClientModule } from '@angular/common/http';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { AngularFireModule } from '@angular/fire/compat'
import { environment } from '../environments/environment';

@NgModule({
  declarations: [
    AppComponent,
    ClassListComponent,
    HeaderComponent,
    LoginComponent,
    MainLayoutComponent,
    StudSidenavComponent,
    CalendarComponent,
    AssignmentsComponent,
    TestsComponent,
    ClassItemComponent,
    ClassComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    MatSidenavModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatSidenavModule,
    MatListModule,
    HttpClientModule,
    AngularFireModule.initializeApp(environment.firebase),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore())
  ],
  providers: [
    provideAnimationsAsync(),
    ClassService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
