import { Component, OnInit } from '@angular/core';
import { Class } from '../../models/class.model';
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
    this.classesSubscription = this.classService.fetchClasses().subscribe(classes => {
      this.classList = classes;
    });
  }

  navigateToClass(classItem: Class){
    this.router.navigate(['home/classView/' + classItem.id]);
  }

  //Unsubscribing from all my subscriptions
  ngOnDestroy(){
    this.classesSubscription.unsubscribe();
  }

}
