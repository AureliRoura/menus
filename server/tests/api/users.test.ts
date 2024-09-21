import request from 'supertest';
import express from 'express';
import { basicAuthMiddleware } from '../../src/lib/basicauth';
import { MongoDatabase } from '../../src/lib/mongo-database';
import usersRouter from '../../src/routes/users';
import { IUser } from '../../src/lib/user';
import { config } from 'dotenv';

config();
const uri:string = process.env.MONGO_URI || '';
const dbName = 'menudb_test'

// Mock the database and middleware
jest.mock('../../src/lib/mongo-database');
jest.mock('../../src/lib/basicauth');

const app = express();
app.use(express.json());
app.use('/api', usersRouter);

describe('Users API', () => {
  let dbMock: jest.Mocked<MongoDatabase>;

  beforeAll(() => {
    dbMock = new MongoDatabase(uri) as jest.Mocked<MongoDatabase>;
    app.locals.db = dbMock;

    // Mock the basic auth middleware
    (basicAuthMiddleware as jest.Mock).mockImplementation((req, res, next) => next());
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /checksession', () => {
    it('should return a valid session message', async () => {
      const response = await request(app)
        .get('/api/checksession')
        .set('Authorization', 'Basic dGVzdDp0ZXN0'); // Mock basic auth header

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: 'Sessió vàlida' });
    });

  });

  

  describe('GET /users', () => {
    it('should retrieve all users', async () => {
      const mockUsers:IUser[] = [ { name: 'User 1', email: 'test@test.com', password: 'password' }, { name: 'User 2', email: 'test@test.com', password: 'password' } ]; 
      dbMock.getUsers.mockResolvedValue(mockUsers);

      const response = await request(app)
        .get('/api/users')
        .set('Authorization', 'Basic dGVzdDp0ZXN0'); // Mock basic auth header

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockUsers);
    });

    it('should return a 500 error if there is a server error', async () => {
      dbMock.getUsers.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .get('/api/users')
        .set('Authorization', 'Basic dGVzdDp0ZXN0'); // Mock basic auth header

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Error en recuperar users.' });
    });
  });

  describe('GET /users/:nom', () => {
    it('should retrieve a user by name', async () => {
      const mockUser = { name: 'User 1', email: 'test@test.com', password: 'password' };
      dbMock.getUserByName.mockResolvedValue(mockUser);

      const response = await request(app)
        .get('/api/users/User 1')
        .set('Authorization', 'Basic dGVzdDp0ZXN0'); // Mock basic auth header

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockUser);
    });

    it('should return a 404 error if the user is not found', async () => {
      dbMock.getUserByName.mockResolvedValue(null);

      const response = await request(app)
        .get('/api/users/Nonexistent')
        .set('Authorization', 'Basic dGVzdDp0ZXN0'); // Mock basic auth header

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'Usuari no trobat.' });
    });

    it('should return a 500 error if there is a server error', async () => {
      dbMock.getUserByName.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .get('/api/users/User 1')
        .set('Authorization', 'Basic dGVzdDp0ZXN0'); // Mock basic auth header

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Error en recuperar usuari.' });
    });
  });

  describe('POST /users', () => {
    it('should create a new user', async () => {
      const mockUser = { nom: 'User 1', email: 'user1@example.com', password: 'password' };
      dbMock.getUserByName.mockResolvedValue(null);
      dbMock.createUser.mockResolvedValue({ _id: '1', name: 'User 1', email: 'user1@example.com', password: 'password'});

      const response = await request(app)
        .post('/api/users')
        .send(mockUser)
        .set('Authorization', 'Basic dGVzdDp0ZXN0'); // Mock basic auth header

      expect(response.status).toBe(201);
      expect(response.body).toEqual({ _id: '1', name: 'User 1', email: 'user1@example.com', password: 'password'});
    });

    it('should return a 400 error if user data is missing', async () => {
      const response = await request(app)
        .post('/api/users')
        .send({})
        .set('Authorization', 'Basic dGVzdDp0ZXN0'); // Mock basic auth header

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: "Falten dades d'usuari." });
    });

    it('should return a 409 error if the user already exists', async () => {
      const mockUser = { nom: 'User 1', email: 'user1@example.com', password: 'password' };
      dbMock.getUserByName.mockResolvedValue({ name: 'User 1', email: 'user1@example.com', password: 'password' });

      const response = await request(app)
        .post('/api/users')
        .send(mockUser)
        .set('Authorization', 'Basic dGVzdDp0ZXN0'); // Mock basic auth header

      expect(response.status).toBe(409);
      expect(response.body).toEqual({ error: "L'usuari ja existeix." });
    });

    it('should return a 500 error if there is a server error', async () => {
      dbMock.getUserByName.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .post('/api/users')
        .send({ nom: 'User 1', email: 'user1@example.com', password: 'password' })
        .set('Authorization', 'Basic dGVzdDp0ZXN0'); // Mock basic auth header

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Error en crear usuari.' });
    });
  });

  describe('PUT /users/:nom', () => {
    it('should update an existing user', async () => {
      const mockUser = { _id: '1', name: 'User 1', email: 'user1@example.com', password: 'password' };
      dbMock.getUserByName.mockResolvedValue(mockUser);
      dbMock.updateUserById.mockResolvedValue(mockUser);

      const response = await request(app)
        .put('/api/users/User 1')
        .send({ email: 'newemail@example.com', password: 'newpassword' })
        .set('Authorization', 'Basic dGVzdDp0ZXN0'); // Mock basic auth header

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ _id: '1' });
    });

    it('should return a 400 error if user data is missing', async () => {
      const response = await request(app)
        .put('/api/users/User 1')
        .send({})
        .set('Authorization', 'Basic dGVzdDp0ZXN0'); // Mock basic auth header

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: "Falten dades d'usuari." });
    });

    it('should return a 404 error if the user is not found', async () => {
      dbMock.getUserByName.mockResolvedValue(null);

      const response = await request(app)
        .put('/api/users/Nonexistent')
        .send({ email: 'newemail@example.com', password: 'newpassword' })
        .set('Authorization', 'Basic dGVzdDp0ZXN0'); // Mock basic auth header

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'Usuari no trobat.' });
    });

    it('should return a 500 error if there is a server error', async () => {
      dbMock.getUserByName.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .put('/api/users/User 1')
        .send({ email: 'newemail@example.com', password: 'newpassword' })
        .set('Authorization', 'Basic dGVzdDp0ZXN0'); // Mock basic auth header

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Error en actualitzar usuari.' });
    });
  });

  describe('DELETE /users/:nom', () => {
    it('should delete an existing user', async () => {
      const mockUser = {  _id: '1', name: 'User 1', email: 'test@test.com', password: 'password' };
      dbMock.getUserByName.mockResolvedValue(mockUser);
      dbMock.deleteUser.mockResolvedValue(true);

      const response = await request(app)
        .delete('/api/users/User 1')
        .set('Authorization', 'Basic dGVzdDp0ZXN0'); // Mock basic auth header

      expect(response.status).toBe(204);
    });

    it('should return a 404 error if the user is not found', async () => {
      dbMock.getUserByName.mockResolvedValue(null);

      const response = await request(app)
        .delete('/api/users/Nonexistent')
        .set('Authorization', 'Basic dGVzdDp0ZXN0'); // Mock basic auth header

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'Usuari no trobat.' });
    });

    it('should return a 500 error if there is a server error', async () => {
      dbMock.getUserByName.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .delete('/api/users/User 1')
        .set('Authorization', 'Basic dGVzdDp0ZXN0'); // Mock basic auth header

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Error en eliminar usuari.' });
    });
  });

  describe('POST /users/register', () => {
    it('should register a user and generate a QR code', async () => {
      const mockUser = { _id: '1', name: 'User 1', email: 'user1@example.com', password: 'password' };
      dbMock.getUserByName.mockResolvedValue(mockUser);
      dbMock.updateUserById.mockResolvedValue(mockUser);

      const response = await request(app)
        .post('/api/users/register')
        .send({ username: 'User 1' })
        .set('Authorization', 'Basic dGVzdDp0ZXN0'); // Mock basic auth header

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('secret');
      expect(response.body).toHaveProperty('url');
    });

    it('should return a 404 error if the user is not found', async () => {
      dbMock.getUserByName.mockResolvedValue(null);

      const response = await request(app)
        .post('/api/users/register')
        .send({ username: 'Nonexistent' })
        .set('Authorization', 'Basic dGVzdDp0ZXN0'); // Mock basic auth header

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'Usuari no trobat.' });
    });

    it('should return a 500 error if there is a server error', async () => {
      dbMock.getUserByName.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .post('/api/users/register')
        .send({ username: 'User 1' })
        .set('Authorization', 'Basic dGVzdDp0ZXN0'); // Mock basic auth header

      expect(response.status).toBe(500);
      expect(response.text).toBe('Error generating QR code');
    });
  });

  describe('POST /users/verify', () => {
    it('should verify a user token', async () => {
      const mockUser = { _id: '1', name: 'User 1', email: 'user1@example.com', password: 'password', secret: 'secret' };
      dbMock.getUserByName.mockResolvedValue(mockUser);

      const response = await request(app)
        .post('/api/users/verify')
        .send({ username: 'User 1', token: '123456' })
        .set('Authorization', 'Basic dGVzdDp0ZXN0'); // Mock basic auth header

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('isValid');
    });

    it('should return a 404 error if the user is not found', async () => {
      dbMock.getUserByName.mockResolvedValue(null);

      const response = await request(app)
        .post('/api/users/verify')
        .send({ username: 'Nonexistent', token: '123456' })
        .set('Authorization', 'Basic dGVzdDp0ZXN0'); // Mock basic auth header

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'Usuari no trobat.' });
    });

    it('should return a 400 error if the user has no secret', async () => {
      const mockUser = { _id: '1', name: 'User 1', email: 'user1@example.com', password: 'password', secret: '' };
      dbMock.getUserByName.mockResolvedValue(mockUser);

      const response = await request(app)
        .post('/api/users/verify')
        .send({ username: 'User 1', token: '123456' })
        .set('Authorization', 'Basic dGVzdDp0ZXN0'); // Mock basic auth header

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Usuari sense secret.' });
    });

    it('should return a 500 error if there is a server error', async () => {
      dbMock.getUserByName.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .post('/api/users/verify')
        .send({ username: 'User 1', token: '123456' })
        .set('Authorization', 'Basic dGVzdDp0ZXN0'); // Mock basic auth header

      expect(response.status).toBe(500);
      expect(response.text).toBe('Error verifying token');
    });
  });

  describe('GET /users/mfa/:username', () => {
    it('should return MFA status for a user', async () => {
      const mockUser = { _id: '1', name: 'User 1', email: 'user1@example.com', password: 'password', secret: 'secret' };
      dbMock.getUserByName.mockResolvedValue(mockUser);

      const response = await request(app)
        .get('/api/users/mfa/User 1')
        .set('Authorization', 'Basic dGVzdDp0ZXN0'); // Mock basic auth header

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ mfa: true });
    });

    it('should return a 404 error if the user is not found', async () => {
      dbMock.getUserByName.mockResolvedValue(null);

      const response = await request(app)
        .get('/api/users/mfa/Nonexistent')
        .set('Authorization', 'Basic dGVzdDp0ZXN0'); // Mock basic auth header

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'Usuari no trobat.' });
    });

    it('should return a 500 error if there is a server error', async () => {
      dbMock.getUserByName.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .get('/api/users/mfa/User 1')
        .set('Authorization', 'Basic dGVzdDp0ZXN0'); // Mock basic auth header

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Error en recuperar usuari.' });
    });
  });
});