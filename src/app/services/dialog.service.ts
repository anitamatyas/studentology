// dialog.service.ts
import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { InfoDialogComponent } from '../popups/info-dialog/info-dialog.component';

@Injectable({
    providedIn: 'root'
})
export class DialogService {
    constructor(private dialog: MatDialog) { }

    showInfoDialog(header: string, text: string): void {
        const dialogRef = this.dialog.open(InfoDialogComponent, {
            data: { header, text }
        });

        setTimeout(() => {
            dialogRef.close();
        }, 3000);
    }
}
