import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable, from } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { User } from '../interfaces/user.interface';
import { AngularFireStorage } from '@angular/fire/compat/storage';

@Injectable({ providedIn: 'root' })
export class UserService {
    constructor(private firestore: AngularFirestore, private storage: AngularFireStorage) { }

    getUserById(userId: string): Observable<User> {
        return this.firestore
            .collection<User>('users')
            .doc(userId)
            .snapshotChanges()
            .pipe(
                map(action => {
                    const data = action.payload.data() as User;
                    if (data) {
                        return { ...data, id: action.payload.id };
                    } else {
                        throw new Error('User not found');
                    }
                })
            );
    }

    getUserByEmail(email: string) {
        return this.firestore.collection('users', ref => ref.where('email', '==', email))
            .snapshotChanges()
            .pipe(
                map(actions => actions.map(a => {
                    const data = a.payload.doc.data() as User;
                    const id = a.payload.doc.id;
                    return { id, ...data };
                })[0])
            );
    }

    updateUser(userId: string, updatedData: Partial<User>): Observable<User> {
        const userRef = this.firestore.doc<User>(`users/${userId}`);
        return from(userRef.update(updatedData)).pipe(
            switchMap(() => userRef.valueChanges()),
            catchError(error => {
                console.error('Failed to update user', error);
                throw error;
            })
        );
    }

    getEmailByUserId(userId: string): Observable<string> {
        return this.firestore
            .collection<User>('users')
            .doc(userId)
            .snapshotChanges()
            .pipe(
                map(action => {
                    const data = action.payload.data() as User;
                    if (data) {
                        return data.email;
                    } else {
                        throw new Error('User not found');
                    }
                }),
                catchError(error => {
                    console.error('Failed to get user email', error);
                    throw error;
                })
            );
    }
}
