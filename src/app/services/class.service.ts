import { EventEmitter, Injectable } from "@angular/core";
import { Class } from "../models/class.model";
import { Post } from "../models/post.model";
import { BehaviorSubject, map, switchMap } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { Firestore } from "@angular/fire/firestore";
import { AngularFirestore } from "@angular/fire/compat/firestore";

const colorPalette = ['#10439F', '#874CCC', '#C65BCF', '#F27BBD'];

const post1 = new Post(
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    "John Doe",
    new Date("2024-04-23T12:00:00Z")
);
const post2 = new Post(
    "Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    "Jane Smith",
    new Date("2024-04-22T08:30:00Z")
);
const post3 = new Post(
    "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
    "Alice Johnson",
    new Date("2024-04-21T15:45:00Z")
);

@Injectable()
export class ClassService {

    private selectedClass = new BehaviorSubject<Class | null>(null);
    postsChanged = new EventEmitter<Post[]>();
    private classes = [];
    // private classes: Class[] = [
    //     new Class('0', 'Mathematics', 'Introduction to Algebra', 'John Doe', colorPalette[0], 25, [post1, post2]),
    //     new Class('1', 'Physics', 'Fundamentals of Mechanics', 'Jane Smith', colorPalette[1], 30, [post3]),
    //     new Class('2', 'Chemistry', 'Organic Chemistry Basics', 'Alice Johnson', colorPalette[2], 20, [post1, post2, post3]),
    //     new Class('3', 'Biology', 'Marine Biology', 'Bob Brown', colorPalette[3], 22, [post2, post3]),
    //     new Class('4', 'History', 'World History Overview', 'Charlie Davis', colorPalette[0], 18, [post1]),
    //     new Class('5', 'Geography', 'Geographical Mapping Techniques', 'Daisy Evans', colorPalette[1], 15, [post3]),
    //     new Class('6', 'English', 'Advanced English Literature', 'Ethan Ford', colorPalette[2], 28, [post1, post2]),
    //     new Class('7', 'Art', 'Modern Art & Techniques', 'Grace Hill', colorPalette[3], 23, [post2, post3])
    // ];
    private classesSubject = new BehaviorSubject<Class[]>([]);
    classes$ = this.classesSubject.asObservable();
    
    constructor(private http: HttpClient, private firestore: AngularFirestore){
        
    }

    getClassById(id: string){
        console.log(id);
        return this.classes.find(cls => cls.id === id);
    }

    getClasses() {
        return this.classes;
    }

    fetchClasses() {
        return this.firestore.collection('classes').snapshotChanges()
            .pipe(
                map(actions => {
                return actions.map(action => {
                    const data = action.payload.doc.data() as Class;
                    const id = action.payload.doc.id;
                    this.classes.push({ id, ...data });
                    return { id, ...data };
                });
                })
            );
    }

    storeClasses(){
        this.classes.forEach(cls => {
            const postsData = cls.posts.map(post => ({ content: post.content, publisher: post.publisher, createdDate: post.createdDate }));
            const classData = {
                id: cls.id,
                title: cls.title,
                subTitle: cls.subTitle,
                owner: cls.owner,
                imagePath: cls.imagePath,
                members: cls.members,
                posts: postsData
            };
            this.firestore.collection('classes').add(classData);
        });
    }

    loadPosts(classId: string){
        return this.http
        .get<any[]>(`https://studentology-82364-default-rtdb.europe-west1.firebasedatabase.app/classes/${classId}/posts.json`)
        .pipe(
            map(response => {
            return response.map(item => new Post(item.content, item.publisher, new Date(item.createdDate)));
            })
        );
    }

    // addPost(classId: string, post: Post) {
    //     const postIndex = this.classes[classId].posts.length;
    //     console.log('index:',postIndex);
    //     return this.http
    //         .put(`https://studentology-82364-default-rtdb.europe-west1.firebasedatabase.app/classes/${classId}/posts/${postIndex}`, post)
    //         .subscribe(response => {
    //             console.log(response);
    //         });
    // }

    addPost(classId: string, post: Post) {
        this.getPosts(classId).subscribe(posts => {
            const updatedPosts = [...posts, post];
            this.http.put(`https://studentology-82364-default-rtdb.europe-west1.firebasedatabase.app/classes/${classId}/posts.json`, updatedPosts)
            .subscribe(response => {
                console.log('Post added successfully:', response);
                this.postsChanged.emit(updatedPosts);
            }, error => {
                console.error('Error adding post:', error);
            });
        });

    }

    private getPosts(classId: string) {
    return this.http.get<Post[]>(`https://studentology-82364-default-rtdb.europe-west1.firebasedatabase.app/classes/${classId}/posts.json`)
        .pipe(
        map(posts => posts ? Object.values(posts) : [])
        );
    }
}