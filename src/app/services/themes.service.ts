import { Injectable, OnDestroy, OnInit } from '@angular/core';
import { BehaviorSubject, Subscription, take } from 'rxjs';
import { THEMES } from './themes';
import { AuthService } from './auth.service';
import { UserService } from './user.service';
import { User } from '../interfaces/user.interface';

@Injectable({
    providedIn: 'root'
})
export class ThemeService implements OnDestroy {
    private themeSubject = new BehaviorSubject<string>('theme1');
    theme$ = this.themeSubject.asObservable();
    themeSubscription : Subscription;
    loggedInUserSub: Subscription;
    loggedInUser: User;


    constructor(
        private authService: AuthService,
        private userService: UserService)
    {
        this.loggedInUserSub = this.authService.getSignedInUserObservable().subscribe( user => {
            this.loggedInUser = user;
        })
    }

    public initializeTheme() {
        this.themeSubscription = this.authService.getSignedInUserObservable()
        .pipe()
        .subscribe(user => {
            if (user) {
                const userTheme = user.theme || 'theme1';
                this.themeSubject.next(userTheme);
                const theme = THEMES[userTheme];
                if (theme) {
                    this.updateCSSVariables(theme);
                }
                console.log('[THEME] - Theme initialized to ', userTheme);
            }
        });
    }

    setTheme(themeName: string) {
        const theme = THEMES[themeName];
        if (theme) {
            this.themeSubject.next(themeName);
            this.updateCSSVariables(theme);
            this.userService.updateTheme(this.loggedInUser.id, themeName).pipe(take(1)).subscribe(
                () => console.log('[THEME] - Theme saved to DB'),
                error => console.error('Failed to save theme to DB', error)
            );
        }
        console.log('[THEME] - Theme set to ', theme);
    }

    getCurrentTheme(): string {
        return this.themeSubject.value;
    }

    private updateCSSVariables(theme: { [key: string]: string }) {
        Object.keys(theme).forEach(key => {
            document.documentElement.style.setProperty(`--${key}`, theme[key]);
        });
    }

    ngOnDestroy() {
        if (this.themeSubscription) this.themeSubscription.unsubscribe();
        if (this.loggedInUserSub) this.loggedInUserSub.unsubscribe();
    }
}
