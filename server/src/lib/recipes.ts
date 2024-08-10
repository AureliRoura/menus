import { ObjectId } from "mongodb";
interface IIngredientList {
  _id?: string | ObjectId;
  name: string;
  quantity: number;
  unit: string;
  optional?: boolean;
}

interface ICategories {
  Category: string;
  values: string[];
}




interface IRecipe {
  _id?: string | ObjectId;
  name: string;
  desc?: string;
  ingredients?: IIngredientList[];
  category?: ICategories[];
  steps?: string[];
  time?: string;
  rating?: {};
  recipes_id?: string[];
}

class Recipe {
  private data: IRecipe;

  constructor(data: IRecipe) {
    this.data = data;
  }

  get info(): IRecipe {
    return this.data;
  }

  update(details: Partial<IRecipe>) {
    this.data = { ...this.data, ...details };
  }
}

export { Recipe, IRecipe, IIngredientList, ICategories };
