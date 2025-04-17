

import { MongoClient, Db, Collection, ObjectId, GridFSBucket, Document } from 'mongodb';
import { IUser } from './user';
import { IIngredient } from './ingredients';
import { IUnit } from './units';
import { IRecipe, ICategories } from './recipes';
import { IMenu } from './menus';
import { IAllergenic } from './allergenics';
import { INote } from './notes';
import { Readable } from 'stream';
import logger from './logger';


type MealType = 'lunch' | 'dinner';
type DayType = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

export class MongoDatabase {
  private client: MongoClient;
  private db?: Db;
  private session?: any;
  private usersCollection?: Collection<IUser>;
  private ingredientsCollection?: Collection<IIngredient>;
  private unitsCollection?: Collection<IUnit>;
  private recipesCollection?: Collection<IRecipe>;
  private menusCollection?: Collection<IMenu>;
  private allergenicsCollection?: Collection<IAllergenic>;
  private notesCollection?: Collection<INote>;
  private GridFSBucket?: GridFSBucket;

  constructor(mongoURI: string) {
    if (!mongoURI) {
      throw new Error('MongoDB URI is required');
    }
    try {
    this.client = new MongoClient(mongoURI);
    } catch (error) {
      logger.error('Error creating MongoClient:', error);
      logger.error(`MongoDB URI: ${mongoURI}`);
      throw error;
    }
  }

  async init() {
    if (!this.usersCollection) {
      throw new Error('Database not connected');
    }
    logger.info('Initializing database...');
    try {
      await this.getUsers();
    } catch (error) {
      logger.error('Error initializing database:', error);
      throw error;
    }
    logger.info('Database initialized');

  }

  async connect(dbName?: string) {
    logger.info('Connecting to database...');
    try {
      await this.client.connect();
      if (!dbName) {
        dbName = 'testdb';
      }
      this.db = this.client.db(dbName);
      this.session = this.client.startSession();
      this.usersCollection = this.db.collection('users');
      this.ingredientsCollection = this.db.collection('ingredients');
      this.unitsCollection = this.db.collection('units');
      this.recipesCollection = this.db.collection('recipes');
      this.menusCollection = this.db.collection('menus');
      this.allergenicsCollection = this.db.collection('allergenics');
      this.notesCollection = this.db.collection('notes');
      this.GridFSBucket = new GridFSBucket(this.db, { bucketName: 'images' });
      logger.info('Connected to database');
    } catch (error) {
      logger.error('Error connecting to database:', error);
      logger.error(`MongoDB URI: ${dbName}`);
      throw error;
    }
  }

  async disconnect() {
    if (this.session) {
      await this.session.endSession();
    }
    await this.client.close();
  }

  async createUser(user: IUser): Promise<IUser> {
    if (this.usersCollection) {
      if (user._id !== undefined) {
        // Remove _id if it exists
        delete user._id;
      }
      const result = await this.usersCollection.insertOne(user);
      return { ...user, _id: result.insertedId.toString() };
    } else {
      throw new Error('Database not connected');
    }
  }

  async getUsers(): Promise<IUser[]> {
    if (!this.usersCollection) {
      throw new Error('Database not connected');
    }
    return this.usersCollection.find().toArray();
  }

  async getUserByName(name: string): Promise<IUser | null> {
    if (!this.usersCollection) {
      throw new Error('Database not connected');
    }
    return this.usersCollection.findOne({ name });
  }

  async getUserById(_id: string): Promise<IUser | null> {
    if (!this.usersCollection) {
      throw new Error('Database not connected');
    }
    return this.usersCollection.findOne({ _id: new ObjectId(_id) as any });
  }

  async updateUserById(_id: string, update: Partial<IUser>): Promise<IUser | null> {
    if (!this.usersCollection) {
      throw new Error('Database not connected');
    }
    const result = await this.usersCollection.findOneAndUpdate(
      { _id: new ObjectId(_id) as any },
      { $set: update },
      { returnDocument: 'after' }
    );
    return result ? { ...result, _id: result._id.toString() } : null;
  }
  async updateUserByName(name: string, update: Partial<IUser>): Promise<IUser | null> {
    if (!this.usersCollection) {
      throw new Error('Database not connected');
    }
    const result = await this.usersCollection.findOneAndUpdate(
      { name },
      { $set: update },
      { returnDocument: 'after' }
    );
    return result ? { ...result, _id: result._id.toString() } : null;
  }

