import fs from 'node:fs';
import path from 'node:path';
import { Router } from 'express';

const __dirname = path.resolve();

/**
 * Counter Route, serves the life counter page at `/`.
 *
 * @author mauricio.araldi
 * @since 0.8.0
 *
 * @returns {Router} Router to be mounted at `/`
 */
export default function createCounterRouter() {
  const router = new Router();

  router.get('/', (request, response) => {
    const html = fs.readFileSync(__dirname + '/public/counter.html');

    response.writeHead(200, {
      'Content-Type': 'text/html',
    });

    response.write(html);
    response.end();
  });

  return router;
}
