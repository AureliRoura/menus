import { ObjectId } from "mongodb";

interface IUnit {
  _id?: string;
  unit: string;

}

class Unit {
  private data: IUnit;

  constructor(data: IUnit) {
    this.data = data;
  }

  get info(): IUnit {
    return this.data;
  }

  update(details: Partial<IUnit>) {
    this.data = { ...this.data, ...details };
  }
}
export { Unit, IUnit };
