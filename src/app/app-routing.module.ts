import { Component, NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { LoginComponent } from "./login/login.component";
import { MainLayoutComponent } from "./main-layout/main-layout.component";
import { ClassListComponent } from "./main-layout/class-list/class-list.component";
import { AssignmentsComponent } from "./main-layout/assignments/assignments.component";
import { CalendarComponent } from "./main-layout/calendar/calendar.component";
import { TestsComponent } from "./main-layout/tests/tests.component";
import { ClassComponent } from "./main-layout/class-list/class/class.component";

const appRoutes: Routes = [
    { path: 'login', component: LoginComponent },
    { path: '', redirectTo: '/home/classes', pathMatch: 'full' },
    { 
        path: 'home',
        component: MainLayoutComponent,
        children: [
            { 
                path: 'classes',
                component: ClassListComponent,
                children: [
                    {
                        path: 'classView', component: ClassComponent
                    }
                ]},
            { path: 'assignments', component: AssignmentsComponent },
            { path: 'calendar', component: CalendarComponent },
            { path: 'tests', component: TestsComponent },
            { path: '', redirectTo: 'classes', pathMatch: 'full' }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forRoot(appRoutes)],
    exports: [RouterModule]
})
export class AppRoutingModule {

}