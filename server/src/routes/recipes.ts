// recipes.ts
import express, { Request, Response, Router } from 'express';
import { MongoDatabase as BaseDatabase } from '../lib/mongo-database';
import { basicAuthMiddleware } from '../lib/basicauth';
import { Recipe } from '../lib/recipes';
import { ObjectId } from 'mongodb';
import logger from '../lib/logger';

export const recipesRouter = Router();

recipesRouter.get('/recipes', basicAuthMiddleware, async (req: Request, res: Response) => {
    try {
        const db = (req.app.locals.db as BaseDatabase);
        const recipes = await db.getRecipes();
        res.json(recipes.map((recipe) => recipe));
    } catch (error) {
        console.error('Error en recuperar recipes:', error);
        res.status(500).json({ error: 'Error en recuperar recipes.' });
    }
});

recipesRouter.get('/recipes/byname/:nom', basicAuthMiddleware, async (req: Request, res: Response) => {
    try {
        const db = (req.app.locals.db as BaseDatabase);
        const nom = req.params.nom;
        const recipe = await db.getRecipeByName(nom);
        if (recipe === null) {
            res.status(404).json({ error: 'recipe no trobat.' });
        } else {
            res.json(recipe);
        }
    } catch (error) {
        console.error('Error en recuperar recipe:', error);
        res.status(500).json({ error: 'Error en recuperar recipe.' });
    }
});

recipesRouter.get('/recipes/byid/:_id', basicAuthMiddleware, async (req: Request, res: Response) => {
    try {
        const db = (req.app.locals.db as BaseDatabase);
        const _id = req.params._id;
        const recipe = await db.getRecipeById(_id);
        if (recipe === null) {
            res.status(404).json({ error: 'recipe no trobat.' });
        } else {
            res.json(recipe);
        }
    } catch (error) {
        console.error('Error en recuperar recipe:', error);
        res.status(500).json({ error: 'Error en recuperar recipe.' });
    }
});

recipesRouter.post('/recipes', express.json(), async (req: Request, res: Response) => {
    try {
        const db = (req.app.locals.db as BaseDatabase);
        var recipeObj = new Recipe(req.body)

        // Validacions senzilles
        if (!recipeObj.info.name) {
            return res.status(400).json({ error: 'Falten dades d\'recipe.' });
        }

        // Comprova que l'recipe no existeixi ja
        const existingRecipe = await db.getRecipeByName(recipeObj.info.name);
        if (existingRecipe !== null) {
            return res.status(409).json({ error: 'L\'recipe ja existeix.' });
        }

        // Crea l'recipe
        //  async createRecipe(Recipe: IRecipe): Promise<IRecipe> {
        if (!recipeObj.info._id || recipeObj.info._id === '') {
            recipeObj.info._id = undefined;
        }
        const recipe = await db.createRecipe(recipeObj.info);
        res.status(201).json(recipe);
    } catch (error) {
        console.error('Error en crear recipe:', error);
        res.status(500).json({ error: 'Error en crear recipe.' });
    }
});

recipesRouter.put('/recipes/:_id', basicAuthMiddleware, express.json(), async (req: Request, res: Response) => {
    try {
        const db = (req.app.locals.db as BaseDatabase);
        const _id = req.params._id;
        var recipeObj = new Recipe(req.body)
        recipeObj.update({ _id: _id })

        // Comprova que l'recipe existeixi
        const recipe = await db.getRecipeById(_id);
        if (recipe === null) {
            return res.status(404).json({ error: 'recipe no trobat.' });
        }
        await db.updateRecipeById(recipe._id as string, recipeObj.info);
        res.json({ _id: recipe._id });
    } catch (error) {
        console.error('Error en actualitzar recipe:', error);
        res.status(500).json({ error: 'Error en actualitzar recipe.' });
    }
});

recipesRouter.delete('/recipes/:_id', basicAuthMiddleware, async (req: Request, res: Response) => {
    try {
        const db = (req.app.locals.db as BaseDatabase);
        const _id = req.params._id;

        // Comprova que l'recipe existeixi
        const recipe = await db.getRecipeById(_id);
        if (recipe === null) {
            return res.status(404).json({ error: 'recipe no trobat.' });
        }

        // Elimina l'recipe
        if (recipe.name !== null) {
            await db.deleteRecipe(_id);
            res.status(204).json({ _id: recipe._id });
        }
    } catch (error) {
        console.error('Error en eliminar recipe:', error);
        res.status(500).json({ error: 'Error en eliminar recipe.' });
    }
});

