import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-create-test-dialog',
  templateUrl: './create-test-dialog.component.html',
  styleUrls: ['./create-test-dialog.component.scss'],
})
export class CreateTestDialogComponent  implements OnInit {
  testForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<CreateTestDialogComponent>
  ) { }

  ngOnInit(): void {
    this.testForm = this.fb.group({
      title: ['', Validators.required],
      dueDate: ['', Validators.required],
      questions: this.fb.array([this.createQuestion()])
    });
  }

  get questions(): FormArray {
    return this.testForm.get('questions') as FormArray;
  }

  createQuestion(): FormGroup {
    return this.fb.group({
      question: ['', Validators.required],
      answers: this.fb.array([this.createAnswer()])
    });
  }

  createAnswer(): FormGroup {
    return this.fb.group({
      answer: ['', Validators.required]
    });
  }

  addQuestion(): void {
    this.questions.push(this.createQuestion());
  }

  addAnswer(questionIndex: number): void {
    this.getAnswers(questionIndex).push(this.createAnswer());
  }

  getAnswers(questionIndex: number): FormArray {
    return this.questions.at(questionIndex).get('answers') as FormArray;
  }

  onSubmit(): void {
    if (this.testForm.valid) {
      this.dialogRef.close(this.testForm.value);
    }
  }

}
