import request from 'supertest';
import express from 'express';
import allergenicsRouter from '../../src/routes/allergenics';
import { basicAuthMiddleware } from '../../src/lib/basicauth';
import { MongoDatabase } from '../../src/lib/mongo-database';
import { IAllergenic } from '../../src/lib/allergenics';
import { config } from 'dotenv';

config();
const uri:string = process.env.MONGO_URI || '';
const dbName = 'menudb_test'

// Mock the database and middleware
jest.mock('../../src/lib/mongo-database');
jest.mock('../../src/lib/basicauth');

const app = express();
app.use(express.json());
app.use('/api', allergenicsRouter);

describe('GET /api/allergenics', () => {
  let mockGetAlergenics: jest.Mock;

  beforeAll(() => {
    // Connect to nock database connection and asign to app.locals.db


/*    
    const db = new MongoDatabase(uri);
 (async () => {
  try {
    await db.connect(dbName);
    if (db !== null) {
      await db.init();
      app.locals.db = db;
    } else {
      console.error('Error en connectar amb la base de dades: BD null');
      process.exit(1);
    }
  } catch (error) {
    console.error('Error en connectar amb la base de dades:', error);
    process.exit(1);
  }
})()
*/
    mockGetAlergenics = jest.fn();
    (MongoDatabase as jest.Mock).mockImplementation(() => {
      return {
        getAlergenics: mockGetAlergenics,
      };
    });

    app.locals.db = new MongoDatabase(uri);

    (basicAuthMiddleware as jest.Mock).mockImplementation((req, res, next) => next());
    const allergenicsData: IAllergenic[] = [{ _id: 'jdhdfhdj'  ,name: 'Peanuts' }];
    mockGetAlergenics.mockResolvedValue(allergenicsData);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return allergenics data', async () => {
    const allergenicsData: IAllergenic[] = [{ _id: 'jdhdfhdj'  ,name: 'Peanuts' }];
    mockGetAlergenics.mockResolvedValue(allergenicsData);

    const response = await request(app).get('/api/allergenics');
    expect(response.status).toBe(200);
    expect(response.body).toEqual(allergenicsData);
    expect(mockGetAlergenics).toHaveBeenCalledTimes(1);
  });

  it('should handle errors', async () => {
    mockGetAlergenics.mockRejectedValue(new Error('Database error'));

    const response = await request(app).get('/api/allergenics');

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ error: 'Error en recuperar Alergenics.' });
    expect(mockGetAlergenics).toHaveBeenCalledTimes(1);
  });
});