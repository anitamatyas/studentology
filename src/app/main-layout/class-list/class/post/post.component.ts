import { Component, Input, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Post, PostComment } from '../../../../interfaces/post.interface';
import { User } from '../../../../interfaces/user.interface';
import { UserService } from '../../../../services/user.service';
import { Timestamp } from 'firebase/firestore';
import { PostService } from '../../../../services/post.service';

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

  constructor(private userService: UserService, private postService: PostService) {}

  ngOnInit() {
    this.publisher$ = this.userService.getUserById(this.post.publisherId);
    this.commentsOnPost$ = this.postService.getComments(this.post.id);
    console.log(this.post.id);
    this.commentsOnPost$.subscribe(comments => {
      console.log(comments);
    })
  }

  addComment(postId: string) {
    // if (this.newCommentText) {
    //   const comment: PostComment = {
    //     id: '',
    //     content: this.newCommentText,
    //     userId: 'currentUserId'
    //   };
    //   this.postService.addComment(postId, comment).then(() => {
    //     this.newCommentText = '';
    //   });
    // }
  }

  deleteComment(postId: string, commentId: string) {
    //this.postService.deleteComment(postId, commentId).catch(error => console.error('Error deleting comment:', error));
  }
}
