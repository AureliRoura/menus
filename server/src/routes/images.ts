import express, { Request, Response, Router } from 'express';
import { MongoDatabase as BaseDatabase } from '../lib/mongo-database';
import { basicAuthMiddleware } from '../lib/basicauth';
import { Readable } from 'stream';
import { GridFSBucketReadStream } from 'mongodb';

const SALT_ROUNDS = 10;

export const imagesRouter = Router();

imagesRouter.post('/image', basicAuthMiddleware, (req: Request, res: Response) => {
  (async () => {
    try {
      const db = (req.app.locals.db as BaseDatabase);
      const { fileName, imageStream } = req.body;

      // Validacions senzilles
      if (!fileName || !imageStream) {
        console.log('fileName:', fileName);
        res.status(400).json({ error: 'Falten dades de la imatge.' });
        return;
      }
      // imageStream és un string codificat en base64
      // Convertim a un buffer
      const imageBuffer = Buffer.from(imageStream, 'base64');
      // Convertim a un stream de lectura
      const imageStreamNew = new Readable();
      imageStreamNew.push(imageBuffer);
      imageStreamNew.push(null);

      const id = await db.insertImage(fileName, imageStreamNew);
      res.status(201).json({ message: 'Imatge inserida correctament.', id: id });
    } catch (error) {
      console.error('Error en inserir la imatge:', error);
      res.status(500).json({ error: 'Error en inserir la imatge.' });
    }
  })();
});

async function streamToString(stream: GridFSBucketReadStream): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    stream.on('data', (chunk) => {
      chunks.push(chunk);
    });
    stream.on('end', () => {
      const buffer = Buffer.concat(chunks);
      resolve(buffer.toString('base64'));
    });
    stream.on('error', (err) => {
      reject(err);
    });
  });
}

imagesRouter.get('/image/:id', basicAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const db = (req.app.locals.db as BaseDatabase);
    const id = req.params.id;
    const imageStream = await db.getImage(id); // Assuming getImage returns a GridFSBucketReadStream

    if (imageStream) {
      const imageString = await streamToString(imageStream);
      res.status(200).json({ image: imageString });
    } else {
      res.status(404).json({ error: 'Image not found.' });
    }
  } catch (error) {
    if ((error as Error).message.includes('FileNotFound')) {
      res.status(404).json({ error: 'Image not found.' });
    } else {
      res.status(500).json({ error: 'Error retrieving image.' });
    }
  }
});

imagesRouter.delete('/image/:id', basicAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const db = (req.app.locals.db as BaseDatabase);
    const id = req.params.id;
    await db.deleteImage(id);
    res.status(204).json({ message: 'Imatge eliminada correctament.' });
  } catch (error) {
    console.error('Error en eliminar imatge:', error);
    res.status(500).json({ error: 'Error en eliminar imatge.' });
  }
});