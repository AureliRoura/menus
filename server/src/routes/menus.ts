// menus.ts
import express, { Request, Response, Router } from 'express';
import { MongoDatabase as BaseDatabase } from '../lib/mongo-database';
import { basicAuthMiddleware } from '../lib/basicauth';
import { IMenu } from '../lib/menus';
import uploadMenu from '../lib/uploadMenu';

export const menusRouter = Router();

menusRouter.get('/menus', basicAuthMiddleware, async (req: Request, res: Response): Promise<void> => {
    try {
        const db = (req.app.locals.db as BaseDatabase);
        const menus = await db.getMenus();
        res.status(200).json(menus);
    } catch (error) {
        console.error('Error retrieving menus:', error);
        res.status(500).json({ error: 'Error retrieving menus.' });
    }
});

menusRouter.get('/menus/byname/:nom', basicAuthMiddleware, async (req: Request, res: Response): Promise<void> => {
    try {
        const db = (req.app.locals.db as BaseDatabase);
        const nom = req.params.nom;
        const menu = await db.getMenuByName(nom);
        if (menu === null) {
            res.status(404).json({ error: 'menu no trobat.' });
        } else {
            res.json(menu);
        }
    } catch (error) {
        console.error('Error en recuperar menu:', error);
        res.status(500).json({ error: 'Error en recuperar menu.' });
    }
});

menusRouter.get('/menus/byid/:_id', basicAuthMiddleware, async (req: Request, res: Response): Promise<void> => {
    try {
        const db = (req.app.locals.db as BaseDatabase);
        const _id = req.params._id;
        const menu = await db.getMenuById(_id);
        if (menu === null) {
            res.status(404).json({ error: 'menu no trobat.' });
        } else {
            res.json(menu);
        }
    } catch (error) {
        console.error('Error en recuperar menu:', error);
        res.status(500).json({ error: 'Error en recuperar menu.' });
    }
});

menusRouter.post('/menus', basicAuthMiddleware, express.json(), async (req: Request, res: Response): Promise<void> => {
    try {
        const db = (req.app.locals.db as BaseDatabase);
        const { name, items } = req.body;

        if (!name || !items) {
            res.status(400).json({ error: 'Name and items are required.' });
            return;
        }

        const newMenu: IMenu = { name, items, menu: {} as IMenu['menu'] }; // Ensure items and menu are included
        const createdMenu = await db.createMenu(newMenu);
        res.status(201).json(createdMenu);
    } catch (error) {
        console.error('Error creating menu:', error);
        res.status(500).json({ error: 'Error creating menu.' });
    }
});

menusRouter.put('/menus/:_id', basicAuthMiddleware, express.json(), async (req: Request, res: Response): Promise<void> => {
    try {
        const db = (req.app.locals.db as BaseDatabase);
        const _id = req.params._id;
        const { name, items } = req.body;

        if (!name || !items) {
            res.status(400).json({ error: 'Name and items are required.' });
            return;
        }

        const updatedMenu: Partial<IMenu> = { name, items }; // Ensure items is included
        await db.updateMenuById(_id, updatedMenu);
        res.status(200).json({ success: true });
    } catch (error) {
        console.error('Error updating menu:', error);
        res.status(500).json({ error: 'Error updating menu.' });
    }
});

menusRouter.delete('/menus/:_id', basicAuthMiddleware, async (req: Request, res: Response): Promise<void> => {
    try {
        const db = (req.app.locals.db as BaseDatabase);
        const _id = req.params._id;

        const menu = await db.getMenuById(_id);
        if (!menu) {
            res.status(404).json({ error: 'Menu not found.' });
            return;
        }

        await db.deleteMenu(_id);
        res.status(204).json({ success: true });
    } catch (error) {
        console.error('Error deleting menu:', error);
        res.status(500).json({ error: 'Error deleting menu.' });
    }
});

menusRouter.get('/menus/withrecipes/:_id', basicAuthMiddleware, async (req: Request, res: Response): Promise<void> => {
    try {
        const db = (req.app.locals.db as BaseDatabase);
        const _id = req.params._id;

        const menus = await db.getMenuWithRecipes(_id);
        if (menus === null) {
            res.status(404).json({ error: 'menu no trobat.' });
        } else {
            res.status(200).json(menus);
        }
    } catch (error) {
        console.error('Error en recuperar menu:', error);
        res.status(500).json({ error: error });
    }
});

menusRouter.put('/menus/simplerecipes/:_id', basicAuthMiddleware, express.json(), async (req: Request, res: Response): Promise<void> => {
    try {
        const db = (req.app.locals.db as BaseDatabase);
        const _id = req.params._id;
        const { menuToUpdate } = req.body;

        const menu = await db.getMenuById(_id);
        if (menu === null) {
            res.status(404).json({ error: 'menu no trobat.' });
            return;
        }

        const newMenu = await db.updateMenuSimpleRecipes(_id, menuToUpdate);
        res.status(200).json({ newMenu });
    } catch (error) {
        console.error('Error en afegir recipe a menu:', error);
        res.status(500).json({ error: 'Error en afegir recipe a menu.' });
    }
});

menusRouter.put('/menus/day/:_id/:day', basicAuthMiddleware, express.json(), async (req: Request, res: Response): Promise<void> => {
    try {
        const db = (req.app.locals.db as BaseDatabase);
        const _id = req.params._id;
        const day = req.params.day;
        const recipesDay = req.body;

        const newMenu = await db.updateMenuDay(_id, day, recipesDay);
        res.status(200).json({ newMenu });
    }
    catch (error) {
        console.error('Error en afegir dia a menu:', error);
        res.status(500).json({ error: 'Error en afegir dia a menu.' });
    }
});

menusRouter.get('/menus/list', basicAuthMiddleware, async (req: Request, res: Response): Promise<void> => {
    try {
        const db = (req.app.locals.db as BaseDatabase);
        const menus = await db.getMenusList();
        res.status(200).json(menus);
    } catch (error) {
        console.error('Error en recuperar noms de menus:', error);
        res.status(500).json({ error: 'Error en recuperar noms de menus.' });
    }
});

menusRouter.post('/menus/upload', basicAuthMiddleware, express.json(), async (req: Request, res: Response): Promise<void> => {
    try {
        const db = (req.app.locals.db as BaseDatabase);
        const jsonMenu = req.body.data;

        await uploadMenu.uploadMenu(db, jsonMenu);
        res.status(200).json({ message: 'Menu carregat correctament.' });
    } catch (error) {
        console.error('Error en carregar menu:', error);
        res.status(500).json({ error: 'Error en carregar menu.' });
    }
});

export default menusRouter;
