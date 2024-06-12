import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-grades-dialog',
  templateUrl: './grades-dialog.component.html',
  styleUrls: ['./grades-dialog.component.scss']
})
export class GradesDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<GradesDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { userDetails: any[] }
  ) { }

  onClose(): void {
    this.dialogRef.close();
  }
}