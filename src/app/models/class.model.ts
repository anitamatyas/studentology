export class Class {
    id: string;
    title: string;
    subTitle: string;
    owner: string;
    imagePath: string;
    members: number;

    constructor(id:string, title: string, subTitle: string, owner: string, imagePath: string, members: number) {
        this.id = id;
        this.title = title;
        this.subTitle = subTitle;
        this.owner = owner;
        this.imagePath = imagePath;
        this.members = members;
    }
}