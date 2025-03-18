import { Request, Response, Router, json } from 'express';
import { IUser } from '../lib/user';
import { createToken } from '../lib/basicauth';
import { MongoDatabase } from '../lib/mongo-database';


export const logonRouter = Router();

// Ruta per autenticar un usuari
logonRouter.post('/logon', json(), async (req: Request, res: Response): Promise<void> => {
  try {
    const db = (req.app.locals.db as MongoDatabase);
    // Validacions senzilles
    if (!req.body.nom || !req.body.password) {
      res.status(400).json({ error: 'Falten dades d\'usuari.' });
      return;
    }
    const { nom, password } = req.body;
    // Recupera l'usuari de la base de dades
    const user : IUser | null = await db.getUserByName(nom);
    if (user === null) {
      res.status(404).json({ error: 'Usuari no trobat.' });
    } else {
      // Verifica la contrasenya
      const isValid = await db.checkPassword(nom, password);
      if (!isValid) {
        res.status(401).json({ error: 'Contrasenya incorrecta.' });
      } else {
        // Genera el token i el retorna
        const token = createToken(nom, password);
        res.setHeader('Authorization', `Bearer ${token}`);
        res.status(200).json(user);
      }
    }
  } catch (error) {
    console.error('Error en autenticar l\'usuari:', error);
    res.status(500).json({ error: 'Error en autenticar l\'usuari.' });
  }
});


export default logonRouter;