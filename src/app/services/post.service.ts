import { Injectable } from "@angular/core";
import { AngularFirestore } from "@angular/fire/compat/firestore";
import { Observable, Subject, forkJoin, from } from "rxjs";
import { map, switchMap } from "rxjs/operators";
import { PostComment, Post } from "../interfaces/post.interface";
import { convertSnaps } from "./db-utils";
import { Timestamp } from "@angular/fire/firestore";
import { AngularFireStorage } from "@angular/fire/compat/storage";

@Injectable({ providedIn: 'root' })
export class PostService {
    postsChangedSubject = new Subject<Post>();

    constructor(private firestore: AngularFirestore, private storage: AngularFireStorage) { }

    getPosts(classId: string): Observable<Post[]> {
        return this.firestore
            .collection('posts', ref => ref.where('classId', '==', classId).orderBy('createdDate', 'asc'))
            .snapshotChanges()
            .pipe(
                map(result => convertSnaps<Post>(result)))
    }

    addPost(classId: string, content: string, publisherId: string, attachments: { name: string, url: string }[]) {
        const postRef = this.firestore.collection<Post>('posts').doc();
        const postId = postRef.ref.id;
        const nowInSeconds = Math.ceil(Date.now() / 1000);
        const newTimestamp = new Timestamp(nowInSeconds, 0);
        const newPost: Post = {
            id: postId,
            classId,
            content,
            publisherId,
            createdDate: newTimestamp,
            attachments: attachments // Add attachments here
        };

        postRef.set(newPost)
            .then(() => {
                this.postsChangedSubject.next(newPost);
            })
            .catch(error => {
                console.error('Error adding post:', error);
            });
    }

    uploadAttachments(files: File[]): Observable<string[]> {
        const uploadTasks: Observable<string>[] = [];

        files.forEach(file => {
            const filePath = `attachments/${Date.now()}_${file.name}`;
            const fileRef = this.storage.ref(filePath);
            const uploadTask = from(this.storage.upload(filePath, file)).pipe(
                switchMap(() => fileRef.getDownloadURL())
            );
            uploadTasks.push(uploadTask);
        });

        return forkJoin(uploadTasks);
    }

    addComment(userId: string, postId: string, commentText: string) {
        const commentRef = this.firestore.collection(`posts/${postId}/comments`).doc();
        const commentId = commentRef.ref.id;
        const nowInSeconds = Math.ceil(Date.now() / 1000);
        const newTimestamp = new Timestamp(nowInSeconds, 0);
        const newComment: PostComment = {
            id: commentId,
            userId,
            content: commentText,
            commentedDate: newTimestamp,
        };

        return commentRef.set(newComment);
    }

    getComments(postId: string): Observable<PostComment[]> {
        return this.firestore
            .collection('posts')
            .doc(postId)
            .collection<PostComment>('comments', ref => ref.orderBy('commentedDate'))
            .snapshotChanges()
            .pipe(
                map(actions =>
                    actions.map(a => {
                        const data = a.payload.doc.data() as PostComment;
                        const id = a.payload.doc.id;
                        return { commentId: id, ...data };
                    })
                )
            );
    }
}
