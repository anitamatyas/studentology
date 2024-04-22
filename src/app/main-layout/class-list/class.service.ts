import { EventEmitter } from "@angular/core";
import { Class } from "../../models/class.model";
import { BehaviorSubject } from "rxjs";

const colorPalette = ['#10439F', '#874CCC', '#C65BCF', '#F27BBD'];

export class ClassService {
    
    private selectedClass = new BehaviorSubject<Class | null>(null);
    private classes: Class[] = [
        new Class('1','Mathematics', 'Introduction to Algebra', 'John Doe', colorPalette[0], 25),
        new Class('2','Physics', 'Fundamentals of Mechanics', 'Jane Smith', colorPalette[1], 30),
        new Class('3','Chemistry', 'Organic Chemistry Basics', 'Alice Johnson', colorPalette[2], 20),
        new Class('4','Biology', 'Marine Biology', 'Bob Brown', colorPalette[3], 22),
        new Class('5','History', 'World History Overview', 'Charlie Davis', colorPalette[0], 18),
        new Class('6','Geography', 'Geographical Mapping Techniques', 'Daisy Evans', colorPalette[1], 15),
        new Class('7','English', 'Advanced English Literature', 'Ethan Ford', colorPalette[2], 28),
        new Class('8','Art', 'Modern Art & Techniques', 'Grace Hill', colorPalette[3], 23)
    ];

    selectClass(classItem: Class){
        this.selectedClass.next(classItem);
    }

    getClassById(id: string){
        console.log(id);
        return this.classes.find(cls => cls.id === id);
    }

    getClasses() {
        return this.classes.slice();
    }
}