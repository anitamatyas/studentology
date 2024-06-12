import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { ClassService } from '../../services/class.service';
import { Subscription, combineLatest, of } from 'rxjs';
import { switchMap, map, catchError, take } from 'rxjs/operators';
import { User } from '../../interfaces/user.interface';
import { DialogService } from '../../services/dialog.service';
import { Router } from '@angular/router';
import { Assignment } from '../../interfaces/test.interface';
import { AssignmentService } from '../../services/assignment.service';

@Component({
  selector: 'app-assignments',
  templateUrl: './assignments.component.html',
  styleUrls: ['./assignments.component.scss']
})
export class AssignmentsComponent implements OnInit, OnDestroy {
  assignments: { assignment: Assignment, classTitle: string, isTeacher: boolean, submitted: boolean, grade?: number }[] = [];
  userSubscription: Subscription;
  loggedInUser: User;
  currentDate: Date = new Date();

  constructor(
    private authService: AuthService,
    private classService: ClassService,
    private assignmentService: AssignmentService,
    private dialogService: DialogService,
    private router: Router
  ) { }

  ngOnInit() {
    this.userSubscription = this.authService.getSignedInUserObservable().pipe(
      switchMap(user => {
        this.loggedInUser = user;
        return this.classService.getClassesForUser(user.id);
      }),
      switchMap(classes => {
        const classIds = classes.map(cls => cls.id);
        const classTitles = classes.reduce((acc, cls) => {
          acc[cls.id] = cls.title;
          return acc;
        }, {});
        return this.assignmentService.getAssignmentsForClasses(classIds).pipe(
          switchMap(assignments => {
            const assignmentObservables = assignments.map(assignment => {
              return this.classService.getMemberRoleByUserIdAndClassId(this.loggedInUser.id, assignment.classId).pipe(
                switchMap(role => {
                  return this.assignmentService.getSubmissions(assignment.id).pipe(
                    map(submissions => {
                      const submission = submissions.find(sub => sub.studentId === this.loggedInUser.id);
                      const submitted = !!submission;
                      const grade = submission ? submission.grade : undefined;
                      return {
                        assignment,
                        classTitle: classTitles[assignment.classId],
                        isTeacher: role === 'teacher',
                        submitted,
                        grade
                      };
                    })
                  );
                })
              );
            });
            return combineLatest(assignmentObservables);
          }),
          catchError(error => {
            console.error('Failed to fetch assignments or roles:', error);
            return of([]);
          })
        );
      })
    ).subscribe(assignments => {
      this.assignments = assignments;
      console.log(assignments);
    });
  }

  ngOnDestroy() {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }
}
