import request from 'supertest';
import express from 'express';
import { MongoDatabase } from '../../src/lib/mongo-database';
import menusRouter from '../../src/routes/menus';
import { config } from 'dotenv';
import { basicAuthMiddleware } from '../../src/lib/basicauth';
import { IMenu } from '../../src/lib/menus';
import { IRecipe } from '../../src/lib/recipes';

jest.mock('../../src/lib/mongo-database');
jest.mock('../../src/lib/basicauth');


config();
const uri: string = process.env.MONGO_URI || '';

const app = express();
app.use(express.json());
app.use('/api', menusRouter);

describe('Menus API', () => {
  let dbMock: jest.Mocked<MongoDatabase>;

  beforeAll(() => {
    dbMock = new MongoDatabase(uri) as jest.Mocked<MongoDatabase>;
    app.locals.db = dbMock;
    (basicAuthMiddleware as jest.Mock).mockImplementation((req, res, next) => next());
  });

  describe('GET /menus', () => {
    it('should retrieve all menus', async () => {
      const mockMenus: IMenu[] = [{ _id: 'afafafasfasfas', name: 'Menu 1', menu: { monday: { lunch: [], dinner: [] }, tuesday: { lunch: [], dinner: [] }, wednesday: { lunch: [], dinner: [] }, thursday: { lunch: [], dinner: [] }, friday: { lunch: [], dinner: [] }, saturday: { lunch: [], dinner: [] }, sunday: { lunch: [], dinner: [] } } }, { _id: 'bdfsdbdfbsdsdb', name: 'Menu 2', menu: { monday: { lunch: [], dinner: [] }, tuesday: { lunch: [], dinner: [] }, wednesday: { lunch: [], dinner: [] }, thursday: { lunch: [], dinner: [] }, friday: { lunch: [], dinner: [] }, saturday: { lunch: [], dinner: [] }, sunday: { lunch: [], dinner: [] } } }];
      dbMock.getMenus.mockResolvedValue(mockMenus);

      const response = await request(app)
        .get('/api/menus')
        .set('Authorization', 'Basic dGVzdDp0ZXN0'); // Mock basic auth header

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockMenus);
    });

    it('should return a 500 error if there is a server error', async () => {
      dbMock.getMenus.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .get('/api/menus')
        .set('Authorization', 'Basic dGVzdDp0ZXN0'); // Mock basic auth header

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Error en recuperar menus.' });
    });
  });

  describe('GET /menus/byname/:nom', () => {
    it('should retrieve a menu by name', async () => {
      const mockMenu = { _id: 'afafafasfasfas', name: 'Menu 1', menu: { monday: { lunch: [], dinner: [] }, tuesday: { lunch: [], dinner: [] }, wednesday: { lunch: [], dinner: [] }, thursday: { lunch: [], dinner: [] }, friday: { lunch: [], dinner: [] }, saturday: { lunch: [], dinner: [] }, sunday: { lunch: [], dinner: [] } } };
      dbMock.getMenuByName.mockResolvedValue(mockMenu);

      const response = await request(app)
        .get('/api/menus/byname/Menu 1')
        .set('Authorization', 'Basic dGVzdDp0ZXN0'); // Mock basic auth header

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockMenu);
    });

    it('should return a 404 error if the menu is not found', async () => {
      dbMock.getMenuByName.mockResolvedValue(null);

      const response = await request(app)
        .get('/api/menus/byname/Nonexistent')
        .set('Authorization', 'Basic dGVzdDp0ZXN0'); // Mock basic auth header

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'menu no trobat.' });
    });

    it('should return a 500 error if there is a server error', async () => {
      dbMock.getMenuByName.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .get('/api/menus/byname/Menu 1')
        .set('Authorization', 'Basic dGVzdDp0ZXN0'); // Mock basic auth header

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Error en recuperar menu.' });
    });
  });

  describe('POST /menus', () => {
    it('should create a new menu', async () => {
      const mockMenu = { _id: 'afafafasfasfas', name: 'Menu 1', menu: { monday: { lunch: [], dinner: [] }, tuesday: { lunch: [], dinner: [] }, wednesday: { lunch: [], dinner: [] }, thursday: { lunch: [], dinner: [] }, friday: { lunch: [], dinner: [] }, saturday: { lunch: [], dinner: [] }, sunday: { lunch: [], dinner: [] } } };
      dbMock.getMenuByName.mockResolvedValue(null);
      dbMock.createMenu.mockResolvedValue(mockMenu);

      const response = await request(app)
        .post('/api/menus')
        .send(mockMenu)
        .set('Authorization', 'Basic dGVzdDp0ZXN0'); // Mock basic auth header

      expect(response.status).toBe(201);
      expect(response.body).toEqual(mockMenu);
    });

    it('should return a 400 error if menu data is missing', async () => {
      const response = await request(app)
        .post('/api/menus')
        .send({})
        .set('Authorization', 'Basic dGVzdDp0ZXN0'); // Mock basic auth header

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: "Falten dades d'menu." });
    });

    it('should return a 409 error if the menu already exists', async () => {
      const mockMenu = { _id: 'afafafasfasfas', name: 'Menu 1', menu: { monday: { lunch: [], dinner: [] }, tuesday: { lunch: [], dinner: [] }, wednesday: { lunch: [], dinner: [] }, thursday: { lunch: [], dinner: [] }, friday: { lunch: [], dinner: [] }, saturday: { lunch: [], dinner: [] }, sunday: { lunch: [], dinner: [] } } };
      dbMock.getMenuByName.mockResolvedValue(mockMenu);

      const response = await request(app)
        .post('/api/menus')
        .send(mockMenu)
        .set('Authorization', 'Basic dGVzdDp0ZXN0'); // Mock basic auth header

      expect(response.status).toBe(409);
      expect(response.body).toEqual({ error: "L'menu ja existeix." });
    });

    it('should return a 500 error if there is a server error', async () => {
      dbMock.getMenuByName.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .post('/api/menus')
        .send({ name: 'Menu 1' })
        .set('Authorization', 'Basic dGVzdDp0ZXN0'); // Mock basic auth header

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Error en crear menu.' });
    });
  });

  // Add more tests for other endpoints as needed
});