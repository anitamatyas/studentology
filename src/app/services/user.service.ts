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

    updateUser(userId: string, updatedData: any): Observable<User> {
        const userRef = this.firestore.doc<User>(`users/${userId}`);

        if (updatedData.profilePic) {
            const filePath = `profile_pics/${userId}_${Date.now()}`;
            const fileRef = this.storage.ref(filePath);
            const uploadTask = this.storage.upload(filePath, updatedData.profilePic);

            return from(uploadTask).pipe(
                switchMap(() => fileRef.getDownloadURL()),
                switchMap((url) => {
                    updatedData.profilePic = url;
                    return from(userRef.update(updatedData));
                }),
                switchMap(() => userRef.valueChanges()),
                catchError(error => {
                    console.error('Failed to update user', error);
                    throw error;
                })
            );
        } else {
            return from(userRef.update(updatedData)).pipe(
                switchMap(() => userRef.valueChanges()),
                catchError(error => {
                    console.error('Failed to update user', error);
                    throw error;
                })
            );
        }
    }
}
