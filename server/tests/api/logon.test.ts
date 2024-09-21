import request from 'supertest';
import express from 'express';
import { MongoDatabase } from '../../src/lib/mongo-database';
import { createToken } from '../../src/lib/basicauth';
import logonRouter from '../../src/routes/logon';
import { config } from 'dotenv';

jest.mock('../../src/lib/mongo-database');
jest.mock('../../src/lib/basicauth');

config();
const uri: string = process.env.MONGO_URI || '';

const app = express();
app.use(express.json());
app.use('/api', logonRouter);

describe('Logon API', () => {
  let dbMock: jest.Mocked<MongoDatabase>;

  beforeAll(() => {
    dbMock = new MongoDatabase(uri) as jest.Mocked<MongoDatabase>;
    app.locals.db = dbMock;
  });

  afterAll(() => {
    jest.clearAllMocks();
  });

  describe('POST /logon', () => {
    it('should authenticate a user and return a token', async () => {
      const mockUser = { name: 'testuser', email: 'test@test.com', password: 'testpassword' };
      dbMock.getUserByName.mockResolvedValue(mockUser);
      dbMock.checkPassword.mockResolvedValue(true);
      (createToken as jest.Mock).mockReturnValue('mockToken');

      const response = await request(app)
        .post('/api/logon')
        .send({ nom: 'testuser', password: 'testpassword' });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockUser);
      expect(response.headers['authorization']).toBe('Bearer mockToken');
    });

    it('should return a 400 error if nom or password is not provided', async () => {
      const response = await request(app)
        .post('/api/logon')
        .send({ nom: '', password: '' });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: "Falten dades d'usuari." });
    });

    it('should return a 404 error if the user is not found', async () => {
      dbMock.getUserByName.mockResolvedValue(null);

      const response = await request(app)
        .post('/api/logon')
        .send({ nom: 'nonexistentuser', password: 'password' });

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'Usuari no trobat.' });
    });

    it('should return a 401 error if the password is incorrect', async () => {
      const mockUser =  { name: 'testuser', email: 'test@test.com', password: 'testpassword' };
      dbMock.getUserByName.mockResolvedValue(mockUser);
      dbMock.checkPassword.mockResolvedValue(false);

      const response = await request(app)
        .post('/api/logon')
        .send({ nom: 'testuser', password: 'wrongpassword' });

      expect(response.status).toBe(401);
      expect(response.body).toEqual({ error: 'Contrasenya incorrecta.' });
    });

    it('should return a 500 error if there is a server error', async () => {
      dbMock.getUserByName.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .post('/api/logon')
        .send({ nom: 'testuser', password: 'testpassword' });

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: "Error en autenticar l'usuari." });
    });
  });
});