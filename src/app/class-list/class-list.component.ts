import { Component } from '@angular/core';

@Component({
  selector: 'app-class-list',
  templateUrl: './class-list.component.html',
  styleUrl: './class-list.component.scss'
})
export class ClassListComponent {
  classList = ['magyar', 'roman', 'angol', 'programozas', 'matek'];
}
