export class Class {
    title: string;
    subTitle: string;
    owner: string;
    imagePath: string;
    members: number;

    constructor(title: string, subTitle: string, owner: string, imagePath: string, members: number) {
        this.title = title;
        this.subTitle = subTitle;
        this.owner = owner;
        this.imagePath = imagePath;
        this.members = members;
    }
}