  async deleteUser(name: string): Promise<boolean> {
    if (!this.usersCollection) {
      throw new Error('Database not connected');
    }
    const result = await this.usersCollection.deleteOne({ name });
    return result.deletedCount === 1;
  }

  async checkPassword(name: string, password: string): Promise<boolean> {
    if (!this.usersCollection) {
      throw new Error('Database not connected');
    }
    const user = await this.usersCollection.findOne({ name });
    return user ? user.password === password : false;
  }

  async upadatePassword(name: string, password: string): Promise<boolean> {
    if (!this.usersCollection) {
      throw new Error('Database not connected');
    }
    const result = await this.usersCollection.findOneAndUpdate(
      { name },
      { $set: { password } },
      { returnDocument: 'after' }
    );
    return result ? result.password === password : false;
  }

  async getCategories(): Promise<ICategories[]> {
    if (!this.recipesCollection) {
      throw new Error('Database not connected');
    }

    const cursor = this.recipesCollection.aggregate([
      {
        $unwind: "$categories"
      },
      {
        $group: {
          _id: "$categories.category", // Group by category name
          values: { $push: "$categories.values" } // Use $push to gather all values
        }
      },
      {
        $project: {
          _id: 0,
          category: "$_id",
          values: {
            // Use $reduce to flatten the array of arrays
            $reduce: {
              input: "$values",
              initialValue: [],
              in: { $setUnion: ["$$value", "$$this"] }
            }
          }
        }
      }
    ]);

    const result = await cursor.toArray();
    return result as ICategories[];
  }

  async createIngredient(ingredient: IIngredient): Promise<IIngredient> {
    if (this.ingredientsCollection) {
      const result = await this.ingredientsCollection.insertOne(ingredient);
      return { ...ingredient, _id: result.insertedId.toString() };
    } else {
      throw new Error('Database not connected');
    }
  }

  async getIngredients(): Promise<IIngredient[]> {
    if (!this.ingredientsCollection) {
      throw new Error('Database not connected');
    }
    return this.ingredientsCollection.find().sort({ name: 1 }).toArray();
  }

  async getIngredientByName(name: string): Promise<IIngredient | null> {
    if (!this.ingredientsCollection) {
      throw new Error('Database not connected');
    }
    return this.ingredientsCollection.findOne({ name });
  }

  async getIngredientById(_id: string | ObjectId): Promise<IIngredient | null> {
    if (!this.ingredientsCollection) {
      throw new Error('Database not connected');
    }
    return this.ingredientsCollection.findOne({ _id: new ObjectId(_id) as any });
  }

  async updateIngredientById(_id: string | ObjectId, update: Partial<IIngredient>): Promise<IIngredient | null> {
    if (!this.ingredientsCollection) {
      throw new Error('Database not connected');
    }
    const result = await this.ingredientsCollection.findOneAndUpdate(
      { _id: new ObjectId(_id) as any },
      { $set: update },
      { returnDocument: 'after' }
    );
    return result ? { ...result, _id: result._id.toString() } : null;
  }

  async updateIngredientByName(name: string, update: Partial<IIngredient>): Promise<IIngredient | null> {
    if (!this.ingredientsCollection) {
      throw new Error('Database not connected');
    }
    const result = await this.ingredientsCollection.findOneAndUpdate(
      { name },
      { $set: update },
      { returnDocument: 'after' }
    );
    return result ? { ...result, _id: result._id.toString() } : null;
  }

  async deleteIngredient(_id: string | ObjectId): Promise<boolean> {
    if (!this.ingredientsCollection) {
      throw new Error('Database not connected');
    }
    const result = await this.ingredientsCollection.deleteOne({ _id: new ObjectId(_id) as any });
    return result.deletedCount === 1;
  }

  async checkAlergenics(_id: string | ObjectId, allergenics: string[]): Promise<boolean> {
    if (!this.ingredientsCollection) {
      throw new Error('Database not connected');
    }
    const ingredient = await this.ingredientsCollection.findOne({ _id: new ObjectId(_id) as any });
    return ingredient ? ingredient.allergenics === allergenics : false;
  }

