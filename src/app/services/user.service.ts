import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { User } from '../interfaces/user.interface';

@Injectable({ providedIn: 'root' })
export class UserService {
    constructor(private firestore: AngularFirestore) { }

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
}
