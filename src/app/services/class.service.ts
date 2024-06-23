import { EventEmitter, Injectable } from "@angular/core";
import { Class, Group, Member } from "../interfaces/class.interface";
import { Post } from "../interfaces/post.interface";
import { BehaviorSubject, Observable, catchError, combineLatest, exhaustMap, forkJoin, from, map, of, switchMap, take, throwError } from "rxjs";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Firestore } from "@angular/fire/firestore";
import { AngularFirestore } from "@angular/fire/compat/firestore";
import { AuthService } from "./auth.service";
import { convertSnap, convertSnaps } from "./db-utils";
import { UserService } from "./user.service";
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import { DialogService } from "./dialog.service";
import { Assignment, Test } from "../interfaces/test.interface";
import { Note } from "../interfaces/notes.interface";

// Define a color palette and a function to get a random color
const colorPalette = ['#10439F', '#874CCC', '#C65BCF', '#F27BBD'];
function getRandomColor(): string {
    const randomIndex = Math.floor(Math.random() * colorPalette.length);
    return colorPalette[randomIndex];
}

@Injectable()
export class ClassService {

    constructor(
        private firestore: AngularFirestore,
        private userService: UserService,
        private dialogService: DialogService,
    ) { }

    //Fetches all classes from the Firestore.

    getClasses(): Observable<Class[]> {
        return this.firestore.collection('classes').snapshotChanges().pipe(
            map(result => convertSnaps<Class>(result))
        );
    }

    //Create class
    createClass(newClass: Class): Promise<void> {
        const classId = this.firestore.createId();
        newClass.id = classId;
        const classDoc = this.firestore.collection('classes').doc(classId);

        return classDoc.set(newClass).then(() => {
            const member = {
                userId: newClass.owner,
                memberRole: 'teacher',
                groupId: 'ungrouped'
            };
            return classDoc.collection('members').add(member).then(() => { });
        });
    }

    //Fetches members of a class.

    getClassMembers(classId: string): Observable<Member[]> {
        return this.firestore
            .collection(`classes/${classId}/members`)
            .snapshotChanges()
            .pipe(
                map(actions => actions.map(a => {
                    const data = a.payload.doc.data() as Member;
                    const id = a.payload.doc.id;
                    return { id, ...data };
                }))
            );
    }

    findClassByCode(classCode: string): Observable<any> {
        return this.firestore.collection('classes', ref => ref.where('classCode', '==', classCode)).snapshotChanges().pipe(
            map(actions => {
                const classes = actions.map(a => {
                    const data = a.payload.doc.data() as Class;
                    const id = a.payload.doc.id;
                    return { id, ...data };
                });
                return classes.length > 0 ? classes[0] : null;
            })
        );
    }

    //Adds new member to class

    addMemberToClass(classId: string, userId: string): Observable<void> {
        return this.addMemberToClassAndGroup(classId, userId, 'ungrouped');
    }

    //Adds a member to a class and group.

    addMemberToClassAndGroup(classId: string, userId: string, groupId: string): Observable<void> {
        const classDoc = this.firestore.doc(`classes/${classId}`);
        const membersCollection = classDoc.collection('members');

        console.log('Adding or updating member!!!');

        // Check if the user is already a member
        const memberQuery = membersCollection.ref.where('userId', '==', userId).limit(1);

        return from(this.userService.getEmailByUserId(userId)).pipe(
            switchMap(email => from(memberQuery.get()).pipe(
                switchMap(snapshot => {
                    if (!snapshot.empty) {
                        const memberDocId = snapshot.docs[0].id;
                        return from(membersCollection.doc(memberDocId).update({ groupId }));
                    } else {
                        const newMember = {
                            userId: userId,
                            memberRole: 'student',
                            groupId: groupId,
                            email: email
                        };

                        const memberRef = membersCollection.doc();
                        return from(memberRef.set(newMember));
                    }
                })
            )),
            catchError(error => {
                console.log(error);
                return throwError(error);
            })
        );
    }

    //Fetches members of a class along with their user details.

    getClassMembersWithUserDetails(classId: string): Observable<Member[]> {
        return this.getClassMembers(classId).pipe(
            switchMap(members => {
                const userObservables = members.map(member =>
                    this.userService.getUserById(member.userId).pipe(
                        map(user => ({ ...member, user }))
                    )
                );
                return combineLatest(userObservables);
            })
        );
    }

    //Ungroups a member from a group, setting their groupId to 'ungrouped'.

    ungroupMember(memberId: string, classId: string): Promise<void> {
        const memberRef = this.firestore.doc(`classes/${classId}/members/${memberId}`);
        return memberRef.update({ groupId: 'ungrouped' }).then(() => {
            return this.firestore.collection(`classes/${classId}/groups`).get().toPromise().then(groupsSnapshot => {
                groupsSnapshot.forEach(groupDoc => {
                    const groupData = groupDoc.data() as Group;
                    if (groupData.members.includes(memberId)) {
                        const updatedMembers = groupData.members.filter(id => id !== memberId);
                        this.firestore.doc(`classes/${classId}/groups/${groupDoc.id}`).update({ members: updatedMembers });
                    }
                });
            });
        });
    }

    //Adds a new group to a class.

    addNewGroup(classId: string, groupTitle: string): Promise<void> {
        const groupsCollection = this.firestore.collection(`classes/${classId}/groups`);
        const newGroupRef = groupsCollection.doc();
        const newGroupId = newGroupRef.ref.id;

        return newGroupRef.set({
            id: newGroupId,
            title: groupTitle,
            members: []
        });
    }

