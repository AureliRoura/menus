import { ObjectId } from "mongodb";

interface IIngredient {
  _id?: string;
  name: string;
  allergenics: string[];
}

class Ingredient {
  private data: IIngredient;

  constructor(data: IIngredient) {
    this.data = data;
  }

  get info(): IIngredient {
    return this.data;
  }

  update(details: Partial<IIngredient>) {
    this.data = { ...this.data, ...details };
  }

  eliminateId() {
    const { _id, ...rest } = this.data;
    this.data = rest;
    console.log("eliminateId", this.data);
  }

}
export { Ingredient, IIngredient };
