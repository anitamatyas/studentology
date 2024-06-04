import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-create-test-dialog',
  templateUrl: './create-test-dialog.component.html',
  styleUrls: ['./create-test-dialog.component.scss'],
})
export class CreateTestDialogComponent  implements OnInit {
  title: string;
  dueDate: Date;

  constructor(public dialogRef: MatDialogRef<CreateTestDialogComponent>) { }

  ngOnInit() {}

  onCancelClick(): void {
    this.dialogRef.close();
  }

}
