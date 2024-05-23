import { Component, OnInit } from '@angular/core';
import { Class } from '../../interfaces/class.interface';
import { ClassService } from '../../services/class.service';
import { Router } from '@angular/router';
import { BehaviorSubject, Subscription } from 'rxjs';
import { AngularFirestore } from '@angular/fire/compat/firestore';

const colorPalette = ['#10439F', '#874CCC', '#C65BCF', '#F27BBD'];

@Component({
  selector: 'app-class-list',
  templateUrl: './class-list.component.html',
  styleUrl: './class-list.component.scss'
})
export class ClassListComponent implements OnInit{
  classList: Class[];
  private classesSubscription: Subscription;

  constructor(private classService: ClassService, private router: Router, private firestore: AngularFirestore) {

  }

  ngOnInit() {
    this.classesSubscription = this.classService.getClasses().subscribe(classes => {
      this.classList = classes;
    });
  }

  navigateToClass(classItem: Class){
    console.log('passed class to classItem: ',classItem);
    this.router.navigate(['home/classView/' + classItem.id]);
  }

  ngOnDestroy(){
    this.classesSubscription.unsubscribe();
  }

}
