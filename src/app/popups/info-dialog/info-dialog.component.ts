import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-info-dialog',
  templateUrl: './info-dialog.component.html',
  styleUrls: ['./info-dialog.component.scss'],
})
export class InfoDialogComponent {

  constructor(@Inject(MAT_DIALOG_DATA) public data: { header: string; text: string }) { }

  get header(): string {
    return this.data.header;
  }

  get text(): string {
    return this.data.text;
  }

}
