import express from 'express';
import routes from './routes/index.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

const app = express();

// Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/', routes);

// 404 Route Catching
app.use(notFoundHandler);

// Centralized Error Handling
app.use(errorHandler);

export default app;
