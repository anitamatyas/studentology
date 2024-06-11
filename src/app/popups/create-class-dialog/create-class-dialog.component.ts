import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { User } from '../../interfaces/user.interface';

@Component({
  selector: 'app-create-class-dialog',
  templateUrl: './create-class-dialog.component.html',
  styleUrls: ['./create-class-dialog.component.scss'],
})
export class CreateClassDialogComponent implements OnInit {
  createClassForm: FormGroup;
  colors: string[] = [];
  selectedColor: string;

  constructor(
    public dialogRef: MatDialogRef<CreateClassDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { owner: User },
    private fb: FormBuilder
  ) {
    this.createClassForm = this.fb.group({
      title: ['', Validators.required],
      subTitle: ['', Validators.required],
      color: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.colors = this.getColorsFromStyles();
    this.selectedColor = this.colors[0];
    this.createClassForm.patchValue({ color: this.selectedColor });
  }

  getColorsFromStyles(): string[] {
    const styles = getComputedStyle(document.documentElement);
    return [
      styles.getPropertyValue('--primary').trim(),
      styles.getPropertyValue('--secondary').trim(),
      styles.getPropertyValue('--tertiary').trim()
    ];
  }

  generateClassCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  selectColor(color: string) {
    this.selectedColor = color;
    this.createClassForm.patchValue({ color: color });
  }

  onSave(): void {
    if (this.createClassForm.valid) {
      const newClass = {
        id: '',
        title: this.createClassForm.value.title,
        subTitle: this.createClassForm.value.subTitle,
        owner: this.data.owner.id,
        imagePath: this.createClassForm.value.color,
        classCode: this.generateClassCode(),
        members: [],
        posts: []
      };
      this.dialogRef.close(newClass);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
