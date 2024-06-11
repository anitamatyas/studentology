import { Component, NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AuthComponent } from "./auth/auth.component";
import { MainLayoutComponent } from "./main-layout/main-layout.component";
import { ClassListComponent } from "./main-layout/class-list/class-list.component";
import { AssignmentsComponent } from "./main-layout/assignments/assignments.component";
import { CalendarComponent } from "./main-layout/calendar/calendar.component";
import { TestsComponent } from "./main-layout/tests/tests.component";
import { ClassComponent } from "./main-layout/class-list/class/class.component";
import { AuthGuard } from "./auth/auth.guard";
import { ProfileSettingsComponent } from "./main-layout/profile-settings/profile-settings.component";
import { SolveTestComponent } from "./main-layout/tests/solve-test/solve-test.component";
import { UnsavedChangesGuard } from "./unsaved-changes-gurad";

const appRoutes: Routes = [
    { path: 'auth', component: AuthComponent },
    { path: '', redirectTo: '/home/classes', pathMatch: 'full' },
    {
        path: 'home',
        component: MainLayoutComponent,
        canActivate: [AuthGuard],
        children: [
                { path: 'classes', component: ClassListComponent},
                { path: 'classView/:id', component: ClassComponent },
                { path: 'assignments', component: AssignmentsComponent },
                { path: 'calendar', component: CalendarComponent },
                { path: 'tests', component: TestsComponent },
                { path: 'settings', component: ProfileSettingsComponent },
                { path: 'solve-test/:id', component: SolveTestComponent, canDeactivate: [UnsavedChangesGuard] },
                { path: '', redirectTo: 'classes', pathMatch: 'full' }
        ]
    },
    { path: '**', redirectTo: '/home/classes' }
];

@NgModule({
    imports: [RouterModule.forRoot(appRoutes)],
    exports: [RouterModule]
})
export class AppRoutingModule {

}