import { Component, Input, OnInit } from '@angular/core';
import { Class } from '../../../interfaces/class.interface';

@Component({
  selector: 'app-class-item',
  templateUrl: './class-item.component.html',
  styleUrls: ['./class-item.component.scss'],
})
export class ClassItemComponent  implements OnInit {
  @Input() class: Class;

  constructor() { }

  ngOnInit() {
    //console.log(this.class)
  }

}
