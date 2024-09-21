import request from 'supertest';
import express from 'express';
import { basicAuthMiddleware } from '../../src/lib/basicauth';
import { MongoDatabase } from '../../src/lib/mongo-database';
import UnitsRouter from '../../src/routes/units';
import { IUnit } from '../../src/lib/units';
import { config } from 'dotenv';

config();
const uri:string = process.env.MONGO_URI || '';
const dbName = 'menudb_test'

// Mock the database and middleware
jest.mock('../../src/lib/mongo-database');
jest.mock('../../src/lib/basicauth');


const app = express();
app.use(express.json());
app.use('/api', UnitsRouter);

describe('Units API', () => {
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

  describe('GET /units', () => {
    it('should retrieve all units', async () => {
      const mockUnits:IUnit[] = [ { unit: 'Unit 1' }, { unit: 'Unit 2' } ];
      dbMock.getUnits.mockResolvedValue(mockUnits);

      const response = await request(app)
        .get('/api/units')
        .set('Authorization', 'Basic dGVzdDp0ZXN0'); // Mock basic auth header

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockUnits);
    });

    it('should return a 500 error if there is a server error', async () => {
      dbMock.getUnits.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .get('/api/units')
        .set('Authorization', 'Basic dGVzdDp0ZXN0'); // Mock basic auth header

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Error en recuperar Units.' });
    });
  });

  describe('POST /units', () => {
    it('should create a new unit', async () => {
      const mockUnit = { unit: 'Unit 1' };
      dbMock.getUnit.mockResolvedValue(null);
      dbMock.createUnit.mockResolvedValue(mockUnit);

      const response = await request(app)
        .post('/api/units')
        .send(mockUnit)
        .set('Authorization', 'Basic dGVzdDp0ZXN0'); // Mock basic auth header

      expect(response.status).toBe(201);
      expect(response.body).toEqual({ success: true });
    });

    it('should return a 400 error if unit data is missing', async () => {
      const response = await request(app)
        .post('/api/units')
        .send({})
        .set('Authorization', 'Basic dGVzdDp0ZXN0'); // Mock basic auth header

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ message: 'name is required.' });
    });

    it('should return a 400 error if the unit already exists', async () => {
      const mockUnit = { unit: 'Unit 1' };
      dbMock.getUnit.mockResolvedValue(mockUnit);

      const response = await request(app)
        .post('/api/units')
        .send(mockUnit)
        .set('Authorization', 'Basic dGVzdDp0ZXN0'); // Mock basic auth header

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ message: 'Unit already exists.' });
    });

    it('should return a 500 error if there is a server error', async () => {
      dbMock.getUnit.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .post('/api/units')
        .send({ unit: 'Unit 1' })
        .set('Authorization', 'Basic dGVzdDp0ZXN0'); // Mock basic auth header

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Error en afegir Unit.' });
    });
  });

  describe('PUT /units/rename', () => {
    it('should rename an existing unit', async () => {
      dbMock.changeRecipesIngredientUnit.mockResolvedValue();

      const response = await request(app)
        .put('/api/units/rename')
        .send({ oldUnitName: 'Old Unit', newUnitName: 'New Unit' })
        .set('Authorization', 'Basic dGVzdDp0ZXN0'); // Mock basic auth header

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ success: true });
    });

    it('should return a 400 error if oldUnitName or newUnitName is not provided', async () => {
      const response = await request(app)
        .put('/api/units/rename')
        .send({ oldUnitName: '', newUnitName: '' })
        .set('Authorization', 'Basic dGVzdDp0ZXN0'); // Mock basic auth header

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ message: 'Both oldUnitName and newUnitName are required.' });
    });

    it('should return a 500 error if there is a server error', async () => {
      dbMock.changeRecipesIngredientUnit.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .put('/api/units/rename')
        .send({ oldUnitName: 'Old Unit', newUnitName: 'New Unit' })
        .set('Authorization', 'Basic dGVzdDp0ZXN0'); // Mock basic auth header

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Error en renombrar Unit.' });
    });
  });
});