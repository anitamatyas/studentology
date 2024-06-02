import { Timestamp } from "firebase/firestore";
import { Post } from "./post.interface";
import { User } from "./user.interface";
export interface Class {
    id: string;
    title: string;
    subTitle: string;
    owner: string;
    imagePath: string;
    members?: Member[];
    classCode: string;
    posts?: Post[];
}

export interface Member {
    id: string;
    userId: string;
    memberRole: string;
    users?: User[];
}