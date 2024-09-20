import request from 'supertest';
import express from 'express';
import { MongoDatabase } from '../../src/lib/mongo-database';
import { basicAuthMiddleware } from '../../src/lib/basicauth';
import ingredientsRouter from '../../src/routes/ingredients';
import { IIngredient } from '../../src/lib/ingredients';
import { config } from 'dotenv';

config();
const uri: string = process.env.MONGO_URI || '';

jest.mock('../../src/lib/mongo-database');
jest.mock('../../src/lib/basicauth');

const app = express();
app.use(express.json());
app.use('/api', ingredientsRouter);


describe('Ingredients API', () => {
  let dbMock: jest.Mocked<MongoDatabase>;

  beforeAll(() => {
    dbMock = new MongoDatabase(uri) as jest.Mocked<MongoDatabase>;
    app.locals.db = dbMock;
    (basicAuthMiddleware as jest.Mock).mockImplementation((req, res, next) => next());

  });

  describe('GET /ingredients', () => {
    it('should return a list of ingredients', async () => {
      const mockIngredients: IIngredient[] = [{ _id: 'afafafasfasfas', name: 'Ingredient 1', allergenics: [] }, { _id: 'bdfsdbdfbsdsdb', name: 'Ingredient 2', allergenics: [] }];
      dbMock.getIngredients.mockResolvedValue(mockIngredients);

      const response = await request(app)
        .get('/api/ingredients')
        .set('Authorization', 'Basic dGVzdDp0ZXN0'); // Mock basic auth header

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockIngredients);
    });

    it('should return a 500 error if there is a problem retrieving ingredients', async () => {
      dbMock.getIngredients.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .get('/api/ingredients')
        .set('Authorization', 'Basic dGVzdDp0ZXN0'); // Mock basic auth header

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Error en recuperar ingredients.' });
    });
  });

  describe('GET /ingredients/byname/:nom', () => {
    it('should return an ingredient by name', async () => {
      const mockIngredient: IIngredient = { _id: 'afafafasfasfas', name: 'Ingredient 1', allergenics: [] };
      dbMock.getIngredientByName.mockResolvedValue(mockIngredient);

      const response = await request(app)
        .get('/api/ingredients/byname/Ingredient 1')
        .set('Authorization', 'Basic dGVzdDp0ZXN0'); // Mock basic auth header

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockIngredient);
    });

    it('should return a 404 error if the ingredient is not found', async () => {
      dbMock.getIngredientByName.mockResolvedValue(null);

      const response = await request(app)
        .get('/api/ingredients/byname/Nonexistent')
        .set('Authorization', 'Basic dGVzdDp0ZXN0'); // Mock basic auth header

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'ingredient no trobat.' });
    });
  });

  describe('POST /ingredients', () => {
    it('should create a new ingredient', async () => {
      const newIngredient: IIngredient = { name: 'New Ingredient', allergenics: [] };
      dbMock.getIngredientByName.mockResolvedValue(null);
      dbMock.createIngredient.mockResolvedValue(newIngredient);

      const response = await request(app)
        .post('/api/ingredients')
        .send(newIngredient)
        .set('Authorization', 'Basic dGVzdDp0ZXN0'); // Mock basic auth header

      expect(response.status).toBe(201);
      expect(response.body).toEqual(newIngredient);
    });

    it('should return a 409 error if the ingredient already exists', async () => {
      const existingIngredient = { name: 'Existing Ingredient', allergenics: [] };
      dbMock.getIngredientByName.mockResolvedValue(existingIngredient);

      const response = await request(app)
        .post('/api/ingredients')
        .send(existingIngredient)
        .set('Authorization', 'Basic dGVzdDp0ZXN0'); // Mock basic auth header

      expect(response.status).toBe(409);
      expect(response.body).toEqual({ error: "L'ingredient ja existeix." });
    });
  });

  describe('PUT /ingredients/:_id', () => {
    it('should update an existing ingredient', async () => {
      const updatedIngredient = { _id: '1', name: 'Updated Ingredient', allergenics: [] };
      dbMock.getIngredientById.mockResolvedValue(updatedIngredient);
      dbMock.updateIngredientById.mockResolvedValue(updatedIngredient);

      const response = await request(app)
        .put('/api/ingredients/1')
        .send(updatedIngredient)
        .set('Authorization', 'Basic dGVzdDp0ZXN0'); // Mock basic auth header

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ _id: '1' });
    });

    it('should return a 404 error if the ingredient is not found', async () => {
      dbMock.getIngredientById.mockResolvedValue(null);

      const response = await request(app)
        .put('/api/ingredients/1')
        .send({ name: 'Nonexistent' })
        .set('Authorization', 'Basic dGVzdDp0ZXN0'); // Mock basic auth header

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'ingredient no trobat.' });
    });
  });

  describe('DELETE /ingredients/:_id', () => {
    it('should delete an existing ingredient', async () => {
      const mockIngredient = { _id: '1', name: 'Ingredient 1', allergenics: [] };
      dbMock.getIngredientById.mockResolvedValue(mockIngredient);
      dbMock.deleteIngredient.mockResolvedValue(true);

      const response = await request(app)
        .delete('/api/ingredients/1')
        .set('Authorization', 'Basic dGVzdDp0ZXN0'); // Mock basic auth header

      expect(response.status).toBe(204);
    });

    it('should return a 404 error if the ingredient is not found', async () => {
      dbMock.getIngredientById.mockResolvedValue(null);

      const response = await request(app)
        .delete('/api/ingredients/1')
        .set('Authorization', 'Basic dGVzdDp0ZXN0'); // Mock basic auth header

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'ingredient no trobat.' });
    });
  });

  describe('POST /ingredients/rename', () => {
    it('should rename an ingredient', async () => {
      dbMock.changeRecipesIngredientName = jest.fn().mockResolvedValue(true);
      const response = await request(app)
        .post('/api/ingredients/rename')
        .send({ oldName: 'Ingredient 1', newName: 'Ingredient 2' })
        .set('Authorization', 'Basic dGVzdDp0ZXN0'); // Mock basic auth header

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ success: true });
    });

    it('should return a 400 error if oldName or newName is not provided', async () => {
      const response = await request(app)
        .post('/api/ingredients/rename')
        .send({ oldName: null, newName: null })
        .set('Authorization', 'Basic dGVzdDp0ZXN0'); // Mock basic auth header

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ message: 'Cal proporcionar oldName i newName.' });
    });
  });
});