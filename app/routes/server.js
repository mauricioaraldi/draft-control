import fs from 'node:fs';
import path from 'node:path';
import { Router } from 'express';
import Draft from '../Draft.js';

const __dirname = path.resolve();

/**
 * Server Route, serves the draft home at `/server/` and a draft's page at `/server/?id=<draft id>`.
 *
 * @author mauricio.araldi
 * @since 0.8.0
 *
 * @returns {Router} Router to be mounted at `/server`
 */
export default function createServerRouter() {
  const router = new Router();

  router.get('/', (request, response) => {
    const { id } = request.query;

    if (!id) {
      const html = fs.readFileSync(__dirname + '/public/serverHome.html');
      response.writeHead(200, {
        'Content-Type': 'text/html',
      });
      response.end(html);
      return;
    }

    const draft = Draft.get(id);

    if (!draft) {
      response.end('Draft not found');
      return;
    }

    const html = fs.readFileSync(__dirname + '/public/server.html');
    response.writeHead(200, {
      'Content-Type': 'text/html',
    });
    response.end(html);
  });

  return router;
}
