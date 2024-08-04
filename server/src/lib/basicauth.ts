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
export const basicAuthMiddleware: express.RequestHandler = (req: Request, res: Response, next: NextFunction) => {
  const authHeader: string | undefined = req.headers.authorization;
  //  console.log ("basicAuthMiddleware");
  //  console.log (authHeader);
  if (!authHeader) {
    return res.status(401).json({ error: 'Accés no autoritzat. Falta l\'encapçalament d\'autorització.' });
  }

  const [type, token] = authHeader.split(' ');
  if (type.toLowerCase() !== 'bearer') {
    return res.status(401).json({ error: 'Accés no autoritzat. Tipus d\'autorització no vàlid.' });
  }

  // const decodedToken = Buffer.from(token, 'base64').toString('utf-8');
  jwt.verify(token, secretKey, (error, decoded: string | jwt.JwtPayload | undefined) => {
    if (error) {
      return res.status(401).json({ error: 'Token no vàlid.' });
    }

    if (typeof decoded === 'object') {
      if (decoded.nom && decoded.password && decoded.exp) {
        const { nom, password, exp } = decoded;
        // Verifica que el token no hagi caducat
        if (exp && Date.now() >= exp * 1000) {
          console.log('Token caducat:', new Date(exp * 1000));
          return res.status(401).json({ error: 'Accés no autoritzat. El token ha caducat.' });
        }
        // Afegeix l'usuari a la petició per a ús posterior
        const token = createToken(nom, password);
        req.user = { nom, password };

        // Adjunta el token a la resposta (pots utilitzar cookies o un encapçalament personalitzat)
        res.setHeader('Authorization', `Bearer ${token}`);

        // Continua amb la següent funció de middleware o ruta
        next();
      } else {
        return res.status(401).json({ error: 'Accés no autoritzat. Credencials incorrectes.' });
      }
    }
  });
};

export const createToken = (nom: string, password: string): string => {
  return jwt.sign({ nom, password }, secretKey, { expiresIn: '1h' });
};