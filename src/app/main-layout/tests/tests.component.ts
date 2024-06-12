import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { ClassService } from '../../services/class.service';
import { TestService } from '../../services/test.service';
import { Subscription, combineLatest, of } from 'rxjs';
import { switchMap, map, catchError, take } from 'rxjs/operators';
import { Test, TestContent, Submission } from '../../interfaces/test.interface';
import { User } from '../../interfaces/user.interface';
import { DialogService } from '../../services/dialog.service';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { GradesDialogComponent } from '../../popups/grades-dialog/grades-dialog.component';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-tests',
  templateUrl: './tests.component.html',
  styleUrls: ['./tests.component.scss']
})
export class TestsComponent implements OnInit, OnDestroy {
  tests: { test: Test, classTitle: string, isTeacher: boolean, submitted: boolean }[] = [];
  userSubscription: Subscription;
  loggedInUser: User;
  currentDate: Date = new Date();

  constructor(
    private authService: AuthService,
    private classService: ClassService,
    private testService: TestService,
    private dialogService: DialogService,
    private router: Router,
    private dialog: MatDialog,
    private userService: UserService
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
        return this.testService.getTestsForClasses(classIds).pipe(
          switchMap(tests => {
            const testObservables = tests.map(test => {
              const parsedTestContent: TestContent = JSON.parse(test.testContent);
              return this.classService.getMemberRoleByUserIdAndClassId(this.loggedInUser.id, test.classId).pipe(
                switchMap(role => {
                  return this.testService.getSubmissions(test.id).pipe(
                    map(submissions => {
                      const submission = submissions.find(sub => sub.studentId === this.loggedInUser.id);
                      const submitted = !!submission;
                      const grade = submission ? submission.grade : undefined;
                      return {
                        test: { ...test, parsedTestContent },
                        classTitle: classTitles[test.classId],
                        isTeacher: role === 'teacher',
                        submitted: submitted,
                        grade: grade
                      };
                    })
                  );
                })
              );
            });
            return combineLatest(testObservables);
          }),
          catchError(error => {
            console.error('Failed to fetch tests or roles:', error);
            return of([]);
          })
        );
      })
    ).subscribe(tests => {
      this.tests = tests;
      console.log(tests);
    });
  }

  solveTest(test: Test) {
    const now = new Date();
    const dueDate = test.dueDate.toDate();
    if (now > dueDate) {
      this.dialogService.showInfoDialog('Error', 'The due date has passed. You cannot solve this test.');
      return;
    }
    this.router.navigate(['home/solve-test', test.id]);
  }

  gradeTest(test: Test) {
    this.testService.getSubmissions(test.id).pipe(take(1)).subscribe(submissions => {
      if (submissions.length > 0) {
        const submission = submissions[0];
        const submissionContent = JSON.parse(submission.submissionContent);
        const testContent = JSON.parse(test.testContent);
        const grade = this.calculateGrade(testContent, submissionContent);
        submission.grade = grade;
        this.testService.updateSubmission(test.id, submission).subscribe(() => {
          console.log('Submission graded:', submission);
        });

        test.isGraded = true;
        this.testService.updateTest(test.id, { isGraded: true }).subscribe(() => {
          console.log('Test marked as graded');
        });
      }
    });
  }

  openGradesDialog(test: Test) {
    this.testService.getSubmissions(test.id).pipe(
      switchMap(submissions => {
        if (submissions.length > 0) {
          const userObservables = submissions.map(submission =>
            this.userService.getUserById(submission.studentId).pipe(
              map(user => ({
                studentName: user.username,
                studentEmail: user.email,
                grade: submission.grade
              }))
            )
          );
          return combineLatest(userObservables);
        } else {
          return of([]);
        }
      })
    ).subscribe(userDetails => {
      this.dialog.open(GradesDialogComponent, {
        width: '600px',
        data: { userDetails }
      });
    });
  }

  calculateGrade(testContent: any, submissionContent: any): number {
    let totalPoints = 0;
    let earnedPoints = 0;

    testContent.questions.forEach((question, qIndex) => {
      totalPoints += question.points;
      const correctAnswersCount = question.answers.filter(a => a.correct).length;

      question.answers.forEach((answer, aIndex) => {
        if (answer.correct && submissionContent.questions[qIndex].answers[aIndex].checked) {
          earnedPoints += question.points / correctAnswersCount;
        }
      });
    });

    return (earnedPoints / totalPoints) * 10;
  }

  ngOnDestroy() {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }
}
