import { ObjectId } from "mongodb";

interface IAllergenic {
  _id?: string | ObjectId;
  name: string;

}

class Allergenic {
  private data: IAllergenic;

  constructor(data: IAllergenic) {
    this.data = data;
  }

  get info(): IAllergenic {
    return this.data;
  }

  update(details: Partial<IAllergenic>) {
    this.data = { ...this.data, ...details };
  }
}
export { Allergenic as Allergenic, IAllergenic as IAllergenic };
