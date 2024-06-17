import { Component, OnInit, OnDestroy, ViewChildren, QueryList } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { ClassService } from '../../services/class.service';
import { Subscription, combineLatest, of } from 'rxjs';
import { switchMap, map, catchError, take } from 'rxjs/operators';
import { User } from '../../interfaces/user.interface';
import { DialogService } from '../../services/dialog.service';
import { Router } from '@angular/router';
import { Assignment } from '../../interfaces/test.interface';
import { AssignmentService } from '../../services/assignment.service';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartOptions, ChartType, ChartData } from 'chart.js';

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
    private router: Router
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
      this.assignments = assignments;
      this.updateDoughnutChart();
      this.updateBarChart();
      this.isLoading = false;
      console.log(assignments);
    }, error => {
      console.error('Failed to fetch assignments or roles:', error);
      this.isLoading = false;
    });
    this.setChartColorsFromCSSVariables();
  }

  fetchAssignmentsAndSubmissions(classIds: string[], classTitles: { [key: string]: string }) {
    this.isLoading = true;
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
        this.isLoading = false;
        return of([]);
      })
    );
  }

  updateDoughnutChart(): void {
    const submittedCount = this.assignments.filter(a => a.submitted).length;
    const notSubmittedCount = this.assignments.length - submittedCount;
    this.doughnutChartData.datasets[0].data = [submittedCount, notSubmittedCount];
    this.charts.forEach(chart => chart.update());
  }

  updateBarChart(): void {
    const classGrades: { [key: string]: number[] } = {};
    this.assignments.forEach(a => {
      if (!classGrades[a.classTitle]) {
        classGrades[a.classTitle] = [];
      }
      if (a.assignment.isGraded) {
        classGrades[a.classTitle].push(a.grade);
      }
    });

    this.barChartLabels = Object.keys(classGrades);
    this.barChartData.labels = this.barChartLabels;
    this.barChartData.datasets[0].data = this.barChartLabels.map(className => {
      const grades = classGrades[className];
      const average = grades.reduce((acc, grade) => acc + grade, 0) / grades.length;
      return average;
    });
    this.charts.forEach(chart => chart.update());
  }

  setChartColorsFromCSSVariables() {
    const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim();
    const secondaryColor = getComputedStyle(document.documentElement).getPropertyValue('--tertiary').trim();
    this.doughnutChartData.datasets[0].backgroundColor = ['#699869', secondaryColor];
  }

  ngOnDestroy() {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }
}
