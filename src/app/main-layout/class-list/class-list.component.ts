import { Component, OnInit } from '@angular/core';
import { Class } from '../../models/class.model';
import { ClassService } from './class.service';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

const colorPalette = ['#10439F', '#874CCC', '#C65BCF', '#F27BBD'];

@Component({
  selector: 'app-class-list',
  templateUrl: './class-list.component.html',
  styleUrl: './class-list.component.scss'
})
export class ClassListComponent implements OnInit{
  classList: Class[];

  constructor(private classService: ClassService, private router: Router) {

  }

  ngOnInit() {
    this.classList = this.classService.getClasses();
  }

  navigateToClass(classItem: Class){
    this.classService.selectClass(classItem);
    this.router.navigate(['home/classView/' + classItem.id]);
  }

}
