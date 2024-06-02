import { Component, Input, OnInit } from '@angular/core';
import { Class } from '../../../interfaces/class.interface';
import { User } from '../../../interfaces/user.interface';
import { UserService } from '../../../services/user.service';
import { Observable, take, tap } from 'rxjs';
import { ClassService } from '../../../services/class.service';

@Component({
  selector: 'app-class-item',
  templateUrl: './class-item.component.html',
  styleUrls: ['./class-item.component.scss'],
})
export class ClassItemComponent  implements OnInit {
  @Input() class: Class;
  classOwner: Observable<User>;
  membersCount: Observable<number>;

  constructor(private userService: UserService, private classService: ClassService) { }

  ngOnInit() {
    this.classOwner = this.userService.getUserById(this.class.owner);
    this.membersCount = this.classService.getClassMembersLength(this.class.id);
  }

}
