// Alergenics.ts
import express, { Request, Response, Router } from 'express';
import { MongoDatabase  as BaseDatabase }from '../lib/mongo-database';
import { basicAuthMiddleware } from '../lib/basicauth';



export const allergenicsRouter = Router();

allergenicsRouter.get('/allergenics',  basicAuthMiddleware, async (req: Request, res: Response) => {
    try {
        const db = (req.app.locals.db as BaseDatabase);
        const allergenics = await db.getAlergenics(); 
        res.json(allergenics);
    } catch (error) {
        console.error('Error en recuperar Alergenics:', error);
        res.status(500).json({ error: 'Error en recuperar Alergenics.' });
    }
});

export default allergenicsRouter;