  async updateAlergenics(_id: string | ObjectId, allergenics: string[]): Promise<boolean> {
    if (!this.ingredientsCollection) {
      throw new Error('Database not connected');
    }
    const result = await this.ingredientsCollection.findOneAndUpdate(
      { _id: new ObjectId(_id) as any },
      { $set: { allergenics } },
      { returnDocument: 'after' }
    );
    return result ? result.allergenics === allergenics : false;
  }

  async deleteAlergenics(_id: string): Promise<boolean> {
    if (!this.ingredientsCollection) {
      throw new Error('Database not connected');
    }
    const result = await this.ingredientsCollection.findOneAndUpdate(
      { id: new ObjectId(_id) as any },
      { $unset: { allergenics: '' } },
      { returnDocument: 'after' }
    );
    return result ? result.allergenics === undefined : false;
  }

  async getUnits(): Promise<IUnit[]> {
    if (!this.unitsCollection) {
      throw new Error('Database not connected');
    }
    return this.unitsCollection.find().sort({ unit: 1 }).toArray();
  }

  async createUnit(unit: string): Promise<IUnit> {
    if (this.unitsCollection) {
      const result = await this.unitsCollection.insertOne({ unit: unit });
      return { unit: unit, _id: result.insertedId.toString() };
    }
    else {
      throw new Error('Database not connected');
    }
  }

  async getUnit(unit: string): Promise<IUnit | null> {
    if (!this.unitsCollection) {
      throw new Error('Database not connected');
    }
    return this.unitsCollection ? this.unitsCollection.findOne({ unit }) : null;
  }

  async getRecipes(): Promise<IRecipe[]> {
    if (!this.recipesCollection) {
      throw new Error('Database not connected');
    }
    return this.recipesCollection.find().sort({ name: 1 }).toArray();
  }

  async getRecipesWithIngredient(ingredientId: string): Promise<Document[]> {
    if (!this.ingredientsCollection) {
      throw new Error('Database not connected');
    }
    const result = this.ingredientsCollection.aggregate([
      {
        $match: {
          _id: new ObjectId(ingredientId) // Replace with the actual ObjectId of the ingredient you want to filter for
        }
      },
      {
        $lookup: {
          from: "recipes",
          let: { ingredientId: { $toString: "$_id" } },
          pipeline: [
            { $unwind: "$ingredients" },
            { $match: { $expr: { $eq: ["$ingredients._id", "$$ingredientId"] } } }
          ],
          as: "recipes"
        }
      },
      {
        $project: {
          _id: 1,
          name: 1,
          recipes: {
            _id: 1,
            name: 1
          }
        }
      }
    ]).toArray();
    return result;
  }

  async createRecipe(recipe: IRecipe): Promise<IRecipe> {
    if (!this.recipesCollection || !this.ingredientsCollection) {
      throw new Error('Database not connected');
    }
    if (!recipe.ingredients) {
      recipe.ingredients = [];
    }
    for (let i = 0; i < recipe.ingredients.length; i++) {
      const ingredient = recipe.ingredients[i];
      if (!ingredient._id) {
        // Assuming ingredient.name exists and is unique
        const foundIngredient = await this.ingredientsCollection.findOne({ name: ingredient.name });
        if (foundIngredient) {
          recipe.ingredients[i]._id = new ObjectId(foundIngredient._id.toString());
        } else {
          // Handle the case where the ingredient is not found (optional)
          throw new Error(`Ingredient not found: ${ingredient.name}`);
        }
        // find unit by unit name
        const foundUnit = await this.getUnit(ingredient.unit);
        if (foundUnit) {
          if (foundUnit.unit !== recipe.ingredients[i].unit &&
            foundUnit.unit.toLowerCase() === recipe.ingredients[i].unit.toLowerCase()) {
            recipe.ingredients[i].unit = foundUnit.unit;
            // Handle the case where the unit is not found (optional)
            throw new Error(`Unit not found: ${ingredient.unit}`);
          }
        }
      }
    }
    const result = await this.recipesCollection.insertOne(recipe);
    return { ...recipe, _id: result.insertedId.toString() };
  }

