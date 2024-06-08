import { Component, Input, OnInit } from '@angular/core';
import { Observable, combineLatest, map, of, switchMap } from 'rxjs';
import { Post, PostComment } from '../../../../interfaces/post.interface';
import { User } from '../../../../interfaces/user.interface';
import { UserService } from '../../../../services/user.service';
import { Timestamp } from 'firebase/firestore';
import { PostService } from '../../../../services/post.service';
import { AuthService } from '../../../../services/auth.service';

@Component({
  selector: 'app-post',
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.scss'],
})
export class PostComponent implements OnInit {
  @Input() post: Post;
  publisher$: Observable<User>;
  commentsOnPost$: Observable<PostComment[]>;
  newCommentText: string = '';
  loggedInUser: User;

  constructor(private userService: UserService, private postService: PostService, private authService: AuthService) {}

  ngOnInit() {
    this.publisher$ = this.userService.getUserById(this.post.publisherId);
    this.commentsOnPost$ = this.postService.getComments(this.post.id);
    this.commentsOnPost$ = this.postService.getComments(this.post.id).pipe(
      switchMap(comments => {
        if (comments.length === 0) return of([]);
        const commentsWithUsers$ = comments.map(comment =>
          this.userService.getUserById(comment.userId).pipe(
            map(user => ({
              ...comment,
              user
            }))
          )
        );
        return combineLatest(commentsWithUsers$);
      })
    );
    this.loggedInUser = this.authService.getSignedInUser();
    console.log(this.post.attachments);
  }

  addComment(postId: string) {
    if (this.newCommentText) {
      this.postService.addComment(this.loggedInUser.id, postId, this.newCommentText).then(() => {
        this.newCommentText = '';
      });
    }
  }

  deleteComment(postId: string, commentId: string) {
    //this.postService.deleteComment(postId, commentId).catch(error => console.error('Error deleting comment:', error));
  }
}
