// ingredients.ts
import express, { Request, Response, Router } from 'express';
import { MongoDatabase as BaseDatabase } from '../lib/mongo-database';
import { basicAuthMiddleware } from '../lib/basicauth';
import { IIngredient, Ingredient } from '../lib/ingredients';
import bcrypt from 'bcrypt';
import logger from '../lib/logger';


const SALT_ROUNDS = 10;

export const ingredientRouter = Router();

ingredientRouter.get('/ingredients', basicAuthMiddleware, async (req: Request, res: Response) => {
    try {
        const db = (req.app.locals.db as BaseDatabase);
        const ingredients = await db.getIngredients();
        res.json(ingredients.map((ingredient) => ingredient));
    } catch (error) {
        logger.error('Error en recuperar ingredients:', error);
        res.status(500).json({ error: 'Error en recuperar ingredients.' });
    }
});

ingredientRouter.get('/ingredients/byname/:nom', basicAuthMiddleware, async (req: Request, res: Response) => {
    try {
        const db = (req.app.locals.db as BaseDatabase);
        const nom = req.params.nom;
        const ingredient = await db.getIngredientByName(nom);
        if (ingredient === null) {
            res.status(404).json({ error: 'ingredient no trobat.' });
        } else {
            res.json(ingredient);
        }
    } catch (error) {
        logger.error('Error en recuperar ingredient:', error);
        res.status(500).json({ error: 'Error en recuperar ingredient.' });
    }
});
ingredientRouter.get('/ingredients/:id', basicAuthMiddleware, async (req: Request, res: Response) => {
    try {
        const db = (req.app.locals.db as BaseDatabase);
        const id = req.params.id;
        const ingredient = await db.getIngredientById(id);
        if (ingredient === null) {
            res.status(404).json({ error: 'ingredient no trobat.' });
        } else {
            res.json(ingredient);
        }
    } catch (error) {
        logger.error('Error en recuperar ingredient:', error);
        res.status(500).json({ error: 'Error en recuperar ingredient.' });
    }
});

ingredientRouter.post('/ingredients', express.json(), async (req: Request, res: Response) => {
    try {
        const db = (req.app.locals.db as BaseDatabase);
        var ingredientObj = new Ingredient(req.body)


        // Validacions senzilles
        if (!ingredientObj.info.name) {
            return res.status(400).json({ error: 'Falten dades d\'ingredient.' });
        }

        // Comprova que l'ingredient no existeixi ja
        const existingIngredient = await db.getIngredientByName(ingredientObj.info.name);
        if (existingIngredient !== null) {
            return res.status(409).json({ error: 'L\'ingredient ja existeix.' });
        }

        // Crea l'ingredient
        //  async createIngredient(Ingredient: IIngredient): Promise<IIngredient> {
        if (!ingredientObj.info._id || ingredientObj.info._id === '') {
            ingredientObj.info._id = undefined;
        }
        const ingredient = await db.createIngredient(ingredientObj.info);
        res.status(201).json(ingredient);
    } catch (error) {
        logger.error('Error en crear ingredient:', error);
        res.status(500).json({ error: 'Error en crear ingredient.' });
    }
});

ingredientRouter.put('/ingredients/:_id', basicAuthMiddleware, express.json(), async (req: Request, res: Response) => {
    try {
        const db = (req.app.locals.db as BaseDatabase);
        const _id = req.params._id;
        var ingredientObj = new Ingredient(req.body)
        // Comprova que l'ingredient existeixi
        const ingredient = await db.getIngredientById(_id);
        if (ingredient === null) {
            return res.status(404).json({ error: 'ingredient no trobat.' });
        }
        ingredientObj.info._id = ingredient?._id
        await db.updateIngredientById(ingredient._id as string, ingredientObj.info)
            .then((result) => {
                logger.info("result", result)
                res.status(200).json({ _id: ingredient._id });
            });

    } catch (error) {
        logger.error('Error en actualitzar ingredient:', error);
        res.status(500).json({ error: 'Error en actualitzar ingredient.' });
    }
});

ingredientRouter.delete('/ingredients/:_id', basicAuthMiddleware, async (req: Request, res: Response) => {
    try {
        const db = (req.app.locals.db as BaseDatabase);
        const _id = req.params._id;

        // Comprova que l'ingredient existeixi
        const ingredient = await db.getIngredientById(_id);
        if (ingredient === null) {
            return res.status(404).json({ error: 'ingredient no trobat.' });
        }

        // Elimina l'ingredient
        if (ingredient.name !== null) {
            await db.deleteIngredient(_id);
            res.status(204).json({ _id: ingredient._id });
        }
    } catch (error) {
        logger.error('Error en eliminar ingredient:', error);
        res.status(500).json({ error: 'Error en eliminar ingredient.' });
    }
});

ingredientRouter.post('/ingredients/rename', basicAuthMiddleware, async (req: Request, res: Response) => {
    try {
        const db = (req.app.locals.db as BaseDatabase);
        const { oldName, newName } = req.body as { oldName: string, newName: string };

        // Verifica que oldName i newName siguin proporcionats
        if (!oldName || !newName) {
            return res.status(400).json({ message: "Cal proporcionar oldName i newName." });
        }
        const retValue = await db.changeRecipesIngredientName(oldName, newName)
        if (!retValue) {
            res.status(404).json({ error: 'ingredient no trobat.' });
        } else {
            res.status(200).json({ success: true });
        }
    } catch (error) {
        logger.error('Error en renombrar recipe:', error);
        res.status(500).json({ error: 'Error en renombrar recipe.' });
    }
});


export default ingredientRouter;