  async getRecipeByName(name: string): Promise<IRecipe | null> {
    if (!this.recipesCollection) {
      throw new Error('Database not connected');
    }
    return this.recipesCollection.findOne({ name });
  }

  async getRecipeById(_id: string | ObjectId): Promise<IRecipe | null> {
    if (!this.recipesCollection) {
      throw new Error('Database not connected');
    }
    return this.recipesCollection.findOne({ _id: new ObjectId(_id) as any });
  }

  async updateRecipeById(_id: string | ObjectId, update: Partial<IRecipe>): Promise<IRecipe | null> {
    if (!this.recipesCollection) {
      throw new Error('Database not connected');
    }
    update._id = new ObjectId(_id);
    const result = await this.recipesCollection.findOneAndUpdate(
      { _id: new ObjectId(_id) },
      { $set: update },
      { returnDocument: 'after' }
    );
    return result ? { ...result, _id: result._id.toString() } : null;
  }

  async deleteRecipe(_id: string | ObjectId): Promise<boolean> {
    if (!this.recipesCollection) {
      throw new Error('Database not connected');
    }
    const result = await this.recipesCollection.deleteOne({ _id: new ObjectId(_id) as any });
    return result.deletedCount === 1;
  }

  async changeRecipesIngredientUnit(oldUnit: string, newUnit: string) {

    if (!this.recipesCollection || !this.unitsCollection) {
      throw new Error('Database not connected');
    }
    try {
      await this.session.startTransaction();
      // find _id from unit old name
      const unitToDelete = await this.unitsCollection.findOne({
        unit: oldUnit
      });

      if (!unitToDelete) {
        throw new Error(`Unit not found: ${oldUnit}`);
      }

      // find _id from unit new name
      const unitDest = await this.unitsCollection.findOne({
        unit: newUnit
      });


      const updateResult = await this.recipesCollection.updateMany(
        { 'ingredients.unit': oldUnit }, // Find recipes with the old unit
        { $set: { 'ingredients.$[elem].unit': newUnit } }, // Set the new unit
        { arrayFilters: [{ 'elem.unit': oldUnit }] } // Specify which array elements to update
      );

      //delete old unit

      if (unitToDelete._id === undefined) {
        throw new Error(`Unit not found: ${oldUnit}`);
      } else {
        if (unitDest === null) {
          // rename old unit to new unit
          const Result = await this.unitsCollection.updateOne(
            { _id: unitToDelete._id },
            { $set: { unit: newUnit } }
          );
        } else {
          const deleteResult = await this.unitsCollection.deleteOne(
            { _id: unitToDelete._id }
          );
        }
        logger.info(`Updated ${updateResult.modifiedCount} documents.`);
      }
      await this.session.commitTransaction();
    }
    catch (error) {
      await this.session.abortTransaction();
      logger.error('Error updating documents:', error);
    } finally {

    }
  }

  async changeRecipesIngredientName(oldName: string, newName: string) {
    if (!this.recipesCollection) {
      throw new Error('Database not connected');
    }
    if (!this.ingredientsCollection) {
      throw new Error('Database not connected');
    }
    try {
      await this.session.startTransaction();
      var newId = undefined;
      // find _id from ingredient name
      const oldIngredient = await this.ingredientsCollection.findOne(
        { name: oldName }
      );
      if (!oldIngredient) {
        throw new Error(`Ingredient not found: ${oldName}`);
      }
      const newIngredient = await this.ingredientsCollection.findOne({ name: newName });
      if (!newIngredient) {
        // new ingredient name does not exist name should be updated
        newId = oldIngredient._id;
        const updateResult = await this.ingredientsCollection.updateOne(
          { _id: oldIngredient._id },
          { $set: { name: newName } }
        );
        logger.info(`Ingredient Updated ${updateResult.modifiedCount} documents.`);
      } else {
        // new ingredient name exists
        newId = newIngredient._id;
        // delete old ingredient
        const deleteResult = await this.ingredientsCollection.deleteOne(
          { _id: oldIngredient._id }
        );
        logger.info(`Ingredient Deleted ${deleteResult.deletedCount} documents.`);
      }
      // update all recipes with the old ingredient name
      const updateResult = await this.recipesCollection.updateMany(
        { 'ingredients.name': oldName }, // Find recipes with the old ingredient name
        { $set: { 'ingredients.$[elem].name': newName, 'ingredients.$[elem]._id': new ObjectId(newId) } }, // Set the new name and _id
        { arrayFilters: [{ 'elem.name': oldName }] } // Specify which array elements to update
      );


      await this.session.commitTransaction();
      logger.info(`Recipes Updated ${updateResult.modifiedCount} documents.`);
      return true
    } catch (error) {
      await this.session.abortTransaction();
      logger.error('Error updating documents:', error);
      return false
    }
  }

