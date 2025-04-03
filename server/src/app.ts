import http from 'http';
import https from 'https';
import fs from 'fs';
import express, { Request, Response } from 'express';
import cors from  'cors';
import { MongoDatabase } from './lib/mongo-database';
import dotenvx from '@dotenvx/dotenvx'
import logger from './lib/logger';

dotenvx.config();
const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB;
logger.info(process.env.ENTORN);
logger.info(process.env.MONGODB_DB);
if (uri === undefined) {
  logger.error('No s\'ha trobat la variable d\'entorn MONGODB_URI');
  process.exit(1);
}

const app = express();
app.use(express.json());
const port = parseInt(process.env.SERVER_PORT || '3000', 10);
const httpsPort = parseInt(process.env.SERVER_PORT_HTTPS || '3443', 10);
const certKey = process.env.SERVER_KEY;
const cert = process.env.SERVER_CERT;


if (certKey === undefined || cert === undefined) {
  logger.error('No s\'ha trobat la variable d\'entorn SERVER_KEY o SERVER_CERT');
  process.exit(1);
}

const httpsOptions = {
  key: fs.readFileSync(certKey),
  cert: fs.readFileSync(cert)
};

const httpServer = http.createServer(app);
const httpsServer = https.createServer(httpsOptions, app);


//const uri = "mongodb+srv://aureliroura:hxndwxZsORfWp49c@cluster0.obzgga5.mongodb.net?retryWrites=true&w=majority&appName=Cluster0";
const db = new MongoDatabase(uri);
(async () => {
  try {
    await db.connect(dbName);
    if (db !== null) {
      await db.init();
      app.locals.db = db;
    } else {
      logger.error('Error en connectar amb la base de dades: BD null');
      process.exit(1);
    }
  } catch (error) {
    logger.error('Error en connectar amb la base de dades:', error);
    process.exit(1);
  }
})()


app.use(cors({
  origin: 'http://localhost:5173', // replace with your origin
    exposedHeaders: 'Authorization',
  }));

// Ruta de test
app.get('/test', (req: Request, res: Response) => {
  logger.info(`request: ${req.protocol}://${req.get('host')}${req.originalUrl}`);
  res.send('It\'s alive!');
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

import { allergenicsRouter } from './routes/allergenics';
app.use('/api', allergenicsRouter);

import { categoriesRouter } from './routes/categories';
app.use('/api', categoriesRouter);

httpServer.listen(port, () => {
  logger.info(`Server is running at http://localhost:${port}`);
});

httpsServer.listen(httpsPort, () => {
  logger.info(`Server is running at https://localhost:${httpsPort}`);
});

