import { EventEmitter, Injectable } from "@angular/core";
import { Class, Group, Member } from "../interfaces/class.interface";
import { Post } from "../interfaces/post.interface";
import { BehaviorSubject, Observable, catchError, combineLatest, exhaustMap, from, map, switchMap, take, throwError } from "rxjs";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Firestore } from "@angular/fire/firestore";
import { AngularFirestore } from "@angular/fire/compat/firestore";
import { AuthService } from "./auth.service";
import { convertSnap, convertSnaps } from "./db-utils";
import { UserService } from "./user.service";
import firebase from 'firebase/compat/app';
import { DialogService } from "./dialog.service";

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

    getClasses(): Observable<Class[]> {
        return this.firestore.collection('classes').snapshotChanges().pipe(
            map(result => convertSnaps<Class>(result))
        );
    }

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

    addMemberToClassAndGroup(classId: string, userId: string, groupId: string): Observable<void> {
        const classDoc = this.firestore.doc(`classes/${classId}`);
        const membersCollection = classDoc.collection('members');

        console.log('Adding member!!!');

        // Check if the user is already a member
        const memberQuery = membersCollection.ref.where('userId', '==', userId).limit(1);

        return from(memberQuery.get()).pipe(
            switchMap(snapshot => {
                if (!snapshot.empty) {
                    // User is already a member
                    return throwError(new Error('User is already a member of this class.'));
                } else {
                    // User is not a member, proceed with adding the member
                    const newMember = {
                        userId: userId,
                        memberRole: 'student',
                        groupId: groupId
                    };

                    const memberRef = membersCollection.doc();
                    const memberId = memberRef.ref.id;

                    return from(memberRef.set(newMember).then(() => {
                        if (groupId !== 'ungrouped') {
                            const groupsCollection = classDoc.collection('groups');
                            const groupDoc = groupsCollection.doc(groupId);
                            return groupDoc.update({
                                members: firebase.firestore.FieldValue.arrayUnion(memberId)
                            });
                        }
                        return Promise.resolve();
                    }));
                }
            }),
            catchError(error => {
                return throwError(error);
            })
        );
    }

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

    getClassMembersLength(classId: string): Observable<number> {
        return this.firestore
            .collection(`classes/${classId}/members`)
            .snapshotChanges()
            .pipe(
                map(actions => actions.length)
            );
    }

    getClassById(classId: string): Observable<Class> {
        return this.firestore.doc<Class>(`classes/${classId}`).snapshotChanges().pipe(
            map(result => convertSnap<Class>(result))
        );
    }

    getGroupById(groupId: string): Observable<Group> {
        return this.firestore.doc<Group>(`groups/${groupId}`).snapshotChanges().pipe(
            map(action => {
                const data = action.payload.data() as Group;
                const id = action.payload.id;
                return { id, ...data };
            })
        );
    }

    getGroups(classId: string): Observable<Group[]> {
        return this.firestore.collection(`classes/${classId}/groups`).snapshotChanges().pipe(
            map(actions => actions.map(a => {
                const data = a.payload.doc.data() as Group;
                const id = a.payload.doc.id;
                return { id, ...data };
            }))
        );
    }

    updateGroupName(classId: string, groupId: string, newName: string): Promise<void> {
        return this.firestore.doc(`classes/${classId}/groups/${groupId}`).update({ title: newName });
    }

    updateClassTitle(classId: string, newTitle: string): Promise<void> {
        return this.firestore.doc(`classes/${classId}`).update({ title: newTitle });
    }
}