  async changeRecipeName(oldName: string, newName: string) {
    if (!this.menusCollection || !this.recipesCollection) {
      throw new Error('Database not connected');
    }

    try {
      await this.session.startTransaction();
      // find _id from new recipe name
      const newRecipe = await this.recipesCollection.findOne(
        { name: newName }
      );
      if (!newRecipe) {
        throw new Error(`Recipe not found: ${newName}`);
      }

      // update all recipes with the old ingredient name
      // search old name to all days and meals
      const updateResult = await this.menusCollection.updateMany(
        { 'menu.day.meals.name': oldName }, // Assuming a structure where `menu` contains `day`, which contains `meals`, which has a `name`. Adjust the path according to your actual document structure.
        {
          $set: {
            'menu.$[day].meals.$[meal].name': newName, // Use placeholders from arrayFilters in the update path
            'menu.$[day].meals.$[meal]._id': newRecipe._id // Same here for _id
          }
        },
        {
          arrayFilters: [
            { 'day.meals.name': oldName }, // Placeholder `day` for elements in `menu` array matching the condition
            { 'meal.name': oldName } // Placeholder `meal` for elements in `meals` array matching the condition
          ]
        }
      );
      await this.session.commitTransaction();
      logger.info(`Updated ${updateResult.modifiedCount} documents.`);
    } catch (error) {
      await this.session.abortTransaction();
      logger.error('Error updating documents:', error);
    }
  }

  async deleteIngredients(_id: string): Promise<boolean> {
    if (!this.recipesCollection) {
      throw new Error('Database not connected');
    }
    const result = await this.recipesCollection.findOneAndUpdate(
      { id: new ObjectId(_id) as any },
      { $unset: { ingredients: '' } },
      { returnDocument: 'after' }
    );
    return result ? result.ingredients === undefined : false;
  }

  async getAlergenics(): Promise<IAllergenic[]> {
    if (!this.allergenicsCollection) {
      throw new Error('Database not connected');
    }
    return this.allergenicsCollection.find().toArray();
  }

  async createNote(note: INote): Promise<INote> {
    if (!this.notesCollection) {
      throw new Error('Database not connected');
    }
    note._id = new ObjectId();
    note.createdAt = new Date();
    note.updatedAt = new Date();
    await this.notesCollection.insertOne(note);
    return note;
  }

  async getNotesByUser(userId: string): Promise<INote[]> {
    if (!this.notesCollection) {
      throw new Error('Database not connected');
    }
    return this.notesCollection.find({ userId }).toArray();
  }

  async getNote(noteId: string): Promise<INote | null> {
    if (!this.notesCollection) {
      throw new Error('Database not connected');
    }
    return this.notesCollection.findOne({ _id: new ObjectId(noteId) });
  }

  async getNoteByRecipeId(recipeId: string): Promise<INote[]> {
    if (!this.notesCollection) {
      throw new Error('Database not connected');
    }
    return this.notesCollection
      .find({ recipeId: new ObjectId(recipeId) })
      .sort({ recipeId: 1, createdAt: -1 })
      .toArray();
  }

  async countNotesByRecipeId(recipeId: string): Promise<number> {
    if (!this.notesCollection) {
      throw new Error('Database not connected');
    }
    return this.notesCollection.countDocuments({ recipeId: new ObjectId(recipeId) });
  }

