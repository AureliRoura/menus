// menus.ts
import express, { Request, Response, Router } from 'express';
import { MongoDatabase as BaseDatabase } from '../lib/mongo-database';
import { basicAuthMiddleware } from '../lib/basicauth';
import { Menu } from '../lib/menus';
import uploadMenu from '../lib/uploadMenu';



export const menusRouter = Router();

menusRouter.get('/menus', basicAuthMiddleware, async (req: Request, res: Response) => {
    try {
        const db = (req.app.locals.db as BaseDatabase);
        const menus = await db.getMenus();
        res.json(menus.map((menu) => menu));
    } catch (error) {
        console.error('Error en recuperar menus:', error);
        res.status(500).json({ error: 'Error en recuperar menus.' });
    }
});

menusRouter.get('/menus/byname/:nom', basicAuthMiddleware, async (req: Request, res: Response) => {
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

menusRouter.get('/menus/byid/:_id', basicAuthMiddleware, async (req: Request, res: Response) => {
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

menusRouter.post('/menus', express.json(), async (req: Request, res: Response) => {
    try {
        const db = (req.app.locals.db as BaseDatabase);
        var menuObj = new Menu(req.body)

        // Validacions senzilles
        if (!menuObj.info.name) {
            return res.status(400).json({ error: 'Falten dades d\'menu.' });
        }

        // Comprova que l'menu no existeixi ja
        const existingMenu = await db.getMenuByName(menuObj.info.name);
        if (existingMenu !== null) {
            return res.status(409).json({ error: 'L\'menu ja existeix.' });
        }

        // Crea l'menu
        //  async createMenu(Menu: IMenu): Promise<IMenu> {
        if (!menuObj.info._id || menuObj.info._id === '') {
            menuObj.info._id = undefined;
        }
        const menu = await db.createMenu(menuObj.info);
        res.status(201).json(menu);
    } catch (error) {
        console.error('Error en crear menu:', error);
        res.status(500).json({ error: 'Error en crear menu.' });
    }
});

menusRouter.put('/menus/:_id', basicAuthMiddleware, express.json(), async (req: Request, res: Response) => {
    try {
        const db = (req.app.locals.db as BaseDatabase);
        const _id = req.params._id;
        var menuObj = new Menu(req.body)
        menuObj.update({ _id: _id })

        // Comprova que l'menu existeixi
        const menu = await db.getMenuById(_id);
        if (menu === null) {
            return res.status(404).json({ error: 'menu no trobat.' });
        }
        await db.updateMenuById(menu._id as string, menuObj.info);
        res.json({ _id: menu._id });
    } catch (error) {
        console.error('Error en actualitzar menu:', error);
        res.status(500).json({ error: 'Error en actualitzar menu.' });
    }
});

menusRouter.delete('/menus/:_id', basicAuthMiddleware, async (req: Request, res: Response) => {
    try {
        const db = (req.app.locals.db as BaseDatabase);
        const _id = req.params._id;

        // Comprova que l'menu existeixi
        const menu = await db.getMenuById(_id);
        if (menu === null) {
            return res.status(404).json({ error: 'menu no trobat.' });
        }

        // Elimina l'menu
        if (menu.name !== null) {
            await db.deleteMenu(_id);
            res.status(204).json({ _id: menu._id });
        }
    } catch (error) {
        console.error('Error en eliminar menu:', error);
        res.status(500).json({ error: 'Error en eliminar menu.' });
    }
});

menusRouter.get('/menus/withrecipes/:_id', basicAuthMiddleware, async (req: Request, res: Response) => {
    try {
        const db = (req.app.locals.db as BaseDatabase);
        const _id = req.params._id;

        const menus = await db.getMenuWithRecipes(_id);
        if (menus === null) {
            res.status(404).json({ error: 'menu no trobat.' });
        } else {
            // console.log('menus:', JSON.stringify(menus));
            res.status(200).json(menus);
        }
    } catch (error) {
        console.error('Error en recuperar menu:', error);
        res.status(500).json({ error: error });
    }
});

menusRouter.put('/menus/simplerecipes/:_id', basicAuthMiddleware, express.json(), async (req: Request, res: Response) => {
    try {
        const db = (req.app.locals.db as BaseDatabase);
        const _id = req.params._id;
        const { menuToUpdate } = req.body;

        // Comprova que l'menu existeixi
        const menu = await db.getMenuById(_id);
        if (menu === null) {
            return res.status(404).json({ error: 'menu no trobat.' });
        }

        const newMenu = await db.updateMenuSimpleRecipes(_id, menuToUpdate);
        res.status(200).json({ newMenu });
    } catch (error) {
        console.error('Error en afegir recipe a menu:', error);
        res.status(500).json({ error: 'Error en afegir recipe a menu.' });
    }
});

menusRouter.put('/menus/day/:_id/:day', basicAuthMiddleware, express.json(), async (req: Request, res: Response) => {
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

menusRouter.get('/menus/list', basicAuthMiddleware, async (req: Request, res: Response) => {
    try {
        const db = (req.app.locals.db as BaseDatabase);
        const menus = await db.getMenusList();
        res.status(200).json(menus);

    } catch (error) {
        console.error('Error en recuperar noms de menus:', error);
        res.status(500).json({ error: 'Error en recuperar noms de menus.' });
    }
});

menusRouter.post('/menus/upload', basicAuthMiddleware, express.json(), async (req: Request, res: Response) => {
    try {
        const db = (req.app.locals.db as BaseDatabase);
        const jsonMenu = req.body.data;
        //console.log('jsonMenu:', jsonMenu);

        await uploadMenu.uploadMenu(db, jsonMenu);
        res.status(200).json({ message: 'Menu carregat correctament.' });
    } catch (error) {
        console.error('Error en carregar menu:', error);
        res.status(500).json({ error: 'Error en carregar menu.' });
    }
});

export default menusRouter;
