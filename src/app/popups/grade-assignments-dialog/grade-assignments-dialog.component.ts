import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AssignmentService } from '../../services/assignment.service';
import { UserService } from '../../services/user.service';
import { combineLatest } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-grade-assignments-dialog',
  templateUrl: './grade-assignments-dialog.component.html',
  styleUrls: ['./grade-assignments-dialog.component.scss']
})
export class GradeAssignmentsDialogComponent {
  submissions: any[] = [];
  grades = Array.from({ length: 10 }, (_, i) => i + 1);

  constructor(
    public dialogRef: MatDialogRef<GradeAssignmentsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { assignmentId: string },
    private assignmentService: AssignmentService,
    private userService: UserService
  ) {
    this.fetchSubmissions();
  }

  fetchSubmissions() {
    this.assignmentService.getSubmissions(this.data.assignmentId).pipe(
      switchMap(submissions => {
        const submissionObservables = submissions.map(submission => {
          return this.userService.getUserById(submission.studentId).pipe(
            map(user => ({
              ...submission,
              studentName: user.username,
              studentEmail: user.email
            }))
          );
        });
        return combineLatest(submissionObservables);
      })
    ).subscribe(result => {
      this.submissions = result;
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    this.submissions.forEach(submission => {
      this.assignmentService.updateSubmissionGrade(this.data.assignmentId, submission.id, submission.grade);
    });
    this.dialogRef.close();
  }
}
