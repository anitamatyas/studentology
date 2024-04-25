export class Post {
    content: string;
    publisher: string;
    createdDate: Date;

    constructor(content: string, publisher: string, createdDate: Date) {
        this.content = content;
        this.publisher = publisher;
        this.createdDate = createdDate;
    }
}