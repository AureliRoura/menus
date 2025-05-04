import e from 'express';
import express, { Request, Response, NextFunction } from 'express';
import jwt, { VerifyErrors, VerifyOptions } from 'jsonwebtoken';


export const secretKey = 'clau_secreta_super_segura'; // Això hauria de ser una cadena segura i mantinguda en secret

declare global {
  namespace Express {
    interface Request {
      user?: { nom: string; password: string };
    }
  }
}

// Exemple de com s'inicialitza el middleware d'autenticació bàsica
export const basicAuthMiddleware: express.RequestHandler = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      res.status(401).json({ error: 'Authorization header missing' });
      return;
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      res.status(401).json({ error: 'Token missing' });
      return;
    }

    jwt.verify(token, secretKey, (err, decoded) => {
      if (err) {
        res.status(403).json({ error: 'Invalid token' });
        return;
      }

      if (typeof decoded === 'object' && decoded.nom && decoded.password && decoded.exp) {
        const { nom, password, exp } = decoded;

        // Verify token expiration
        if (exp && Date.now() >= exp * 1000) {
          res.status(401).json({ error: 'Token expired' });
          return;
        }

        // Attach user to the request object
        req.user = { nom, password };
        // set respones header with token
        const newToken = createToken(nom, password);
        res.setHeader('Authorization', `Bearer ${newToken}`);
        // Call the next middleware
        next();
      } else {
        res.status(401).json({ error: 'Invalid credentials' });
      }
    });
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createToken = (nom: string, password: string): string => {
  return jwt.sign({ nom, password }, secretKey, { expiresIn: '6h' });
};