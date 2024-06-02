import { Component, OnDestroy, OnInit } from '@angular/core';
import { Class, Member } from '../../../interfaces/class.interface';
import { ClassService } from '../../../services/class.service';
import { ActivatedRoute } from '@angular/router';
import { Post } from '../../../interfaces/post.interface';
import { Subscription, take, tap } from 'rxjs';
import { PostService } from '../../../services/post.service';
import { AuthService } from '../../../services/auth.service';
import { User } from '../../../interfaces/user.interface';
import { UserService } from '../../../services/user.service';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-class',
  templateUrl: './class.component.html',
  styleUrls: ['./class.component.scss'],
})
export class ClassComponent  implements OnInit, OnDestroy {
  posts: Post[] = [];
  selectedClassId: string;
  selectedClass: Class;
  selectedClassSubscription: Subscription;
  postText: string = '';
  postsSubscription: Subscription;
  user: User;
  classMembers: Member[] = [];
  classMembersAsUsers: User[] = [];
  classMemberSubscription: Subscription;
  displayedColumns: string[] = ['profile', 'memberRole'];
  dataSource: MatTableDataSource<Member>;
  classOwner: User;

  constructor(
    private classService: ClassService,
    private postService: PostService,
    private route: ActivatedRoute,
    private authService: AuthService,
    private userService: UserService
  ) {}

  ngOnInit() {
    this.selectedClassId = this.route.snapshot.paramMap.get('id');
    this.selectedClassSubscription = this.classService.getClassById(this.selectedClassId).subscribe(cls => {
      this.selectedClass = cls;
      this.userService.getUserById(cls.owner).pipe(
        take(1),
        tap(owner => {
            this.classOwner = owner;
        })
      ).subscribe();
    });
    this.postsSubscription = this.postService.getPosts(this.selectedClassId).subscribe(posts => {
      this.posts = posts;
    });
    this.user = this.authService.getSignedInUser();
    this.classMemberSubscription = this.classService.getClassMembers(this.selectedClassId).subscribe(members => {
      this.classMembers = members;
      this.classMembers.forEach(member => {
        this.userService.getUserById(member.userId).subscribe(user => {
          member.users = [user];
          this.dataSource = new MatTableDataSource(this.classMembers.sort((a, b) => b.memberRole.localeCompare(a.memberRole)));
        });
      });
    })
  }

  onSubmit() {
    if (this.postText) {
      const formattedText = this.formatText(this.postText);
      this.postService.addPost(this.selectedClassId, formattedText, this.user.id);
      console.log(this.postText);
      this.postText = '';
    }
  }

  formatText(text: string) {
    const formattedText = text.replace(/\n/g, '<br>');
    return formattedText;
  }

  ngOnDestroy() {
    if (this.postsSubscription) this.postsSubscription.unsubscribe();
  }
}