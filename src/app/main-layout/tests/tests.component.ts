import { Component, OnInit, OnDestroy, ViewChild, ViewChildren, QueryList } from '@angular/core';
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
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartOptions, ChartType, ChartData } from 'chart.js';

@Component({
  selector: 'app-tests',
  templateUrl: './tests.component.html',
  styleUrls: ['./tests.component.scss']
})
export class TestsComponent implements OnInit, OnDestroy {
  tests: { test: Test, classTitle: string, isTeacher: boolean, submitted: boolean, grade?: number, submissionCount: number }[] = [];
  userSubscription: Subscription;
  loggedInUser: User;
  currentDate: Date = new Date();
  @ViewChildren(BaseChartDirective) charts: QueryList<BaseChartDirective>;
  isLoading: boolean = true;

  //Doughnut Chart variables
  doughnutChartLabels: string[] = ['Submitted', 'Not Submitted', 'Expired'];
  doughnutChartData: ChartData<'doughnut'> = {
    labels: this.doughnutChartLabels,
    datasets: [
      {
        data: [1, 9, 0],
        backgroundColor: [],
      },
    ],
  };
  doughnutChartType: ChartConfiguration<'doughnut'>['type'] = 'doughnut';
  doughnutChartOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: false,
    plugins: {
      legend: {
        display: true,
        position: 'bottom'
      },
    }
  };

  // Bar Chart variables
  barChartLabels: string[] = [];
  barChartData: ChartData<'bar'> = {
    labels: this.barChartLabels,
    datasets: [
      { data: [], label: 'Average Grades', backgroundColor: '#36A2EB' }
    ],
  };
  barChartType: ChartConfiguration<'bar'>['type'] = 'bar';
  barChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: false,
    plugins: {
      legend: {
        display: true,
        position: 'top'
      },
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Classes'
        }
      },
      y: {
        display: true,
        title: {
          display: true,
          text: 'Grades'
        },
        suggestedMin: 0,
        suggestedMax: 10
      }
    }
  };


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
        console.log(this.loggedInUser);
        return this.classService.getClassesForUser(user.id);
      })
    ).subscribe(classes => {
      const classIds = classes.map(cls => cls.id);
      const classTitles = classes.reduce((acc, cls) => {
        acc[cls.id] = cls.title;
        return acc;
      }, {});
      this.fetchTestsAndSubmissions(classIds, classTitles);
    });
    this.setChartColorsFromCSSVariables();
  }

  fetchTestsAndSubmissions(classIds: string[], classTitles: { [key: string]: string }) {
    this.isLoading = true;
    this.testService.getTestsForClasses(classIds).pipe(
      switchMap(tests => {
        const testObservables = tests.map(test => {
          const parsedTestContent: TestContent = JSON.parse(test.testContent);
          return this.fetchRoleAndSubmissions(test, classTitles[test.classId]).pipe(
            map(roleAndSubmissions => ({
              test: { ...test, parsedTestContent },
              classTitle: classTitles[test.classId],
              ...roleAndSubmissions
            }))
          );
        });
        return combineLatest(testObservables);
      }),
      catchError(error => {
        console.error('Failed to fetch tests or roles:', error);
        this.isLoading = false;
        return of([]);
      })
    ).subscribe(tests => {
      this.tests = tests;
      this.updatedoughnutChart();
      this.updateBarChart();
      this.isLoading = false;
    });
  }

  fetchRoleAndSubmissions(test: Test, classTitle: string) {
    return this.classService.getMemberRoleByUserIdAndClassId(this.loggedInUser.id, test.classId).pipe(
      switchMap(role => {
        return this.testService.getSubmissions(test.id).pipe(
          map(submissions => {
            const submission = submissions.find(sub => sub.studentId === this.loggedInUser.id);
            const submitted = !!submission;
            const grade = submission ? submission.grade : undefined;
            return {
              isTeacher: role === 'teacher',
              submitted: submitted,
              grade: grade,
              submissionCount: submissions.length
            };
          })
        );
      })
    );
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

  updatedoughnutChart() {
    const totalTests = this.tests.length;
    const submittedTests = this.tests.filter(test => test.submitted).length;
    const expiredTests = this.tests.filter(test => new Date(test.test.dueDate.toDate()) < this.currentDate).length;
    const notSubmittedTests = totalTests - submittedTests - expiredTests;

    this.doughnutChartData.datasets[0].data = [submittedTests, notSubmittedTests, expiredTests];
    this.doughnutChartData.datasets[0].backgroundColor = [
      '#699869',
      getComputedStyle(document.documentElement).getPropertyValue('--secondary').trim(),
      '#da6262'
    ];
    this.updateChart();
  }

  updateBarChart() {
    const classGroups: { [key: string]: number[] } = {};

    const colors = [
      getComputedStyle(document.documentElement).getPropertyValue('--primary').trim(),
      getComputedStyle(document.documentElement).getPropertyValue('--secondary').trim(),
      getComputedStyle(document.documentElement).getPropertyValue('--tertiary').trim(),
      getComputedStyle(document.documentElement).getPropertyValue('--quaternary').trim()
    ];

    this.tests.forEach(test => {
      if (!classGroups[test.classTitle]) {
        classGroups[test.classTitle] = [];
      }
      if (test.submitted) {
        classGroups[test.classTitle].push(test.grade ?? 0);
      }
    });

    console.log(classGroups);

    const averageGrades = Object.keys(classGroups).map(classTitle => {
      const grades = classGroups[classTitle];
      let total = 0;
      grades.forEach(grade => {
        total += grade;
      });
      return {
        classTitle,
        averageGrade: grades.length ? total / grades.length : 0,
        backgroundColor: '#36A2EB'
      };
    });

    this.barChartData = {
      labels: [''],
      datasets: averageGrades.map((gradeData, index) => ({
        data: [gradeData.averageGrade],
        label: gradeData.classTitle,
        backgroundColor: colors[index % colors.length]
      }))
    };

    console.log(this.barChartData);
    this.updateChart();
  }

  setChartColorsFromCSSVariables() {
    const secondaryColor = getComputedStyle(document.documentElement).getPropertyValue('--tertiary').trim();
    this.doughnutChartData.datasets[0].backgroundColor = ['#699869', secondaryColor];
  }

  updateChart() {
    this.charts.forEach(chart => chart.chart.update());
  }

  ngOnDestroy() {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

}