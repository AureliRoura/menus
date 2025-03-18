import request from 'supertest';
import express from 'express';
import { MongoDatabase } from '../../src/lib/mongo-database';
import recipesRouter from '../../src/routes/recipes';
import { config } from 'dotenv';
import { basicAuthMiddleware } from '../../src/lib/basicauth';
import { Recipe } from '../../src/lib/recipes';

jest.mock('../../src/lib/mongo-database');
jest.mock('../../src/lib/basicauth');


config();
const uri: string = process.env.MONGO_URI || '';


const app = express();
app.use(express.json());
app.use('/api', recipesRouter);

describe('Recipes API', () => {
  let dbMock: jest.Mocked<MongoDatabase>;

  beforeAll(() => {
    dbMock = new MongoDatabase(uri) as jest.Mocked<MongoDatabase>;
    app.locals.db = dbMock;

    (basicAuthMiddleware as jest.Mock).mockImplementation((req, res, next) => next());
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  describe('GET /recipes', () => {
    it('should retrieve all recipes', async () => {
      const mockRecipes = [{ name: 'Recipe 1' }, { name: 'Recipe 2' }];
      dbMock.getRecipes.mockResolvedValue(mockRecipes);

      const response = await request(app)
        .get('/api/recipes')
        .set('Authorization', 'Basic dGVzdDp0ZXN0'); // Mock basic auth header

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockRecipes);
    });

    it('should return a 500 error if there is a server error', async () => {
      dbMock.getRecipes.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .get('/api/recipes')
        .set('Authorization', 'Basic dGVzdDp0ZXN0'); // Mock basic auth header

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Error en recuperar recipes.' });
    });
  });

  describe('GET /recipes/byname/:nom', () => {
    it('should retrieve a recipe by name', async () => {
      const mockRecipe = { name: 'Recipe 1' };
      dbMock.getRecipeByName.mockResolvedValue(mockRecipe);

      const response = await request(app)
        .get('/api/recipes/byname/Recipe 1')
        .set('Authorization', 'Basic dGVzdDp0ZXN0'); // Mock basic auth header

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockRecipe);
    });

    it('should return a 404 error if the recipe is not found', async () => {
      dbMock.getRecipeByName.mockResolvedValue(null);

      const response = await request(app)
        .get('/api/recipes/byname/Nonexistent')
        .set('Authorization', 'Basic dGVzdDp0ZXN0'); // Mock basic auth header

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'recipe no trobat.' });
    });

    it('should return a 500 error if there is a server error', async () => {
      dbMock.getRecipeByName.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .get('/api/recipes/byname/Recipe 1')
        .set('Authorization', 'Basic dGVzdDp0ZXN0'); // Mock basic auth header

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Error en recuperar recipe.' });
    });
  });

  describe('GET /recipes/byid/:_id', () => {
    it('should retrieve a recipe by id', async () => {
      const mockRecipe = { name: 'Recipe 1' };
      dbMock.getRecipeById.mockResolvedValue(mockRecipe);

      const response = await request(app)
        .get('/api/recipes/byid/1')
        .set('Authorization', 'Basic dGVzdDp0ZXN0'); // Mock basic auth header

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockRecipe);
    });

    it('should return a 404 error if the recipe is not found', async () => {
      dbMock.getRecipeById.mockResolvedValue(null);

      const response = await request(app)
        .get('/api/recipes/byid/Nonexistent')
        .set('Authorization', 'Basic dGVzdDp0ZXN0'); // Mock basic auth header

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'recipe no trobat.' });
    });

    it('should return a 500 error if there is a server error', async () => {
      dbMock.getRecipeById.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .get('/api/recipes/byid/1')
        .set('Authorization', 'Basic dGVzdDp0ZXN0'); // Mock basic auth header

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Error en recuperar recipe.' });
    });
  });

  describe('POST /recipes', () => {
    it('should create a new recipe', async () => {
      const mockRecipe = { name: 'Recipe 1', ingredients: [] };
      dbMock.getRecipeByName.mockResolvedValue(null);
      dbMock.createRecipe.mockResolvedValue(mockRecipe);

      const response = await request(app)
        .post('/api/recipes')
        .send(mockRecipe)
        .set('Authorization', 'Basic dGVzdDp0ZXN0'); // Mock basic auth header

      expect(response.status).toBe(201); // Match updated status code
      expect(response.body).toEqual(mockRecipe);
    });

    it('should return a 400 error if recipe data is missing', async () => {
      const response = await request(app)
        .post('/api/recipes')
        .send({})
        .set('Authorization', 'Basic dGVzdDp0ZXN0'); // Mock basic auth header

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: "Falten dades d'recipe." });
    });

    it('should return a 409 error if the recipe already exists', async () => {
      const mockRecipe = { name: 'Recipe 1', ingredients: [] };
      dbMock.getRecipeByName.mockResolvedValue(mockRecipe);

      const response = await request(app)
        .post('/api/recipes')
        .send(mockRecipe)
        .set('Authorization', 'Basic dGVzdDp0ZXN0'); // Mock basic auth header

      expect(response.status).toBe(409); // Match updated status code
      expect(response.body).toEqual({ error: 'L\'recipe ja existeix.' }); // Match updated error message
    });

    it('should return a 500 error if there is a server error', async () => {
      dbMock.getRecipeByName.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .post('/api/recipes')
        .send({ name: 'Recipe 1', ingredients: [] })
        .set('Authorization', 'Basic dGVzdDp0ZXN0'); // Mock basic auth header

      expect(response.status).toBe(500); // Match updated status code
      expect(response.body).toEqual({ error: 'Error en crear recipe.' }); // Match updated error message
    });
  });

  describe('PUT /recipes/:_id', () => {
    it('should update an existing recipe', async () => {
      const mockRecipe = { _id: '1', name: 'Recipe 1' };
      dbMock.getRecipeById.mockResolvedValue(mockRecipe);
      dbMock.updateRecipeById.mockResolvedValue(mockRecipe);

      const response = await request(app)
        .put('/api/recipes/1')
        .send(mockRecipe)
        .set('Authorization', 'Basic dGVzdDp0ZXN0'); // Mock basic auth header

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ _id: '1' });
    });

    it('should return a 404 error if the recipe is not found', async () => {
      dbMock.getRecipeById.mockResolvedValue(null);

      const response = await request(app)
        .put('/api/recipes/Nonexistent')
        .send({ name: 'Recipe 1' })
        .set('Authorization', 'Basic dGVzdDp0ZXN0'); // Mock basic auth header

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'recipe no trobat.' });
    });

    it('should return a 500 error if there is a server error', async () => {
      dbMock.getRecipeById.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .put('/api/recipes/1')
        .send({ name: 'Recipe 1' })
        .set('Authorization', 'Basic dGVzdDp0ZXN0'); // Mock basic auth header

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Error en actualitzar recipe.' });
    });
  });

  describe('DELETE /recipes/:_id', () => {
    it('should delete an existing recipe', async () => {
      const mockRecipe = { _id: '1', name: 'Recipe 1' };
      dbMock.getRecipeById.mockResolvedValue(mockRecipe);
      dbMock.deleteRecipe.mockResolvedValue(true);

      const response = await request(app)
        .delete('/api/recipes/1')
        .set('Authorization', 'Basic dGVzdDp0ZXN0'); // Mock basic auth header

      expect(response.status).toBe(204);
    });

    it('should return a 404 error if the recipe is not found', async () => {
      dbMock.getRecipeById.mockResolvedValue(null);

      const response = await request(app)
        .delete('/api/recipes/Nonexistent')
        .set('Authorization', 'Basic dGVzdDp0ZXN0'); // Mock basic auth header

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'recipe no trobat.' });
    });

    it('should return a 500 error if there is a server error', async () => {
      dbMock.getRecipeById.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .delete('/api/recipes/1')
        .set('Authorization', 'Basic dGVzdDp0ZXN0'); // Mock basic auth header

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Error en eliminar recipe.' });
    });
  });

  describe('GET /recipes/rename', () => {
    it('should rename a recipe', async () => {
      dbMock.changeRecipeName.mockResolvedValue();

      const response = await request(app)
        .get('/api/recipes/rename')
        .send({ oldName: 'Old Recipe', newName: 'New Recipe' })
        .set('Authorization', 'Basic dGVzdDp0ZXN0'); // Mock basic auth header

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ success: true });
    });

    it('should return a 400 error if oldName or newName is not provided', async () => {
      const response = await request(app)
        .get('/api/recipes/rename')
        .send({ oldName: '', newName: '' })
        .set('Authorization', 'Basic dGVzdDp0ZXN0'); // Mock basic auth header

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ message: 'Cal proporcionar oldName i newName.' });
    });

    it('should return a 500 error if there is a server error', async () => {
      dbMock.changeRecipeName.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .get('/api/recipes/rename')
        .send({ oldName: 'Old Recipe', newName: 'New Recipe' })
        .set('Authorization', 'Basic dGVzdDp0ZXN0'); // Mock basic auth header

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Error en renombrar recipe.' });
    });
  });
});