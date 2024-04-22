import { Component, Input, OnInit } from '@angular/core';
import { Class } from '../../../models/class.model';
import { ClassService } from '../class.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-class',
  templateUrl: './class.component.html',
  styleUrls: ['./class.component.scss'],
})
export class ClassComponent  implements OnInit {
  selectedClassId: string;
  selectedClass: Class;
  postText: string = '';

  posts: Post[] = [
    { id: 1, user: 'Alice Johnson', timestamp: new Date('2023-04-21T09:24:00'), content: 'Really excited to start this course!', fileUrl: undefined },
    { id: 2, user: 'Bob Brown', timestamp: new Date('2023-04-22T10:15:00'), content: 'Does anyone have the textbook in PDF?', fileUrl: 'https://example.com/textbook.pdf' },
    { id: 3, user: 'Charlie Davis', timestamp: new Date('2023-04-23T11:00:00'), content: 'Here’s a great resource I found related to our last lecture.', fileUrl: 'https://example.com/resource.pdf' },
    { id: 4, user: 'Daisy Evans', timestamp: new Date('2023-04-23T12:45:00'), content: 'Can someone explain the last experiment in detail?' },
    { id: 5, user: 'Ethan Ford', timestamp: new Date('2023-04-24T14:30:00'), content: 'I’m having trouble with the homework problems. Any tips?' },
    { id: 6, user: 'Grace Hill', timestamp: new Date('2023-04-25T15:20:00'), content: 'Study group this Friday at the library. Everyone’s welcome!' },
    { id: 7, user: 'John Doe', timestamp: new Date('2023-04-26T16:00:00'), content: 'Reminder that the assignment is due next Monday.' },
    { id: 8, user: 'Jane Smith', timestamp: new Date('2023-04-27T17:45:00'), content: 'Anyone interested in collaborating on the project?' },
    { id: 9, user: 'Alice Johnson', timestamp: new Date('2023-04-28T18:30:00'), content: 'Found an error in the lab manual. I’ve emailed the instructor about it.' },
    { id: 10, user: 'Charlie Davis', timestamp: new Date('2023-04-29T19:00:00'), content: 'Check out my latest post on the forum blog about our course topic!', fileUrl: 'https://example.com/blogpost' }
];

  constructor(private classService: ClassService, private route: ActivatedRoute) {
    
  }

  ngOnInit() {
    this.selectedClassId = this.route.snapshot.paramMap.get('id');
    this.selectedClass = this.classService.getClassById(this.selectedClassId);
    console.log(this.selectedClass);
    
  }

  onSubmit() {
    if (this.postText) {
      console.log(this.postText);
      this.posts.push(
        { id: 11, user: 'Anita Matyas', timestamp: new Date('2023-04-21T09:24:00'), content: this.postText, fileUrl: undefined });
      
      this.postText = '';
    }
  }
}

export interface Post {
  id: number;
  user: string;
  timestamp: Date;
  content: string;
  fileUrl?: string;
}
