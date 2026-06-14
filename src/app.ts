import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import urlRoutes from './routes/urlRoutes';
import { errorHandler } from './middlewares/errorHandler';
import path from 'path';

const app = express();

app.use(express.json());
app.use('/', urlRoutes);
app.use(express.static(path.join(__dirname, 'public')));
app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  const statusMap: Record<string, number> = {
    'URL not found': 404,
    'Alias already in use': 409,
  };

  const status = statusMap[error.message] ?? 500;
  res.status(status).json({ error: error.message });
});

app.use(errorHandler);
export default app;
