import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { UserService } from '../../services/user.service';
import { ClassService } from '../../services/class.service';
import { DialogService } from '../../services/dialog.service';

@Component({
  selector: 'app-add-member-dialog',
  templateUrl: './add-member-dialog.component.html',
  styleUrls: ['./add-member-dialog.component.scss'],
})
export class AddMemberDialogComponent {
  addMemberForm: FormGroup;
  errorMessage: string = '';

  constructor(
    public dialogRef: MatDialogRef<AddMemberDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { groupId: string, classId: string },
    private fb: FormBuilder,
    private userService: UserService,
    private classService: ClassService,
    private dialogService: DialogService
  ) {
    this.addMemberForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onAddMember() {
    if (this.addMemberForm.invalid) {
      return;
    }

    const email = this.addMemberForm.get('email').value;
    this.userService.getUserByEmail(email).subscribe({
      next: user => {
        if (user) {
          this.dialogRef.close(user.id);
        } else {
          this.errorMessage = 'User not found';
        }
      },
      error: () => {
        this.errorMessage = 'Error fetching user';
      }
    });
  }

  onCancel() {
    this.dialogRef.close();
  }
}
