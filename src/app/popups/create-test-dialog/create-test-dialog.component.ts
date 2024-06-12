import { Component, Inject, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ClassService } from '../../services/class.service';
import { ActivatedRoute } from '@angular/router';
import { Group } from '../../interfaces/class.interface';
import { Timestamp } from '@angular/fire/firestore';

@Component({
  selector: 'app-create-test-dialog',
  templateUrl: './create-test-dialog.component.html',
  styleUrls: ['./create-test-dialog.component.scss'],
})
export class CreateTestDialogComponent implements OnInit {
  testForm: FormGroup;
  groups: Group[] = [];
  selectedClassId: string;
  points = Array.from({ length: 10 }, (_, i) => i + 1);
  isAssignment: boolean;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<CreateTestDialogComponent>,
    private classService: ClassService,
    private route: ActivatedRoute,
    @Inject(MAT_DIALOG_DATA) public data: { isAssignment: boolean }
  )
  { }

  ngOnInit(): void {
    this.selectedClassId = this.route.snapshot.paramMap.get('id');
    this.isAssignment = this.data.isAssignment || false;

    this.testForm = this.fb.group({
      title: ['', Validators.required],
      description: this.isAssignment ? [''] : undefined,
      dueDate: ['', Validators.required],
      isForGroup: [{ value: false, disabled: true }],
      groupId: ['']
    });

    if (!this.isAssignment) {
      this.testForm.addControl('questions', this.fb.array([this.createQuestion()]));
    }

    this.classService.getGroups(this.selectedClassId).subscribe(groups => {
      this.groups = groups;
      if (this.groups.length > 0) {
        this.testForm.get('isForGroup').enable();
      } else {
        this.testForm.get('isForGroup').disable();
      }
    });
  }

  get questions(): FormArray {
    return this.testForm.get('questions') as FormArray;
  }

  createQuestion(): FormGroup {
    return this.fb.group({
      question: ['', Validators.required],
      points: [1, Validators.required],
      answers: this.fb.array([this.createAnswer()])
    });
  }

  createAnswer(): FormGroup {
    return this.fb.group({
      answer: ['', Validators.required],
      correct: [false]
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
      const formValue = this.testForm.value;
      const dueDate = new Date(formValue.dueDate);
      const dueDateTimestamp = new Timestamp(Math.floor(dueDate.getTime() / 1000), 0);
      const result = {
        ...formValue,
        dueDate: dueDateTimestamp
      };

      if (this.testForm.get('isForGroup').disabled) {
        result.isForGroup = false;
      }

      console.log(result);

      this.dialogRef.close(result);
    }
  }
}
