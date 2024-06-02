import { Injectable } from "@angular/core";
import { AngularFirestore } from "@angular/fire/compat/firestore";
import { Observable, Subject } from "rxjs";
import { map } from "rxjs/operators";
import { PostComment, Post } from "../interfaces/post.interface";
import { convertSnaps } from "./db-utils";
import { Timestamp } from "@angular/fire/firestore";
import { User } from "../interfaces/user.interface";

@Injectable({ providedIn: 'root' })
export class PostService {
    postsChangedSubject = new Subject<Post>();

    constructor(private firestore: AngularFirestore) { }

    getPosts(classId: string): Observable<Post[]> {
        return this.firestore
            .collection('posts', ref => ref.where('classId', '==', classId))
            .snapshotChanges()
            .pipe(
                map(result => convertSnaps<Post>(result)))
    }

    addPost(classId: string, content: string, publisherId: string) {
        const postRef = this.firestore.collection<Post>('posts').doc();
        const postId = postRef.ref.id;
        const nowInSeconds = Math.ceil(Date.now() / 1000);
        const newTimestamp = new Timestamp(nowInSeconds, 0);
        const newPost: Post = {
            id: postId,
            classId,
            content,
            publisherId,
            createdDate: newTimestamp
        };

        postRef.set(newPost)
            .then(() => {
                this.postsChangedSubject.next(newPost);
            })
            .catch(error => {
                console.error('Error adding post:', error);
            });
    }

    addComment(userId: string,postId: string, commentText: string){
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
