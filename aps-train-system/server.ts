/**
 * APS Train System - Backend API Server
 * Express server that provides REST API for the frontend
 * Connects to Redis (configuration) and PostgreSQL (orders)
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { RepositoryFactory } from './infrastructure/persistence/RepositoryFactory';
import { operationsRouter } from './backend/routes/operations';
import { linesRouter } from './backend/routes/lines';
import { processConfigRouter } from './backend/routes/processConfig';
import { ordersRouter } from './backend/routes/orders';
import { schedulingRouter } from './backend/routes/scheduling';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    persistenceMode: RepositoryFactory.getPersistenceMode()
  });
});

// API Routes
app.use('/api/operations', operationsRouter);
app.use('/api/lines', linesRouter);
app.use('/api/process-config', processConfigRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/scheduling', schedulingRouter);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('API Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Initialize database and start server
async function startServer() {
  try {
    // Initialize database schema if using PostgreSQL
    await RepositoryFactory.initializeDatabase();

    app.listen(PORT, () => {
      console.log('🚀 APS Train System Backend API');
      console.log(`📍 Server running on http://localhost:${PORT}`);
      console.log(`🗄️  Persistence mode: ${RepositoryFactory.getPersistenceMode()}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
