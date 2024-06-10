import { Component, OnInit } from '@angular/core';
import { Class } from '../../interfaces/class.interface';
import { ClassService } from '../../services/class.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AuthService } from '../../services/auth.service';
import { User } from '../../interfaces/user.interface';
import { MatDialog } from '@angular/material/dialog';
import { DialogService } from '../../services/dialog.service';
import { EditNameDialogComponent } from '../../popups/edit-name-dialog/edit-name-dialog.component';

const colorPalette = ['#10439F', '#874CCC', '#C65BCF', '#F27BBD'];

@Component({
  selector: 'app-class-list',
  templateUrl: './class-list.component.html',
  styleUrl: './class-list.component.scss'
})
export class ClassListComponent implements OnInit{
  classList: Class[];
  classesSubscription: Subscription;
  signedInUser: User;


  constructor(
    private classService: ClassService,
    private router: Router,
    private authService: AuthService,
    private dialog: MatDialog,
    private dialogService: DialogService
  ) {

  }

  ngOnInit() {
    this.classesSubscription = this.classService.getClasses().subscribe(classes => {
      this.classList = classes;
    });
    this.signedInUser = this.authService.getSignedInUser();
  }

  navigateToClass(classItem: Class){
    console.log('passed class to classItem: ',classItem);
    this.router.navigate(['home/classView/' + classItem.id]);
  }

  openJoinClassDialog(): void {
    const dialogRef = this.dialog.open(EditNameDialogComponent, {
      width: '400px',
      data: { title: 'Enter Class Code', name: '' }
    });

    dialogRef.afterClosed().subscribe(classCode => {
      if (classCode) {
        this.joinClass(classCode);
      }
    });
  }

  joinClass(classCode: string): void {
    this.classService.findClassByCode(classCode).subscribe(classData => {
      if (classData) {
        this.classService.addMemberToClass(classData.id, this.signedInUser.id).subscribe(() => {
          this.dialogService.showInfoDialog('Success', 'Successfully joined the class. Waiting for owner to accept.');
        }, error => {
          this.dialogService.showInfoDialog('Error', `Failed to join class: ${error.message}`);
        });
      } else {
        this.dialogService.showInfoDialog('Error', 'Class not found.');
      }
    }, error => {
      this.dialogService.showInfoDialog('Error', `Error searching for class: ${error.message}`);
    });
  }

  ngOnDestroy(){
    this.classesSubscription.unsubscribe();
  }

}
