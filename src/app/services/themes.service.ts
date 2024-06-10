import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { THEMES } from './themes';

@Injectable({
    providedIn: 'root'
})
export class ThemeService {
    private themeSubject = new BehaviorSubject<string>('theme1');
    theme$ = this.themeSubject.asObservable();

    setTheme(themeName: string) {
        const theme = THEMES[themeName];
        if (theme) {
            this.themeSubject.next(themeName);
            this.updateCSSVariables(theme);
        }
        console.log('[THEME] - Theme set to ', theme)
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
