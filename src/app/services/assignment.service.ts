import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';
import { Assignment, Submission } from '../interfaces/test.interface';

@Injectable({
    providedIn: 'root'
})
export class AssignmentService {

    constructor(private firestore: AngularFirestore) { }

    getAssignmentsForClasses(classIds: string[]): Observable<Assignment[]> {
        return this.firestore.collection<Assignment>('assignments', ref => ref.where('classId', 'in', classIds)).snapshotChanges().pipe(
            map(actions => actions.map(a => {
                const data = a.payload.doc.data() as Assignment;
                const id = a.payload.doc.id;
                return { id, ...data };
            }))
        );
    }

    getSubmissions(assignmentId: string): Observable<Submission[]> {
        return this.firestore.collection<Submission>(`assignments/${assignmentId}/submissions`).snapshotChanges().pipe(
            map(actions => actions.map(a => {
                const data = a.payload.doc.data() as Submission;
                const id = a.payload.doc.id;
                return { id, ...data };
            }))
        );
    }

    addSubmission(assignmentId: string, submission: Submission): Promise<void> {
        const submissionId = this.firestore.createId();
        return this.firestore.doc(`assignments/${assignmentId}/submissions/${submissionId}`).set(submission);
    }

    updateSubmissionGrade(assignmentId: string, submissionId: string, grade: number) {
        return from(this.firestore.doc(`assignments/${assignmentId}/submissions/${submissionId}`).update({ grade }));
    }
}
