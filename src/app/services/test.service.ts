import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable, combineLatest, from } from 'rxjs';
import { map } from 'rxjs/operators';
import { Submission, Test } from '../interfaces/test.interface';

@Injectable({
    providedIn: 'root'
})
export class TestService {
    constructor(private firestore: AngularFirestore) { }

    getTestsForClasses(classIds: string[]): Observable<Test[]> {
        return this.firestore.collection<Test>('tests', ref => ref.where('classId', 'in', classIds))
            .snapshotChanges().pipe(
                map(actions => actions.map(a => {
                    const data = a.payload.doc.data() as Test;
                    const id = a.payload.doc.id;
                    return { id, ...data };
                }))
            );
    }

    getTestById(testId: string): Observable<Test> {
        return this.firestore.doc<Test>(`tests/${testId}`).snapshotChanges().pipe(
            map(action => {
                const data = action.payload.data() as Test;
                const id = action.payload.id;
                return { id, ...data };
            })
        );
    }

    getSubmissions(testId: string): Observable<Submission[]> {
        return this.firestore.collection<Submission>(`tests/${testId}/submissions`).snapshotChanges().pipe(
            map(actions => actions.map(a => {
                const data = a.payload.doc.data() as Submission;
                const id = a.payload.doc.id;
                return { id, ...data };
            }))
        );
    }

    updateSubmission(testId: string, submission: Submission): Observable<void> {
        return from(this.firestore.doc(`tests/${testId}/submissions/${submission.id}`).update(submission));
    }

    updateTest(testId: string, data: Partial<Test>): Observable<void> {
        return from(this.firestore.doc(`tests/${testId}`).update(data));
    }

    submitTest(testId: string, submission: Submission): Promise<void> {
        const submissionRef = this.firestore.collection(`tests/${testId}/submissions`).doc();
        return submissionRef.set(submission);
    }
}
