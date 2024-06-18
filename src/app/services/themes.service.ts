import { Injectable } from '@angular/core';
import { BehaviorSubject, take } from 'rxjs';
import { THEMES } from './themes';
import { AuthService } from './auth.service';
import { UserService } from './user.service';

@Injectable({
    providedIn: 'root'
})
export class ThemeService {
    private themeSubject = new BehaviorSubject<string>('theme1');
    theme$ = this.themeSubject.asObservable();

    constructor(
        private authService: AuthService,
        private userService: UserService) {
    }

    public initializeTheme() {
        this.authService.getSignedInUserObservable().pipe(
            take(1)
        ).subscribe(user => {
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

            this.authService.getSignedInUserObservable().pipe(
                take(1)
            ).subscribe(user => {
                if (user) {
                    this.userService.updateTheme(user.id, themeName).subscribe(
                        () => console.log('[THEME] - Theme saved to DB'),
                        error => console.error('Failed to save theme to DB', error)
                    );
                }
            });
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
}
