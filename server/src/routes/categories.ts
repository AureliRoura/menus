// categories.ts
import { Request, Response, Router } from 'express';
import { MongoDatabase  as BaseDatabase }from '../lib/mongo-database';
import { basicAuthMiddleware } from '../lib/basicauth';

export const categoriesRouter = Router();

categoriesRouter.get('/categories',  basicAuthMiddleware, async (req: Request, res: Response) => {
    try {
        const db = (req.app.locals.db as BaseDatabase);
        const categories = await db.getCategories(); 
        res.json(categories);
    } catch (error) {
        console.error('Error en recuperar categories:', error);
        res.status(500).json({ error: 'Error en recuperar categories.' });
    }
});

export default categoriesRouter;
