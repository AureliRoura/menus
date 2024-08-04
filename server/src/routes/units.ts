// Units.ts
import express, { Request, Response, Router } from 'express';
import { MongoDatabase as BaseDatabase } from '../lib/mongo-database';
import { basicAuthMiddleware } from '../lib/basicauth';


export const UnitsRouter = Router();

UnitsRouter.get('/units', basicAuthMiddleware, async (req: Request, res: Response) => {
    try {
        const db = (req.app.locals.db as BaseDatabase);
        const Units = await db.getUnits();
        res.status(200).json(Units);
    } catch (error) {
        console.error('Error en recuperar Units:', error);
        res.status(500).json({ error: 'Error en recuperar Units.' });
    }
});

UnitsRouter.post('/units', basicAuthMiddleware, async (req: Request, res: Response) => {
    try {
        const db = (req.app.locals.db as BaseDatabase);
        const { unit } = req.body as { unit: string };

        // Verify that name is provided
        if (!unit) {
            return res.status(400).json({ message: "name is required." });
        }
        //Verify that the unit does not exist
        const unitExists = await db.getUnit(unit);
        if (unitExists) {
            return res.status(400).json({ message: "Unit already exists." });
        }
        await db.createUnit(unit);
        res.status(201).json({ success: true });
    } catch (error) {
        console.error('Error en afegir Unit:', error);
        res.status(500).json({ error: 'Error en afegir Unit.' });
    }
});

UnitsRouter.put('/units/rename', basicAuthMiddleware, async (req: Request, res: Response) => {
    try {
        const db = (req.app.locals.db as BaseDatabase);
        const { oldUnitName, newUnitName } = req.body as { oldUnitName: string, newUnitName: string };

        // Verify that both oldUnitName and newUnitName are provided
        if (!oldUnitName || !newUnitName) {
            return res.status(400).json({ message: "Both oldUnitName and newUnitName are required." });
        }

        await db.changeRecipesIngredientUnit(oldUnitName, newUnitName)
        res.status(200).json({ success: true });
    } catch (error) {
        console.error('Error en renombrar Unit:', error);
        res.status(500).json({ error: 'Error en renombrar Unit.' });
    }
});

export default UnitsRouter;
