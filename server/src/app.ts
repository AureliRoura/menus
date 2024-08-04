import express, { Request, Response } from 'express';
import cors from  'cors';
import { MongoDatabase } from './lib/mongo-database';
import dotenvx from '@dotenvx/dotenvx'

dotenvx.config();
const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB;
console.log(process.env.ENTORN);
console.log(process.env.MONGODB_DB);
if (uri === undefined) {
  console.error('No s\'ha trobat la variable d\'entorn MONGODB_URI');
  process.exit(1);
}

const app = express();
app.use(express.json());
const port = process.env.SERVER_PORT||3000;
//const uri = "mongodb+srv://aureliroura:hxndwxZsORfWp49c@cluster0.obzgga5.mongodb.net?retryWrites=true&w=majority&appName=Cluster0";
const db = new MongoDatabase(uri);
(async () => {
  try {
    await db.connect(dbName);
    if (db !== null) {
      await db.init();
      app.locals.db = db;
    } else {
      console.error('Error en connectar amb la base de dades: BD null');
      process.exit(1);
    }
  } catch (error) {
    console.error('Error en connectar amb la base de dades:', error);
    process.exit(1);
  }
})()


app.use(cors({
  origin: 'http://localhost:5173', // replace with your origin
    exposedHeaders: 'Authorization',
  }));

// Ruta de test
app.get('/test', (req: Request, res: Response) => {
  console.log('request:', req.body);
  res.send('Hola, aquest és un servidor web amb TypeScript!');
});

// Configurar la nova ruta de logon
import { logonRouter } from './routes/logon';
app.use('/api', logonRouter);

import { usersRouter } from './routes/users';
app.use('/api', usersRouter);

import { ingredientRouter } from './routes/ingredients';
app.use('/api', ingredientRouter);

import { UnitsRouter } from './routes/units';
app.use('/api', UnitsRouter);

import { recipesRouter } from './routes/recipes';
app.use('/api', recipesRouter);

import { menusRouter } from './routes/menus';
app.use('/api', menusRouter);

import { alergenicsRouter } from './routes/alergenics';
app.use('/api', alergenicsRouter);

import { categoriesRouter } from './routes/categories';
app.use('/api', categoriesRouter);

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
