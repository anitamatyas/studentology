import { Component, OnInit, OnDestroy, ViewChildren, QueryList } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { ClassService } from '../../services/class.service';
import { Subscription, combineLatest, of } from 'rxjs';
import { switchMap, map, catchError, take, finalize } from 'rxjs/operators';
import { User } from '../../interfaces/user.interface';
import { DialogService } from '../../services/dialog.service';
import { Router } from '@angular/router';
import { Assignment, Submission } from '../../interfaces/test.interface';
import { AssignmentService } from '../../services/assignment.service';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartOptions, ChartType, ChartData } from 'chart.js';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { Timestamp } from "@angular/fire/firestore";
import { MatDialog } from '@angular/material/dialog';
import { GradeAssignmentsDialogComponent } from '../../popups/grade-assignments-dialog/grade-assignments-dialog.component';

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
  @ViewChildren(BaseChartDirective) charts: QueryList<BaseChartDirective>;
  isLoading: boolean = true;
  selectedFile: File | null = null;
  assignmentId: string | null = null;
  noAssignments: boolean = false;

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
    private assignmentService: AssignmentService,
    private dialogService: DialogService,
    private storage: AngularFireStorage,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
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
        return this.fetchAssignmentsAndSubmissions(classIds, classTitles);
      })
    ).subscribe(assignments => {
      console.log('assignments fetched');
      this.assignments = assignments;
      this.noAssignments = assignments.length === 0;
      this.updateDoughnutChart();
      this.updateBarChart();
      this.isLoading = false;
      console.log(assignments);
    }, error => {
      this.isLoading = false;
      this.noAssignments = true;
      console.error('Failed to fetch assignments or roles:', error);
    });
    this.setChartColorsFromCSSVariables();
  }

  fetchAssignmentsAndSubmissions(classIds: string[], classTitles: { [key: string]: string }) {
    this.isLoading = true;
    return this.assignmentService.getAssignmentsForClasses(classIds).pipe(
      switchMap(assignments => {
        this.noAssignments = assignments.length === 0;
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
        this.isLoading = false;
        return of([]);
      })
    );
  }

  updateDoughnutChart(): void {
    const submittedCount = this.assignments.filter(a => a.submitted).length;
    const notSubmittedCount = this.assignments.length - submittedCount;
    this.doughnutChartData.datasets[0].data = [submittedCount, notSubmittedCount];
    this.doughnutChartData.datasets[0].backgroundColor = [
      '#699869',
      getComputedStyle(document.documentElement).getPropertyValue('--secondary').trim(),
      '#da6262'
    ];
    this.charts.forEach(chart => chart.update());
  }

  updateBarChart(): void {
    const classGrades: { [key: string]: number[] } = {};

    this.assignments.forEach(a => {
      if (!classGrades[a.classTitle]) {
        classGrades[a.classTitle] = [];
      }
      if (a.grade !== undefined) {
        classGrades[a.classTitle].push(a.grade);
      } else if (new Date(a.assignment.dueDate.toDate()) < this.currentDate) {
        classGrades[a.classTitle].push(0);
      }
    });

    this.barChartLabels = Object.keys(classGrades);
    this.barChartData.labels = this.barChartLabels;

    this.barChartData.datasets[0].data = this.barChartLabels.map(className => {
      const grades = classGrades[className];
      if (grades.length === 0) {
        return 0;
      }
      const average = grades.reduce((acc, grade) => acc + grade, 0) / grades.length;
      return average;
    });

    this.charts.forEach(chart => chart.update());
  }



  setChartColorsFromCSSVariables() {
    const secondaryColor = getComputedStyle(document.documentElement).getPropertyValue('--tertiary').trim();
    this.doughnutChartData.datasets[0].backgroundColor = ['#699869', secondaryColor];
  }

  onFileSelected(event: Event, assignmentId: string) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length) {
      this.selectedFile = input.files[0];
      this.assignmentId = assignmentId;
    }
  }

  solveAssignment(assignment: Assignment) {
    if (this.selectedFile && this.assignmentId === assignment.id) {
      const filePath = `assignments/${assignment.id}/${this.selectedFile.name}`;
      const fileRef = this.storage.ref(filePath);
      const task = this.storage.upload(filePath, this.selectedFile);
      const nowInSeconds = Math.ceil(Date.now() / 1000);
      const newTimestamp = new Timestamp(nowInSeconds, 0);

      task.snapshotChanges().pipe(
        finalize(() => {
          fileRef.getDownloadURL().subscribe((url) => {
            const newSubmission: Submission = {
              studentId: this.loggedInUser.id,
              submissionContent: url,
              turnedInDate: Timestamp.now()
            };
            this.assignmentService.addSubmission(assignment.id, newSubmission).then(() => {
              this.fetchAssignmentsAndSubmissions([assignment.classId], { [assignment.classId]: assignment.title });
            });
          });
        })
      ).subscribe();
    }
  }

  openGradeAssignmentsDialog(assignmentId: string) {
    const dialogRef = this.dialog.open(GradeAssignmentsDialogComponent, {
      width: '600px',
      data: { assignmentId }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('closed');
      }
    });
  }

  ngOnDestroy() {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }
}
