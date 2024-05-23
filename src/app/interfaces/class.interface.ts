import { Timestamp } from "firebase/firestore";
import { Post } from "./post.interface";
export interface Class {
    id: string;
    title: string;
    subTitle: string;
    owner: string;
    imagePath: string;
    members: Member[];
    posts?: Post[];
}

export interface Member {
    id: string;
    userId: string;
    joinedDate: Date;
    memberRole: string;
}