  async updateNote(noteId: string, updatedNote: Partial<INote>): Promise<void> {
    if (!this.notesCollection) {
      throw new Error('Database not connected');
    }
    updatedNote.updatedAt = new Date();
    if (updatedNote._id) {
      delete updatedNote._id;
    }
    if (typeof updatedNote.recipeId === 'string') {
      updatedNote.recipeId = new ObjectId(updatedNote.recipeId);
    }
    if (typeof updatedNote.createdAt === 'string') {
      updatedNote.createdAt = new Date(updatedNote.createdAt);
    }
    await this.notesCollection.updateOne(
      { _id: new ObjectId(noteId) },
      { $set: updatedNote }
    );
  }

  async deleteNote(noteId: string): Promise<void> {
    if (!this.notesCollection) {
      throw new Error('Database not connected');
    }
    await this.notesCollection.deleteOne({ _id: new ObjectId(noteId) });
  }

  async getMenus(): Promise<IMenu[]> {
    if (!this.menusCollection) {
      throw new Error('Database not connected');
    }
    return this.menusCollection.find().toArray();
  }

  async getMenusList(): Promise<IMenu[]> {
    if (!this.menusCollection) {
      throw new Error('Database not connected');
    }
    return this.menusCollection.find({}, { projection: { _id: 1, name: 1 } }).toArray();
  }

  async createMenu(menu: IMenu): Promise<IMenu> {
    if (this.menusCollection) {
      const result = await this.menusCollection.insertOne(menu);
      return { ...menu, _id: result.insertedId.toString() };
    } else {
      throw new Error('Database not connected');
    }
  }

  async getMenuByName(name: string): Promise<IMenu | null> {
    if (!this.menusCollection) {
      throw new Error('Database not connected');
    }
    return this.menusCollection.findOne({ name });
  }

  async getMenuById(_id: string | ObjectId): Promise<IMenu | null> {
    if (!this.menusCollection) {
      throw new Error('Database not connected');
    }
    return this.menusCollection.findOne({ _id: new ObjectId(_id) as any });
  }

  async updateMenuById(_id: string | ObjectId, update: Partial<IMenu>): Promise<IMenu | null> {
    if (!this.menusCollection) {
      throw new Error('Database not connected');
    }
    const result = await this.menusCollection.findOneAndUpdate(
      { _id: new ObjectId(_id) as any },
      { $set: update },
      { returnDocument: 'after' }
    );
    return result ? { ...result, _id: result._id.toString() } : null;
  }

  async deleteMenu(_id: string | ObjectId): Promise<boolean> {
    if (!this.menusCollection) {
      throw new Error('Database not connected');
    }
    const result = await this.menusCollection.deleteOne({ _id: new ObjectId(_id) as any });
    return result.deletedCount === 1;
  }

