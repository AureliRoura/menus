// Units.ts
import express, { Request, Response, Router } from 'express';
import { MongoDatabase as BaseDatabase } from '../lib/mongo-database';
import { basicAuthMiddleware } from '../lib/basicauth';

export const UnitsRouter = Router();

UnitsRouter.get('/units', basicAuthMiddleware, async (req: Request, res: Response): Promise<void> => {
    try {
        const db = (req.app.locals.db as BaseDatabase);
        const units = await db.getUnits();
        res.status(200).json(units);
    } catch (error) {
        console.error('Error en recuperar Units:', error);
        res.status(500).json({ error: 'Error en recuperar Units.' });
    }
});

UnitsRouter.post('/units', basicAuthMiddleware, async (req: Request, res: Response): Promise<void> => {
    try {
        const db = (req.app.locals.db as BaseDatabase);
        const { unit } = req.body as { unit: string };

        if (!unit) {
            res.status(400).json({ message: "name is required." });
            return;
        }

        const unitExists = await db.getUnit(unit);
        if (unitExists) {
            res.status(400).json({ message: "Unit already exists." });
            return;
        }
        await db.createUnit(unit);
        res.status(201).json({ success: true });
    } catch (error) {
        console.error('Error en afegir Unit:', error);
        res.status(500).json({ error: 'Error en afegir Unit.' });
    }
});

UnitsRouter.put('/units/rename', basicAuthMiddleware, async (req: Request, res: Response): Promise<void> => {
    try {
        const db = (req.app.locals.db as BaseDatabase);
        const { oldUnitName, newUnitName } = req.body as { oldUnitName: string, newUnitName: string };

        if (!oldUnitName || !newUnitName) {
            res.status(400).json({ message: "Both oldUnitName and newUnitName are required." });
            return;
        }

        await db.changeRecipesIngredientUnit(oldUnitName, newUnitName)
        res.status(200).json({ success: true });
    } catch (error) {
        console.error('Error en renombrar Unit:', error);
        res.status(500).json({ error: 'Error en renombrar Unit.' });
    }
});

export default UnitsRouter;
