import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from "@angular/router";
import { Observable, map, take } from "rxjs";
import { AuthService } from "../services/auth.service";

@Injectable({providedIn: 'root'})
export class AuthGuard {

    constructor(private authService: AuthService, private router: Router){}

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | Promise<boolean> | Observable<boolean | UrlTree>{
        return this.authService.user.pipe(
            take(1),
            map(user => {
            const isAuth = !!user;
            if (isAuth && state.url.includes('/auth')) {
                this.authService.logout();
                return this.router.createUrlTree(['/auth']);
            }
            if (isAuth) return true;
            return this.router.createUrlTree(['/auth']);
        }));
    }
}