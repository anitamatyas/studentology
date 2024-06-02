import { EventEmitter, Injectable } from "@angular/core";
import { Class, Member } from "../interfaces/class.interface";
import { Post } from "../interfaces/post.interface";
import { BehaviorSubject, Observable, catchError, exhaustMap, from, map, switchMap, take, throwError } from "rxjs";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Firestore } from "@angular/fire/firestore";
import { AngularFirestore } from "@angular/fire/compat/firestore";
import { AuthService } from "./auth.service";
import { convertSnap, convertSnaps } from "./db-utils";

const colorPalette = ['#10439F', '#874CCC', '#C65BCF', '#F27BBD'];
function getRandomColor(): string {
    const randomIndex = Math.floor(Math.random() * colorPalette.length);
    return colorPalette[randomIndex];
}

// const dummyClasses = [
//     {
//         id: 'class1',
//         title: 'Mathematics',
//         subTitle: 'Introduction to Algebra',
//         owner: 'Alice',
//         imagePath: getRandomColor(),
//         members: ['Alice', 'Bob', 'Charlie'],
//         posts: [
//             { content: 'Hello, welcome to the Mathematics class!', publisher: 'Alice', createdDate: new Date() },
//             { content: 'Does anyone have the solution to exercise 3?', publisher: 'Bob', createdDate: new Date() }
//         ]
//     },
//     {
//         id: 'class2',
//         title: 'History',
//         subTitle: 'World War II',
//         owner: 'Bob',
//         imagePath: getRandomColor(),
//         members: ['Bob', 'Daisy', 'Ethan'],
//         posts: [
//             { content: 'Today we will learn about the Battle of Stalingrad.', publisher: 'Bob', createdDate: new Date() },
//             { content: 'Who is presenting next week?', publisher: 'Daisy', createdDate: new Date() }
//         ]
//     },
//     {
//         id: 'class3',
//         title: 'Physics',
//         subTitle: 'Introduction to Mechanics',
//         owner: 'Charlie',
//         imagePath: getRandomColor(),
//         members: ['Charlie', 'Ethan', 'Grace'],
//         posts: [
//             { content: 'Reminder: Quiz on Friday!', publisher: 'Charlie', createdDate: new Date() },
//             { content: 'Where can I find additional practice problems?', publisher: 'Ethan', createdDate: new Date() }
//         ]
//     },
//     {
//         id: 'class4',
//         title: 'Computer Science',
//         subTitle: 'Data Structures and Algorithms',
//         owner: 'Daisy',
//         imagePath: getRandomColor(),
//         members: ['Daisy', 'Frank', 'Grace'],
//         posts: [
//             { content: 'Welcome to the Computer Science class!', publisher: 'Daisy', createdDate: new Date() },
//             { content: 'Does anyone have the solution to problem 5?', publisher: 'Frank', createdDate: new Date() }
//         ]
//     },
//     {
//         id: 'class5',
//         title: 'Biology',
//         subTitle: 'Cell Biology',
//         owner: 'Ethan',
//         imagePath: getRandomColor(),
//         members: ['Ethan', 'Alice', 'Bob'],
//         posts: [
//             { content: 'Today we will discuss cell structures.', publisher: 'Ethan', createdDate: new Date() },
//             { content: 'How do organelles function?', publisher: 'Alice', createdDate: new Date() }
//         ]
//     },
//     // Add more classes as needed...
// ];
@Injectable()
export class ClassService {

    constructor(
        private firestore: AngularFirestore
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

    // storeClasses(){
    //     dummyClasses.forEach(cls => {
    //         const classData = {
    //             id: cls.id,
    //             title: cls.title,
    //             subTitle: cls.subTitle,
    //             owner: cls.owner,
    //             imagePath: cls.imagePath,
    //             members: cls.members,
    //             posts: cls.posts ? cls.posts.map(post => ({ content: post.content, publisher: post.publisher, createdDate: post.createdDate })) : []
    //         };
    //         this.firestore.collection('classes').add(classData);
    //     });
    // }
}