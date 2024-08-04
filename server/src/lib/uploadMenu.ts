import { MongoDatabase as BaseDatabase } from './mongo-database';
import { IUnit } from './units';
import { IIngredient } from './ingredients';
import { IMenu } from './menus';
import { IRecipe, IIngredientList } from './recipes';


/*
  Upload a menu to the database

  @param db: BaseDatabase - The database to upload the menu to
  @param menu: IMenu - The menu to upload to the database

  @returns void
  @throws Error - If the menu is not valid
  @throws Error - If the database operation fails

Format of the data to be uploaded:
{
  "name": "Menu 1",
  "menu": {
    "monday": {
      "lunch": [
        {
          "name": "Recipe 1",
          "ingredients": [
            {
              "name": "Ingredient 1",
              "quantity": 100,
              "unit": "g"
            }
          ]
        }
      ],
      "dinner": [
        {
          "name": "Recipe 2",
          "ingredients": [
            {
              "name": "Ingredient 2",
              "quantity": 200,
              "unit": "g"
            }
          ]
        }
      ]
    }
  }
}

*/
// verify correct data format from json for uploadMenu and return a IMenu object
// validate day exists, meal exists, recipe exists, ingredients exists, ingredient exists, quantity is a number, unit exists

const validateMenu = (data: string) => {

  if (!data) {
    throw new Error('Invalid menu data');
  }
  let menuJson: IMenu;

  try {
    menuJson = JSON.parse(data);
    console.log('Menu:', menuJson);
  } catch (error) {
    if (error instanceof SyntaxError) {
      console.error("Error parsing JSON data:", error.message);
      // Set menu to a default value or handle the error as needed
      menuJson = {
        name: '',
        menu: {
          monday: {
            lunch: [],
            dinner: []
          },
          tuesday: {
            lunch: [],
            dinner: []
          },
          wednesday: {
            lunch: [],
            dinner: []
          },
          thursday: {
            lunch: [],
            dinner: []
          },
          friday: {
            lunch: [],
            dinner: []
          },
          saturday: {
            lunch: [],
            dinner: []
          },
          sunday: {
            lunch: [],
            dinner: []
          }
        }
      };
    } else {
      // Re-throw the error if it's not a SyntaxError
      throw error;
    }
  }

 

  const name = menuJson.name;
  const menu = menuJson.menu;

  if (!name || !menu) {
    throw new Error('Invalid menu data');
  }

  const days: (keyof IMenu['menu'])[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  // Assuming `IMeal` has keys like 'lunch' and 'dinner', define them explicitly
  type MealType = 'lunch' | 'dinner';

  // Then, ensure `meals` is of type `MealType[]`
  const meals: MealType[] = ['lunch', 'dinner'];


  for (const day of days) {
    if (!menu[day]) {
      throw new Error(`Invalid menu data: ${day} is missing`);
    }

    for (const meal of meals) {
      if (!menu[day][meal]) {
        menu[day][meal] = [];
//        throw new Error(`Invalid menu data: ${meal} is missing from ${day}`);
      }

      for (const recipe of menu[day][meal]) {
        if (!recipe.name || !recipe.ingredients) {
          throw new Error(`Invalid menu data: recipe is missing name or ingredients`);
        }

        for (const ingredient of recipe.ingredients) {
          if (!ingredient.name || !ingredient.quantity || !ingredient.unit) {
            throw new Error(`Invalid menu data: ingredient is missing name, quantity or unit`);
          }
        }
      }
    }
  }

  return menuJson as IMenu;
}




// verify if uints exist in the database if not create them

const uploadUnits = async (db: BaseDatabase, units: string[]) => {
  for (const unit of units) {
    const existingUnit = await db.getUnit(unit);
    if (!existingUnit) {
      await db.createUnit(unit);
    }
  }
};

// verify if ingredients exist in the database if not create them

const uploadIngredients = async (db: BaseDatabase, ingredients: IIngredient[]) => {
  for (const ingredient of ingredients) {
    const existingIngredient = await db.getIngredientByName(ingredient.name);
    if (!existingIngredient) {
      await db.createIngredient(ingredient);
    }
  }
};

// verify if recipes exist in the database if not create them

const uploadRecipes = async (db: BaseDatabase, recipes: IRecipe[]) => {
  for (const recipe of recipes) {
    const existingRecipe = await db.getRecipeByName(recipe.name);
    if (!existingRecipe) {
      await db.createRecipe(recipe);
    }
  }
};

// upload the menu to the database

const uploadMenu = async (db: BaseDatabase, jsonMenu: string) => {


  try {
    let weeklyMenu =  validateMenu(jsonMenu);

    const name = weeklyMenu.name;
    const menu  = weeklyMenu.menu;    

    for (const day of Object.values(menu)) {
      for (const meal of Object.values(day)) {
        for (const recipe of meal) {
          const units = recipe.ingredients.map((ingredient: IIngredientList) => ingredient.unit);
          await uploadUnits(db, units);
          await uploadIngredients(db, recipe.ingredients);
          await uploadRecipes(db, [recipe]);
        }
      }
    }
    // transform recipes entries remove all data from recipes and set recipe._id and recipe.name from db
    // Assuming IMeal is an enum or has a toString method that returns a valid key
    // Before the loop, assert the structure of menuData to have keys of specific days and meals
    type DayKeys = keyof typeof menu;
    type MealKeys = 'lunch' | 'dinner'; // Assuming these are the only meal types

    for (const dayKey in menu) {
      const day = menu[dayKey as DayKeys];
      for (const mealKey in menu[dayKey as DayKeys]) {
        const meal = day[mealKey as MealKeys];
        weeklyMenu.menu[dayKey as DayKeys][mealKey as MealKeys] = [];
        for (const recipe of meal) {
          const dbRecipe = await db.getRecipeByName(recipe.name);
          if (!dbRecipe) {
            throw new Error(`Recipe not found: ${recipe.name}`);
          }
          // Ensure TypeScript knows the structure of weeklyMenu.menu for indexing
          if (!weeklyMenu.menu[dayKey as DayKeys][mealKey as MealKeys]) {
            weeklyMenu.menu[dayKey as DayKeys][mealKey as MealKeys] = [];
          }
          weeklyMenu.menu[dayKey as DayKeys][mealKey as MealKeys].push({
            _id: dbRecipe._id,
            name: dbRecipe.name
          });
        }
      }
    }
    console.log('Weekly menu:', JSON.stringify(weeklyMenu));
    await db.createMenu(weeklyMenu);
  }
  catch (error) {
    console.error('Error uploading menu:', error);
    throw error;
  }
};

export default {
  uploadMenu,
};