import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Injectable, OnDestroy, OnInit } from "@angular/core";
import { BehaviorSubject, Observable, Subject, Subscription, catchError, map, switchMap, tap, throwError } from "rxjs";
import { User } from "../interfaces/user.interface";
import { AngularFireAuth } from "@angular/fire/compat/auth";
import { Router } from "@angular/router";
import { AngularFirestore } from "@angular/fire/compat/firestore";

@Injectable({providedIn: 'root'})
export class AuthService implements OnInit, OnDestroy{
    user = new BehaviorSubject<User>(null);
    token: string = null;
    private authSubscription: Subscription;

    constructor(
        private angularFireAuth: AngularFireAuth,
        private router: Router, private firestore: AngularFirestore
    ) { }

    ngOnInit() {
        this.authSubscription = this.angularFireAuth.authState.subscribe(user => {
            if (!user) {
                this.logout();
            }
        });
    }

    public signUp(email: string, password: string, role: string) {
        return this.angularFireAuth.createUserWithEmailAndPassword(email, password)
            .then(userCredential => {
                const user = userCredential.user;
                if (user) {
                    return user.getIdToken().then(token => {
                        const username = user.email.split('@')[0];
                        const profilePic = 'https://i.pinimg.com/originals/a6/58/32/a65832155622ac173337874f02b218fb.png';
                        const newUser: User = {
                            id: user.uid,
                            email: user.email,
                            username: username,
                            createdDate: new Date().toISOString(),
                            role: role,
                            token: token,
                            profilePic: profilePic,
                            theme: 'theme1'
                        };
                        return this.firestore.collection('users').doc(user.uid).set(newUser).then(() => {
                            this.handleAuth(newUser);
                        });
                    });
                } else {
                    throw new Error('User not found');
                }
            })
            .catch(this.handleError);
    }

    public signIn(email: string, password: string) {
        return this.angularFireAuth.signInWithEmailAndPassword(email, password)
            .then(userCredential => {
                const user = userCredential.user;
                if (user) {
                    return user.getIdToken().then(token => {
                        return this.firestore.collection('users').doc(user.uid).get().toPromise().then(doc => {
                            if (doc.exists) {
                                const userData = doc.data() as User;
                                userData.token = token;
                                this.handleAuth(userData);
                            } else {
                                throw new Error('User not found in database');
                            }
                        });
                    });
                } else {
                    throw new Error('User not found');
                }
            })
            .catch(this.handleError);
    }

    autoLogin(){
        const userData = JSON.parse(localStorage.getItem('userData'));
        if (!userData) {
            return;
        }
        this.user.next({
            id: userData.id,
            createdDate: userData.createdDate,
            email: userData.email,
            profilePic: userData.profilePic,
            role: userData.role,
            token: userData.token,
            username: userData.username,
            profileUrl: userData.profileUrl,
            theme: userData.theme
        })
    }

    public logout(){
        localStorage.removeItem('userData');
        this.user.next(null);
        this.angularFireAuth.signOut().then(() => {
            this.router.navigate(['/auth']);
        });
    }

    private handleAuth(user: User) {
        this.user.next(user);
        localStorage.setItem('userData', JSON.stringify(user));
    }

    private handleError(error: any) {
        let errorMessage = 'An unknown error occurred!';
        if (error.code) {
            switch (error.code) {
                case 'auth/email-already-in-use':
                    errorMessage = 'This email address is already in use!';
                    break;
                case 'auth/user-not-found':
                case 'auth/wrong-password':
                    errorMessage = 'Invalid login credentials!';
                    break;
                default:
                    errorMessage = error.message;
            }
        }
        console.error(errorMessage);
        return throwError(() => new Error(errorMessage));
    }

    public getSignedInUser(){
        return this.user.value;
    }

    public getSignedInUserObservable(): Observable<User> {
        return this.angularFireAuth.authState.pipe(
            switchMap(user => {
                if (user) {
                    return this.firestore.collection('users').doc(user.uid).snapshotChanges().pipe(
                        map(action => {
                            const data = action.payload.data() as User;
                            return { id: action.payload.id, ...data };
                        })
                    );
                } else {
                    return throwError(new Error('No user is signed in'));
                }
            })
        );
    }

    ngOnDestroy() {
        if (this.authSubscription) this.authSubscription.unsubscribe();
    }

}