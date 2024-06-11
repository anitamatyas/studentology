import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { Timestamp } from '@angular/fire/firestore';
import { AuthService } from '../../../services/auth.service';
import { Submission, Test, TestContent } from '../../../interfaces/test.interface';
import { TestService } from '../../../services/test.service';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { CanComponentDeactivate } from '../../../unsaved-changes-gurad';
import { ConfirmDialogComponent } from '../../../popups/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-solve-test',
  templateUrl: './solve-test.component.html',
  styleUrls: ['./solve-test.component.scss']
})
export class SolveTestComponent implements OnInit, CanComponentDeactivate {
  test: Test;
  testContent: TestContent;
  solveTestForm: FormGroup;
  studentId: string;
  changesSaved = false;

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private authService: AuthService,
    private testService: TestService,
    private router: Router,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    const testId = this.route.snapshot.paramMap.get('id');
    this.testService.getTestById(testId).subscribe(test => {
      this.test = test;
      this.testContent = JSON.parse(test.testContent);
      this.createForm();
    });

    this.studentId = this.authService.getSignedInUser().id;
  }

  createForm() {
    this.solveTestForm = this.fb.group({
      questions: this.fb.array(this.testContent.questions.map(q => this.createQuestionFormGroup(q)))
    });
  }

  createQuestionFormGroup(question): FormGroup {
    return this.fb.group({
      question: [question.question],
      points: [question.points],
      answers: this.fb.array(question.answers.map(() => this.fb.control(false)))
    });
  }

  get questions(): FormArray {
    return this.solveTestForm.get('questions') as FormArray;
  }

  getAnswers(questionIndex: number): FormArray {
    return this.questions.at(questionIndex).get('answers') as FormArray;
  }

  onSubmit() {
    this.submitTest().then(() => {
      this.changesSaved = true;
      this.router.navigate(['/home']);
    }).catch(error => {
      console.error('Failed to submit test:', error);
    });
  }

  onCancel() {
    this.router.navigate(['/home']);
  }

  submitTest(): Promise<void> {
    const formValue = this.solveTestForm.value;

    const submissionContent = {
      title: this.testContent.title,
      questions: formValue.questions.map((q, qIndex) => ({
        question: q.question,
        points: q.points,
        answers: q.answers.map((a, aIndex) => ({
          answer: this.testContent.questions[qIndex].answers[aIndex].answer,
          checked: a // This represents the checked state (true/false)
        }))
      }))
    };

    const submission: Submission = {
      studentId: this.studentId,
      submissionContent: JSON.stringify(submissionContent),
      turnedInDate: new Timestamp(Math.floor(Date.now() / 1000), 0)
    };

    return this.testService.submitTest(this.test.id, submission);
  }

  canDeactivate(): Observable<boolean> | Promise<boolean> | boolean {
    if (!this.changesSaved) {
      const dialogRef = this.dialog.open(ConfirmDialogComponent, {
        width: '400px',
        data: { message: 'If you leave this page, your work will be submitted. Do you want to continue?' }
      });

      return dialogRef.afterClosed().toPromise().then(result => {
        if (result) {
          return this.submitTest().then(() => true).catch(() => false);
        } else {
          return false;
        }
      });
    }
    return true;
  }
}
