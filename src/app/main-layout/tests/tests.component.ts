import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { ClassService } from '../../services/class.service';
import { TestService } from '../../services/test.service';
import { Subscription, combineLatest, of } from 'rxjs';
import { switchMap, map, catchError, take } from 'rxjs/operators';
import { Test, TestContent } from '../../interfaces/test.interface';
import { User } from '../../interfaces/user.interface';
import { DialogService } from '../../services/dialog.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-tests',
  templateUrl: './tests.component.html',
  styleUrls: ['./tests.component.scss']
})
export class TestsComponent implements OnInit, OnDestroy {
  tests: { test: Test, classTitle: string, isTeacher: boolean }[] = [];
  userSubscription: Subscription;
  testsSubscription: Subscription;
  loggedInUser: User;
  currentDate: Date = new Date();

  constructor(
    private authService: AuthService,
    private classService: ClassService,
    private testService: TestService,
    private dialogService: DialogService,
    private router: Router
  ) { }

  ngOnInit() {
    this.userSubscription = this.authService.getSignedInUserObservable().pipe(
      switchMap(user => {
        this.loggedInUser = user;
        console.log(user);
        return this.classService.getClassesForUser(user.id);
      }),
      switchMap(classes => {
        console.log(classes);
        const classIds = classes.map(cls => cls.id);
        const classTitles = classes.reduce((acc, cls) => {
          acc[cls.id] = cls.title;
          return acc;
        }, {});
        return this.testService.getTestsForClasses(classIds).pipe(
          switchMap(tests => {
            console.log(tests);
            const testObservables = tests.map(test => {
              const parsedTestContent: TestContent = JSON.parse(test.testContent);
              return this.classService.getMemberRoleByUserIdAndClassId(this.loggedInUser.id, test.classId).pipe(
                map(role => ({
                  test: { ...test, parsedTestContent },
                  classTitle: classTitles[test.classId],
                  isTeacher: role === 'teacher'
                }))
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
    if (this.testsSubscription) {
      this.testsSubscription.unsubscribe();
    }
  }
}