// Renombrar recipe a tots els menus que l'inclouen
recipesRouter.get('/recipes/rename', basicAuthMiddleware, async (req: Request, res: Response) => {
    try {
        const db = (req.app.locals.db as BaseDatabase);
        const { oldName, newName } = req.body as { oldName: string, newName: string };

        // Verifica que oldName i newName siguin proporcionats
        if (!oldName || !newName) {
            return res.status(400).json({ message: "Cal proporcionar oldName i newName." });
        }

        await db.changeRecipeName(oldName, newName)
        res.status(200).json({ success: true });
    } catch (error) {
        console.error('Error en renombrar recipe:', error);
        res.status(500).json({ error: 'Error en renombrar recipe.' });
    }
});

recipesRouter.get('/recipes/ingredient/:_id', basicAuthMiddleware, async (req: Request, res: Response) => {
    try {
        const db = (req.app.locals.db as BaseDatabase);
        const _id = req.params._id;

        // Comprova que el parametre existeixi

        if (_id === null) {
            return res.status(400).json({ error: 'Falta id de l\'ingredient.' });
        } else {
            let recipes = await db.getRecipesWithIngredient(_id);
            res.status(200).json(recipes.map((recipe) => recipe));

        }
    } catch (error) {
        logger.error('Error al recuperar receptes:', error);
        console.log('Error al recuperar receptes:', error);
        res.status(500).json({ error: 'Error al recuperar receptes.' });
    }
});

// Get notes for a recipe
recipesRouter.get('/recipes/:recipeId/notes', basicAuthMiddleware, async (req: Request, res: Response) => {
    try {
        const db = (req.app.locals.db as BaseDatabase);
        const recipeId = req.params.recipeId;
        const notes = await db.getNoteByRecipeId(recipeId);
        res.json(notes);
    } catch (error) {
        console.error('Error fetching notes:', error);
        res.status(500).json({ error: 'Error fetching notes.' });
    }
});

// Add a note to a recipe
recipesRouter.post('/recipes/:recipeId/notes', basicAuthMiddleware, express.json(), async (req: Request, res: Response) => {
    try {
        const db = (req.app.locals.db as BaseDatabase);
        const note = req.body;
        note.recipeId = new ObjectId(req.params.recipeId);
        const newNote = await db.createNote(note);
        res.status(201).json(newNote);
    } catch (error) {
        console.error('Error adding note:', error);
        res.status(500).json({ error: 'Error adding note.' });
    }
});

// Update a note in a recipe
recipesRouter.put('/recipes/:recipeId/notes/:noteId', basicAuthMiddleware, express.json(), async (req: Request, res: Response) => {
    try {
        const db = (req.app.locals.db as BaseDatabase);
        const noteId = req.params.noteId;
        const updatedNote = req.body;
        await db.updateNote(noteId, updatedNote);
        res.json({ success: true });
    } catch (error) {
        console.error('Error updating note:', error);
        res.status(500).json({ error: 'Error updating note.' });
    }
});

// Delete a note from a recipe
recipesRouter.delete('/recipes/:recipeId/notes/:noteId', basicAuthMiddleware, async (req: Request, res: Response) => {
    try {
        const db = (req.app.locals.db as BaseDatabase);
        const noteId = req.params.noteId;
        await db.deleteNote(noteId);
        res.status(204).json({ success: true });
    } catch (error) {
        console.error('Error deleting note:', error);
        res.status(500).json({ error: 'Error deleting note.' });
    }
});

recipesRouter.get('/recipes/countnotes/:recipeId', basicAuthMiddleware, async (req: Request, res: Response) => {
    const recipeId = req.params.recipeId;
    if (!recipeId || recipeId === '' || recipeId === 'undefined') {
        return res.status(400).json({ error: 'Missing recipeId.' });
    }
    try {
        const db = (req.app.locals.db as BaseDatabase);
        const count = await db.countNotesByRecipeId(recipeId);
        res.json(count);
    } catch (error) {
        console.error('Error fetching notes:', error);
        res.status(500).json({ error: 'Error fetching notes.' });
    }
});

export default recipesRouter;
