import { IRecipe } from "./recipes";

interface IMeal {
  lunch: IRecipe[];
  dinner: IRecipe[];
}

interface IMenu {
  _id?: string;
  name: string;
  items: any[]; // Ensure this property is defined to represent menu items
  menu: {
      monday: IMeal;
      tuesday: IMeal;
      wednesday: IMeal;
      thursday: IMeal;
      friday: IMeal;
      saturday: IMeal;
      sunday: IMeal;
  };
}
  
class Menu {
  private data: IMenu;

  constructor(data: IMenu) {
    this.data = data;
  }

  get info(): IMenu {
    return this.data;
  }

  update(details: Partial<IMenu>) {
    this.data = { ...this.data, ...details };
  }
}

export { Menu, IMenu };
