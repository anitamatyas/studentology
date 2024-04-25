import { Post } from "./post.model";
export class Class {
    id: string;
    title: string;
    subTitle: string;
    owner: string;
    imagePath: string;
    members: number;
    posts: Post[];

    constructor(id:string, title: string, subTitle: string, owner: string, imagePath: string, members: number, posts: Post[]) {
        this.id = id;
        this.title = title;
        this.subTitle = subTitle;
        this.owner = owner;
        this.imagePath = imagePath;
        this.members = members;
        this.posts = posts;
    }
}