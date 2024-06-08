import { Component, OnDestroy, OnInit } from '@angular/core';
import { Class, Group, Member } from '../../../interfaces/class.interface';
import { ClassService } from '../../../services/class.service';
import { ActivatedRoute } from '@angular/router';
import { Post } from '../../../interfaces/post.interface';
import { Subscription, switchMap, take, tap } from 'rxjs';
import { PostService } from '../../../services/post.service';
import { AuthService } from '../../../services/auth.service';
import { User } from '../../../interfaces/user.interface';
import { UserService } from '../../../services/user.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { CreateTestDialogComponent } from '../../../popups/create-test-dialog/create-test-dialog.component';
import { AddMemberDialogComponent } from '../../../popups/add-member-dialog/add-member-dialog.component';
import { DialogService } from '../../../services/dialog.service';

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
  isTeacherInClass: boolean = false;
  classMembers: Member[] = [];
  classMembersAsUsers: User[] = [];
  classMemberSubscription: Subscription;
  displayedColumns: string[] = ['profile'];
  dataSource: MatTableDataSource<Member>;
  classOwner: User;
  groups: Group[] = [];
  groupedMembers: { [groupId: string]: Member[] } = {};

  constructor(
    private classService: ClassService,
    private postService: PostService,
    private route: ActivatedRoute,
    private authService: AuthService,
    private userService: UserService,
    public dialog: MatDialog,
    private dialogService: DialogService
  ) {}

  ngOnInit() {
    this.selectedClassId = this.route.snapshot.paramMap.get('id');

    // Fetch class details
    this.selectedClassSubscription = this.classService.getClassById(this.selectedClassId).subscribe(cls => {
      this.selectedClass = cls;
      this.userService.getUserById(cls.owner).pipe(
        take(1),
        tap(owner => {
            this.classOwner = owner;
        })
      ).subscribe();
    });

    // Fetch posts
    this.postsSubscription = this.postService.getPosts(this.selectedClassId).subscribe(posts => {
      this.posts = posts;
    });

    // Get the signed-in user
    this.user = this.authService.getSignedInUser();

    // Fetch class members with user details and groups
    this.classMemberSubscription = this.classService.getClassMembersWithUserDetails(this.selectedClassId).pipe(
      switchMap(members => {
        this.classMembers = members;
        return this.classService.getGroups(this.selectedClassId);
      })
    ).subscribe(groups => {
      this.groups = groups;
      this.groupMembersByGroup();
      this.isTeacherInClass = this.getUserRoleInClass(this.user.id) === 'teacher';
      this.updateDisplayedColumns();
    });
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

  openCreateTestDialog(): void {
    const dialogRef = this.dialog.open(CreateTestDialogComponent, {
      width: '50%',
      height: '70%',
      data: {}
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      console.log('Test created:', result);
      // db save
    });
  }

  openAddMemberDialog(groupId: string) {
    this.dialog.open(AddMemberDialogComponent, {
      width: '400px',
      data: { groupId: groupId, classId: this.selectedClassId }
    });
  }

  groupMembersByGroup() {
    this.groupedMembers = this.classMembers.reduce((acc, member) => {
      const groupId = member.groupId || 'ungrouped';
      acc[groupId] = acc[groupId] || [];
      acc[groupId].push(member);
      return acc;
    }, {});
  }

  getGroupName(groupId: string): string {
    if (groupId === 'ungrouped') return 'Ungrouped Members';
    const group = this.groups.find(group => group.id === groupId);
    return group ? group.title : 'Unknown Group';
  }

  getGroupIds(): string[] {
    return Object.keys(this.groupedMembers);
  }

  getUserRoleInClass(userId: string): string {
    console.log(userId);
    console.log(this.classMembers);
    const member = this.classMembers.find(m => m.userId === userId);
    return member ? member.memberRole : 'Not in class';
  }

  private updateDisplayedColumns(){
    if (this.isTeacherInClass && this.displayedColumns.length === 1) {
      this.displayedColumns.push('memberRole');
    }
  }

  ungroupMember(member: Member) {
    this.classService.ungroupMember(member.id, this.selectedClass.id).then(() => {
      this.dialogService.showInfoDialog('Success', 'Member successfully ungrouped.');
    }).catch(error => {
      this.dialogService.showInfoDialog('Error', `Failed to ungroup member: ${error.message}`);
    });
  }

  deleteMemberFromClass(member: Member) {
    this.classService.deleteMemberFromClass(member.id, this.selectedClass.id).then(() => {
      this.dialogService.showInfoDialog('Success', 'Member successfully deleted from class.');
    }).catch(error => {
      this.dialogService.showInfoDialog('Error', `Failed to delete member: ${error.message}`);
    });
  }

  ngOnDestroy() {
    if (this.postsSubscription) this.postsSubscription.unsubscribe();
    if (this.classMemberSubscription) this.classMemberSubscription.unsubscribe();
    if (this.selectedClassSubscription) this.selectedClassSubscription.unsubscribe();
  }
}