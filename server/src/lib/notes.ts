import { ObjectId } from "mongodb";

interface INote {
  _id?: ObjectId;
  recipeId: ObjectId;
  user: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

class Note {
  private data: INote;

  constructor(data: INote) {
    this.data = data;
  }

  get info(): INote {
    return this.data;
  }

  update(details: Partial<INote>) {
    this.data = { ...this.data, ...details };
  }
}

export { Note, INote };
