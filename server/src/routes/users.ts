// users.ts
import express, { Request, Response, Router } from 'express';
import { MongoDatabase as BaseDatabase } from '../lib/mongo-database';
import { basicAuthMiddleware } from '../lib/basicauth';
import bcrypt from 'bcrypt';
import bodyParser from 'body-parser';
import { authenticator } from 'otplib';
import qrcode from 'qrcode';


const SALT_ROUNDS = 10;

export const usersRouter = Router();

usersRouter.get('/checksession', basicAuthMiddleware, async (req: Request, res: Response) => {
    try {
        res.status(200).json({ message: 'Sessió vàlida' });
    } catch (error) {
        console.error('Error en comprovar la sessió:', error);
        res.status(500).json({ error: 'Error en comprovar la sessió.' });
    }
});

usersRouter.get('/users', basicAuthMiddleware, async (req: Request, res: Response) => {
    try {
        const db = (req.app.locals.db as BaseDatabase);
        const users = await db.getUsers();
        res.json(users.map((usuari) => usuari));
    } catch (error) {
        console.error('Error en recuperar users:', error);
        res.status(500).json({ error: 'Error en recuperar users.' });
    }
});

usersRouter.get('/users/:nom', basicAuthMiddleware, async (req: Request, res: Response) => {
    try {
        const db = (req.app.locals.db as BaseDatabase);
        const nom = req.params.nom;
        const usuari = await db.getUserByName(nom);
        if (usuari === null) {
            res.status(404).json({ error: 'Usuari no trobat.' });
        } else {
            res.json(usuari);
        }
    } catch (error) {
        console.error('Error en recuperar usuari:', error);
        res.status(500).json({ error: 'Error en recuperar usuari.' });
    }
});

usersRouter.post('/users', express.json(), async (req: Request, res: Response) => {
    try {
        const db = (req.app.locals.db as BaseDatabase);
        const { nom, email, password } = req.body;

        // Validacions senzilles
        if (!nom || !email || !password) {
            return res.status(400).json({ error: 'Falten dades d\'usuari.' });
        }

        // Comprova que l'usuari no existeixi ja
        const usuari = await db.getUserByName(nom);
        if (usuari !== null) {
            return res.status(409).json({ error: 'L\'usuari ja existeix.' });
        }

        // Crea l'usuari
        //  async createUser(user: IUser): Promise<IUser> {
        const id = await db.createUser({ '_id': '', 'name': nom, 'email': email, 'password': password });
        res.status(201).json({ id });
    } catch (error) {
        console.error('Error en crear usuari:', error);
        res.status(500).json({ error: 'Error en crear usuari.' });
    }
});

usersRouter.put('/users/:nom', basicAuthMiddleware, express.json(), async (req: Request, res: Response) => {
    try {
        const db = (req.app.locals.db as BaseDatabase);
        const nom = req.params.nom;
        const { email, password } = req.body;

        // Validacions senzilles
        if (!email || !password) {
            return res.status(400).json({ error: 'Falten dades d\'usuari.' });
        }

        // Comprova que l'usuari existeixi
        const usuari = await db.getUserByName(nom);
        if (usuari === null) {
            return res.status(404).json({ error: 'Usuari no trobat.' });
        }

        // Actualitza l'usuari
        const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
        await db.updateUserById(usuari._id as string, { '_id': usuari._id, 'name': nom, 'email': email, 'password': passwordHash });
        res.json({ _id: usuari._id });
    } catch (error) {
        console.error('Error en actualitzar usuari:', error);
        res.status(500).json({ error: 'Error en actualitzar usuari.' });
    }
});

usersRouter.delete('/users/:nom', basicAuthMiddleware, async (req: Request, res: Response) => {
    try {
        const db = (req.app.locals.db as BaseDatabase);
        const nom = req.params.nom;

        // Comprova que l'usuari existeixi
        const usuari = await db.getUserByName(nom);
        if (usuari === null) {
            return res.status(404).json({ error: 'Usuari no trobat.' });
        }

        // Elimina l'usuari
        if (usuari.name !== null) {
            await db.deleteUser(usuari.name);
            res.status(204).json({ _id: usuari._id });
        }
    } catch (error) {
        console.error('Error en eliminar usuari:', error);
        res.status(500).json({ error: 'Error en eliminar usuari.' });
    }
});

usersRouter.post('/users/register', express.json(), async (req: Request, res: Response) => {
    try {
        const db = (req.app.locals.db as BaseDatabase);
        const { username } = req.body;

        const secret = authenticator.generateSecret();
        const usuari = await db.getUserByName(username);
        if (usuari === null) {
            return res.status(404).json({ error: 'Usuari no trobat.' });
        }
        usuari.secret = secret;
        await db.updateUserById(usuari._id as string, usuari);
        const url = await qrcode.toDataURL(authenticator.keyuri(username, 'Menus', secret));
        res.status(201).json({ secret, url });
    } catch (err) {
        res.status(500).send('Error generating QR code');
    }
});

usersRouter.post('/users/verify', basicAuthMiddleware, express.json(), async (req: Request, res: Response) => {
    try {
        const db = (req.app.locals.db as BaseDatabase);
        const { username, token } = req.body;

        const usuari = await db.getUserByName(username);
        if (usuari === null) {
            return res.status(404).json({ error: 'Usuari no trobat.' });
        }
        if (!usuari.secret || usuari.secret === '') {
            return res.status(400).json({ error: 'Usuari sense secret.' });
        }
        const isValid = authenticator.verify({ token: token, secret: usuari.secret });
        res.status(201).json({ isValid });
    } catch (err) {
        res.status(500).send('Error verifying token');
    }
});

usersRouter.get('/users/mfa/:username', async (req: Request, res: Response) => {
    try {
        const db = (req.app.locals.db as BaseDatabase);
        const username = req.params.username;
        if (!username) {
            return res.status(400).json({ error: 'Falta el nom d\'usuari.' });
        }
        const usuari = await db.getUserByName(username);
        if (usuari === null) {
            return res.status(404).json({ error: 'Usuari no trobat.' });
        }
        const hasMfa = !!usuari.secret && usuari.secret !== '';
        res.json({ mfa: hasMfa });
    } catch (error) {
        console.error('Error en recuperar usuari:', error);
        res.status(500).json({ error: 'Error en recuperar usuari.' });
    }
});


export default usersRouter;
