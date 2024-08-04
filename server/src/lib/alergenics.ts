import { ObjectId } from "mongodb";

interface IAlergenic {
  _id?: string | ObjectId;
  name: string;

}

class Alergenic {
  private data: IAlergenic;

  constructor(data: IAlergenic) {
    this.data = data;
  }

  get info(): IAlergenic {
    return this.data;
  }

  update(details: Partial<IAlergenic>) {
    this.data = { ...this.data, ...details };
  }
}
export { Alergenic, IAlergenic };
