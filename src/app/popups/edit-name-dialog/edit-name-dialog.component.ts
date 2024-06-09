import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-edit-name-dialog',
  templateUrl: './edit-name-dialog.component.html',
  styleUrls: ['./edit-name-dialog.component.scss'],
})
export class EditNameDialogComponent {
  editNameForm: FormGroup;
  title: string;

  constructor(
    public dialogRef: MatDialogRef<EditNameDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { title: string, name: string },
    private fb: FormBuilder
  ) {
    this.title = data.title;
    this.editNameForm = this.fb.group({
      name: [data.name, Validators.required]
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    if (this.editNameForm.valid) {
      this.dialogRef.close(this.editNameForm.value.name);
    }
  }
}
