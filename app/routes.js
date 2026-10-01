import createCounterRouter from './routes/counter.js';
import createServerRouter from './routes/server.js';

/**
 * Registers all HTTP routes of the application.
 *
 * @param {object} app The Express application
 */
export default function registerRoutes(app) {
  app.use('/', createCounterRouter());
  app.use('/server', createServerRouter());
}
