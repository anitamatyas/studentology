import { Timestamp } from "firebase/firestore";

export interface Test {
    id?: string;
    classId: string;
    createdBy: string;
    isForGroup: boolean;
    groupId?: string;
    testContent: any;
    dueDate: Timestamp;
    isGraded: boolean;
    parsedTestContent?: TestContent;
}

export interface TestContent {
    title: string;
    questions: {
        question: string;
        answers: {
            answer: string;
            correct: boolean;
        }[];
    }[];
}

export interface Submission {
    id?: string;
    studentId: string;
    submissionContent: any;
    grade?: number;
    turnedInDate: Timestamp;
}