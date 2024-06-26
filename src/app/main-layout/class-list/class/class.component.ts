import { Component, OnDestroy, OnInit } from '@angular/core';
import { Class, Group, Member } from '../../../interfaces/class.interface';
import { ClassService } from '../../../services/class.service';
import { ActivatedRoute } from '@angular/router';
import { Post } from '../../../interfaces/post.interface';
import { Observable, Subscription, switchMap, take, tap } from 'rxjs';
import { PostService } from '../../../services/post.service';
import { AuthService } from '../../../services/auth.service';
import { User } from '../../../interfaces/user.interface';
import { UserService } from '../../../services/user.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { CreateTestDialogComponent } from '../../../popups/create-test-dialog/create-test-dialog.component';
import { AddMemberDialogComponent } from '../../../popups/add-member-dialog/add-member-dialog.component';
import { DialogService } from '../../../services/dialog.service';
import { EditNameDialogComponent } from '../../../popups/edit-name-dialog/edit-name-dialog.component';
import { Assignment, Test } from '../../../interfaces/test.interface';
import { Timestamp } from '@angular/fire/firestore';
import { Note } from '../../../interfaces/notes.interface';

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
  userSubscription: Subscription;
  isTeacherInClass: boolean = false;
  classMembers: Member[] = [];
  classMembersAsUsers: User[] = [];
  classMemberSubscription: Subscription;
  displayedColumns: string[] = ['profile'];
  dataSource: MatTableDataSource<Member>;
  classOwner: User;
  groups: Group[] = [];
  groupedMembers: { [groupId: string]: Member[] } = {};
  attachedFiles: File[] = [];
  noteContent: string = '';
  isEditing: boolean = false;
  noteSubscription: Subscription;
  noteId: string;

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

    this.userSubscription = this.authService.getSignedInUserObservable().subscribe( user => {
      this.user = user;
    })

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

    this.noteSubscription = this.classService.getNoteForClassAndUser(this.selectedClassId, this.user.id)
      .subscribe(note => {
        if (note) {
          this.noteContent = note.content;
          this.noteId = note.id;
        }
      });
  }

  editNote() {
    this.isEditing = true;
  }

  saveNote() {
    this.isEditing = false;
    const noteData: Note = {
      classId: this.selectedClassId,
      userId: this.user.id,
      content: this.noteContent
    };

    if (this.noteId) {
      this.classService.updateNote(this.noteId, noteData).then(() => {
        console.log('Note updated successfully');
      }).catch(error => {
        console.error('Failed to update note:', error);
      });
    } else {
      this.classService.saveNote(noteData).then(() => {
        console.log('Note saved successfully');
      }).catch(error => {
        console.error('Failed to save note:', error);
      });
    }
  }

  onSubmit() {
    if (this.postText) {
      const formattedText = this.formatText(this.postText);
      if (this.attachedFiles.length > 0) {
        this.postService.uploadAttachments(this.attachedFiles).subscribe((attachmentUrls) => {
          const attachments = this.attachedFiles.map((file, index) => ({
            name: file.name,
            url: attachmentUrls[index]
          }));
          this.postService.addPost(this.selectedClassId, formattedText, this.user.id, attachments);
          this.postText = '';
          this.attachedFiles = [];
        });
      } else {
        this.postService.addPost(this.selectedClassId, formattedText, this.user.id, []);
        this.postText = '';
      }
    }
  }

  handleFileInput(event: any) {
    const files = event.target.files;
    for (let file of files) {
      this.attachedFiles.push(file);
    }
  }

  formatText(text: string) {
    const formattedText = text.replace(/\n/g, '<br>');
    return formattedText;
  }

  openCreateTestDialog(): void {
    const dialogRef = this.dialog.open(CreateTestDialogComponent, {
      width: '80%',
      height: '90%',
      data: {}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {

        const questions = result.questions.map((q: any) => ({
          question: q.question,
          points: q.points,
          answers: q.answers.map((a: any) => ({
            answer: a.answer,
            correct: a.correct
          }))
        }));

        const createdDate = new Timestamp(Math.floor(Date.now() / 1000), 0)

        const newTest: Test = {
          classId: this.selectedClassId,
          createdBy: this.user.id,
          isForGroup: result.isForGroup,
          groupId: result.isForGroup ? result.groupId : null,
          testContent: JSON.stringify({ title: result.title, questions }),
          isGraded: false,
          dueDate: result.dueDate,
          createdDate: createdDate
        };
        this.classService.addTest(newTest).then(() => {
          this.dialogService.showInfoDialog('Success', 'Test created successfully');
        }).catch(error => {
          this.dialogService.showInfoDialog('Error', `Failed to create test: ${error.message}`);
        });
      }
    });
  }

  openCreateAssignmentDialog(): void {
    const dialogRef = this.dialog.open(CreateTestDialogComponent, {
      width: '80%',
      height: '90%',
      data: { isAssignment: true }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const newAssignment : Assignment = {
          classId: this.selectedClassId,
          createdBy: this.user.id,
          createdDate: new Timestamp(Math.floor(Date.now() / 1000), 0),
          dueDate: result.dueDate,
          groupId: result.isForGroup ? result.groupId : null,
          isForGroup: result.isForGroup,
          isGraded: false,
          title: result.title,
          description: result.description
        };

        console.log(result);

        this.classService.addAssignment(newAssignment).then(() => {
          this.dialogService.showInfoDialog('Success', 'Assignment created successfully');
        }).catch(error => {
          this.dialogService.showInfoDialog('Error', `Failed to create assignment: ${error.message}`);
        });
      }
    });
  }

  openAddMemberDialog(groupId: string) {
    const dialogRef = this.dialog.open(AddMemberDialogComponent, {
      width: '400px',
      data: { groupId: groupId, classId: this.selectedClassId }
    });

    dialogRef.afterClosed().subscribe(userId => {
      if (userId) {
        this.classService.addMemberToClassAndGroup(this.selectedClassId, userId, groupId).pipe(take(1)).subscribe({
          next: () => {
            this.dialogService.showInfoDialog('Success', 'Member successfully added to the class.');
          },
          error: (error) => {
            this.dialogService.showInfoDialog('Error', error.message);
          }
        });
      }
    });
  }

  openEditNameDialog(title: string, currentName: string, callback: (newName: string) => void): void {
    const dialogRef = this.dialog.open(EditNameDialogComponent, {
      width: '400px',
      data: { title: title, name: currentName }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        callback(result);
      }
    });
  }

  openEditGroupNameDialog(groupId: string, currentGroupName: string): void {
    this.openEditNameDialog('Edit Group Name', currentGroupName, (newName: string) => {
      this.classService.updateGroupName(this.selectedClassId, groupId, newName);
    });
  }

  openEditClassNameDialog(currentClassTitle: string): void {
    this.openEditNameDialog('Edit Class Title', currentClassTitle, (newTitle: string) => {
      this.classService.updateClassTitle(this.selectedClassId, newTitle);
    });
  }

  openNewGroupDialog() {
    this.openEditNameDialog('Name of the new Group', 'New Group', (newName: string) => {
      this.classService.addNewGroup(this.selectedClassId, newName).then(() => {
        this.dialogService.showInfoDialog('Success', 'Group added successfully');
      }).catch(error => {
        this.dialogService.showInfoDialog('Error', `Failed to add group: ${error.message}`);
      });
    });
  }

  groupMembersByGroup() {
    this.groupedMembers = this.groups.reduce((acc, group) => {
      acc[group.id] = [];
      return acc;
    }, { 'ungrouped': [] });

    this.classMembers.forEach(member => {
      const groupId = member.groupId || 'ungrouped';
      if (!this.groupedMembers[groupId]) {
        this.groupedMembers[groupId] = [];
      }
      this.groupedMembers[groupId].push(member);
    });
  }

  getGroupName(groupId: string): string {
    if (groupId === 'ungrouped') return 'Ungrouped members';
    const group = this.groups.find(group => group.id === groupId);
    return group ? group.title : 'Unknown Group';
  }

  getGroupIds(): string[] {
    return Object.keys(this.groupedMembers);
  }

  getUserRoleInClass(userId: string): string {
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

  deleteGroup(groupId: string) {
    const groupMembers = this.classMembers.filter(member => member.groupId === groupId);
    const ungroupPromises = groupMembers.map(member => this.classService.ungroupMember(member.id, this.selectedClassId));
    Promise.all(ungroupPromises)
      .then(() => this.classService.deleteGroup(this.selectedClassId, groupId))
      .then(() => {
        this.dialogService.showInfoDialog('Success', 'Group successfully deleted.');
      })
      .catch(error => {
        this.dialogService.showInfoDialog('Error', `Failed to delete group: ${error.message}`);
      });
  }

  getBackgroundColor(imagePath: string): string {
    const styles = getComputedStyle(document.documentElement);
    switch(imagePath) {
      case 'primary':
        return styles.getPropertyValue('--primary').trim();
      case 'secondary':
        return styles.getPropertyValue('--secondary').trim();
      case 'tertiary':
        return styles.getPropertyValue('--tertiary').trim();
      default:
        return '#fff';
    }
  }

  makeTeacher(member: Member) {
    const updatedMember: Member = { ...member, memberRole: 'teacher' };
    this.classService.updateMemberRole(this.selectedClassId, member.id, updatedMember).then(() => {
      this.dialogService.showInfoDialog('Success', 'Member role updated to teacher.');
      const memberIndex = this.classMembers.findIndex(m => m.id === member.id);
      if (memberIndex !== -1) {
        this.classMembers[memberIndex].memberRole = 'teacher';
        this.groupMembersByGroup();
      }
    }).catch(error => {
      this.dialogService.showInfoDialog('Error', `Failed to update member role: ${error.message}`);
    });
  }

  ngOnDestroy() {
    if (this.postsSubscription) this.postsSubscription.unsubscribe();
    if (this.classMemberSubscription) this.classMemberSubscription.unsubscribe();
    if (this.selectedClassSubscription) this.selectedClassSubscription.unsubscribe();
    if (this.noteSubscription) this.noteSubscription.unsubscribe();
  }
}