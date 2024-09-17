import request from 'supertest';
import express from 'express';
import { MongoDatabase } from '../../src/lib/mongo-database';
import { basicAuthMiddleware } from '../../src/lib/basicauth';
import categoriesRouter from '../../src/routes/categories';
import { ICategories } from '../../src/lib/recipes';
import { config } from 'dotenv';

config();
const uri:string = process.env.MONGO_URI || '';

jest.mock('../../src/lib/mongo-database');
jest.mock('../../src/lib/basicauth');

const app = express();
app.use(express.json());
app.use('/api', categoriesRouter);

let dbMock: jest.Mocked<MongoDatabase>;
let mockGetCategories: jest.Mock

beforeAll(() => {

  mockGetCategories = jest.fn();
  (MongoDatabase as jest.Mock).mockImplementation(() => {
    return {
      getCategories: mockGetCategories,
    };
  });

  app.locals.db = new MongoDatabase(uri);

  (basicAuthMiddleware as jest.Mock).mockImplementation((req, res, next) => next());
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('GET /categories', () => {


  

  it('should return a list of categories', async () => {
    const mockCategories:ICategories[] = [{ Category: 'Fruits', values: ['Apple', 'Banana'], }, { Category: 'Vegetables', values: ['Carrot', 'Broccoli'], }];

    mockGetCategories.mockResolvedValue(mockCategories);

    const response = await request(app)
      .get('/api/categories')
      .set('Authorization', 'Basic dGVzdDp0ZXN0'); // Mock basic auth header

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockCategories);
  });

  it('should return a 500 error if there is a problem retrieving categories', async () => {
    mockGetCategories.mockRejectedValue(new Error('Database error'));

    const response = await request(app)
      .get('/api/categories')
      .set('Authorization', 'Basic dGVzdDp0ZXN0'); // Mock basic auth header

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ error: 'Error en recuperar categories.' });
  });
});