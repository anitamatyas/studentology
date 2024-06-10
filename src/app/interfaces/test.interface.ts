import { Timestamp } from "firebase/firestore";

export interface Test {
    id?: string;
    classId: string;
    createdBy: string;
    isForGroup: boolean;
    groupId?: string;
    testContent: any;
    dueDate: Timestamp;
}