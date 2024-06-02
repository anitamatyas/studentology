import { Timestamp } from 'firebase/firestore';
import { User } from './user.interface';

export interface Post {
    id: string;
    classId: string;
    content: string;
    publisherId: string;
    createdDate: Timestamp;
}

export interface PostComment {
    id: string;
    userId: string;
    content: string;
    commentedDate?: Timestamp;
    user?: User;
}