  // get a complete menu with join integration of recipes and ingredients to menu whrough _id of recipe
  async getMenuWithRecipes(_id: string | ObjectId): Promise<IMenu | null> {
    if (!this.menusCollection) {
      throw new Error('Database not connected');
    }
    const menu = await this.menusCollection.findOne({ _id: new ObjectId(_id) as any });
    if (!menu) {
      return null;
    }

    const days: (keyof typeof menu.menu)[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    for (const day of days) {
      const meal = menu.menu[day];
      for (const mealType of ['lunch', 'dinner'] as MealType[]) {
        const recipes = meal[mealType];
        if (this.recipesCollection) {
          for (let i = 0; i < recipes.length; i++) {
            if (recipes[i] && recipes[i]._id && recipes[i]._id !== undefined) {
              const recipe = await this.recipesCollection.findOne({ _id: recipes[i]._id });
              if (recipe) {
                recipes[i] = recipe;
              }

            }
          }
        }
      }
    }
    return menu;
  }

  async insertMenuSimpleRecipes(menu: IMenu): Promise<IMenu> {
    if (!this.menusCollection) {
      throw new Error('Database not connected');
    }

    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as DayType[];
    for (const day of days) {
      if (menu.menu[day]) {
        const meal = menu.menu[day];
        for (const mealType of ['lunch', 'dinner'] as MealType[]) {
          const recipes = meal[mealType];
          if (this.recipesCollection) {
            for (let i = 0; i < recipes.length; i++) {
              if (recipes[i] && recipes[i]._id && recipes[i]._id !== undefined) {
                const recipeId = recipes[i]._id as string;
                const recipe = await this.recipesCollection.findOne({ _id: recipeId });
                if (recipe) {
                  recipes[i] = { _id: recipe._id, name: recipe.name };
                }
              } else {
                if (recipes[i] && recipes[i]._id && recipes[i].name) {
                  const recipe = await this.recipesCollection.findOne({ name: recipes[i].name });
                  if (recipe) {
                    recipes[i] = { _id: recipe._id, name: recipe.name };
                  }
                }
              }
            }
          }
        }
      }
    }
    const result = await this.menusCollection.insertOne(menu);
    return { ...menu, _id: result.insertedId.toString() };
  }

  // update a menu with only _id and name of recipes
  async updateMenuSimpleRecipes(_id: string | ObjectId, update: Partial<IMenu>): Promise<IMenu | null> {
    if (!this.menusCollection) {
      throw new Error('Database not connected');
    }

    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as DayType[];
    for (const day of days) {
      if (update.menu && update.menu[day]) {
        const meal = update.menu[day];
        for (const mealType of ['lunch', 'dinner'] as MealType[]) {
          const recipes = meal[mealType];
          if (this.recipesCollection) {
            for (let i = 0; i < recipes.length; i++) {
              if (recipes[i] && recipes[i]._id && recipes[i]._id !== undefined) {
                const recipeId = new ObjectId(recipes[i]._id as string).toString();
                const recipe = await this.recipesCollection.findOne({ _id: recipeId });
                if (recipe) {
                  recipes[i] = { _id: recipe._id, name: recipe.name };
                }
              }
            }
          }
        }
      }
    }
    logger.info('update:', update);
    const result = await this.menusCollection.findOneAndUpdate(
      { _id: new ObjectId(_id) as any },
      { $set: update },
      { returnDocument: 'after' }
    );
    return result ? { ...result, _id: result._id.toString() } : null;
  }

  async updateMenuDay(_id: string | ObjectId, day: String, recipesDay: any): Promise<IMenu | null> {
    if (!this.menusCollection) {
      throw new Error('Database not connected');
    }
    const menuId = typeof _id === 'string' ? new ObjectId(_id) : _id;
    var simplifiedRecipesDay = {
      lunch: [],
      dinner: []
    };

    // Assuming each recipe has a mealType property
    simplifiedRecipesDay.lunch = recipesDay.lunch.map(({ _id, name }: IRecipe) => ({ _id: new ObjectId(_id), name }));
    simplifiedRecipesDay.dinner = recipesDay.dinner.map(({ _id, name }: IRecipe) => ({ _id: new ObjectId(_id), name }));

    const update = { $set: { [`menu.${day}`]: simplifiedRecipesDay } };

    const result = await this.menusCollection.findOneAndUpdate({ _id: menuId as any }, update, { returnDocument: 'after' });
    return result ? { ...result, _id: result._id.toString() } : null;
  }

  async insertImage(imageName: string, imageStream: Readable): Promise<ObjectId> {

    if (!this.GridFSBucket) {
      throw new Error('Database not connected');
    }
    const uploadStream = this.GridFSBucket.openUploadStream(imageName);
    const id = uploadStream.id;
    await new Promise((resolve, reject) => {
      ((imageStream as unknown) as NodeJS.ReadableStream).pipe(uploadStream)
        .on('error', reject)
        .on('finish', resolve);
    });
    return id;
  }

  async getImage(id: string) {
    if (!this.GridFSBucket) {
      throw new Error('Database not connected');
    }

    try {
      const downloadStream = this.GridFSBucket.openDownloadStream(new ObjectId(id));
      return downloadStream;
    } catch (error) {
      const err = error as Error & { code?: string; name?: string };
      if (err.name === 'MongoRuntimeError' && err.message.includes('FileNotFound')) {
        logger.info('Image not found');
        throw new Error('Image not found');
      }
      throw err;
    }
  }

  async deleteImage(id: string): Promise<void> {
    if (!this.GridFSBucket) {
      throw new Error('Database not connected');
    }
    return this.GridFSBucket.delete(new ObjectId(id));
  }
}