    //Deletes a member from a class.

    deleteMemberFromClass(memberId: string, classId: string): Promise<void> {
        const memberRef = this.firestore.doc(`classes/${classId}/members/${memberId}`);
        return memberRef.delete().then(() => {
            return this.firestore.collection(`classes/${classId}/groups`).get().toPromise().then(groupsSnapshot => {
                groupsSnapshot.forEach(groupDoc => {
                    const groupData = groupDoc.data() as Group;
                    if (groupData.members.includes(memberId)) {
                        const updatedMembers = groupData.members.filter(id => id !== memberId);
                        this.firestore.doc(`classes/${classId}/groups/${groupDoc.id}`).update({ members: updatedMembers });
                    }
                });
            });
        });
    }

    //Gets the number of members in a class.

    getClassMembersLength(classId: string): Observable<number> {
        return this.firestore
            .collection(`classes/${classId}/members`)
            .snapshotChanges()
            .pipe(
                map(actions => actions.length)
            );
    }

    //Fetches a class by its ID.

    getClassById(classId: string): Observable<Class> {
        return this.firestore.doc<Class>(`classes/${classId}`).snapshotChanges().pipe(
            map(result => convertSnap<Class>(result))
        );
    }

    //Get member role by id and classid
    getMemberRoleByUserIdAndClassId(userId: string, classId: string): Observable<string> {
        return this.firestore.collection<Member>(`classes/${classId}/members`, ref => ref.where('userId', '==', userId)).snapshotChanges().pipe(
            map(actions => {
                if (actions.length === 0) {
                    return null;
                }
                const data = actions[0].payload.doc.data() as Member;
                return data.memberRole;
            })
        );
    }

    //Fetches a group by its ID.

    getGroupById(groupId: string): Observable<Group> {
        return this.firestore.doc<Group>(`groups/${groupId}`).snapshotChanges().pipe(
            map(action => {
                const data = action.payload.data() as Group;
                const id = action.payload.id;
                return { id, ...data };
            })
        );
    }

    //Fetches all groups in a class.

    getGroups(classId: string): Observable<Group[]> {
        return this.firestore.collection(`classes/${classId}/groups`).snapshotChanges().pipe(
            map(actions => actions.map(a => {
                const data = a.payload.doc.data() as Group;
                const id = a.payload.doc.id;
                return { id, ...data };
            }))
        );
    }

    //Updates the name of a group.

    updateGroupName(classId: string, groupId: string, newName: string): Promise<void> {
        return this.firestore.doc(`classes/${classId}/groups/${groupId}`).update({ title: newName });
    }

    //Delete group

    deleteGroup(classId: string, groupId: string): Promise<void> {
        return this.firestore.doc(`classes/${classId}/groups/${groupId}`).delete();
    }

    getClassesForUser(userId: string): Observable<Class[]> {
        return this.firestore.collection<Class>('classes').snapshotChanges().pipe(
            switchMap(actions => {
                const classes = actions.map(a => {
                    const data = a.payload.doc.data() as Class;
                    const id = a.payload.doc.id;
                    return { id, ...data };
                });

                // For each class, check if the user is a member
                const classChecks = classes.map(cls =>
                    this.firestore.collection(`classes/${cls.id}/members`, ref => ref.where('userId', '==', userId)).get().pipe(
                        map(membersSnapshot => membersSnapshot.size > 0 ? cls : null)
                    )
                );

                // Combine results and filter out null values
                return forkJoin(classChecks).pipe(
                    map(results => results.filter(cls => cls !== null))
                );
            })
        );
    }

    addAssignment(assignment: Assignment): Promise<void> {
        const assignmentCollection = this.firestore.collection<Assignment>('assignments');
        const assignmentToSave = {
            ...assignment,
            dueDate: assignment.dueDate
        };
        return assignmentCollection.add(assignmentToSave).then();
    }

    getClassTitleById(classId: string): Observable<string> {
        return this.firestore.doc<Class>(`classes/${classId}`).valueChanges().pipe(
            map(cls => cls.title)
        );
    }

    //Updates the title of a class.

    updateClassTitle(classId: string, newTitle: string): Promise<void> {
        return this.firestore.doc(`classes/${classId}`).update({ title: newTitle });
    }

    //Adds a new test.
    addTest(test: Test): Promise<void> {
        const testsCollection = this.firestore.collection<Test>('tests');
        const testToSave = {
            ...test,
            dueDate: test.dueDate  // Ensure the dueDate is a Firebase Timestamp
        };
        return testsCollection.add(testToSave).then();
    }

    getNoteForClassAndUser(classId: string, userId: string): Observable<Note> {
        return this.firestore.collection('notes', ref => ref
            .where('classId', '==', classId)
            .where('userId', '==', userId))
            .snapshotChanges()
            .pipe(
                map(actions => {
                    const data = actions.map(a => {
                        const data = a.payload.doc.data() as Note;
                        const id = a.payload.doc.id;
                        return { id, ...data };
                    });
                    return data[0];
                })
            );
    }

    saveNote(note: Note): Promise<void> {
        const noteId = this.firestore.createId();
        return this.firestore.collection('notes').doc(noteId).set(note);
    }

    updateNote(noteId: string, note: Note): Promise<void> {
        return this.firestore.collection('notes').doc(noteId).update(note);
    }

    updateMemberRole(classId: string, memberId: string, updatedMember: Member): Promise<void> {
        return this.firestore.collection('classes').doc(classId).collection('members').doc(memberId).update(updatedMember);
    }
}