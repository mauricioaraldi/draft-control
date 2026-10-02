/**************************************************************
 ***************************************************************
 ** Draft Control
 **
 ** A project by Mauricio Araldi
 **
 ** All rights reserved (CC).
 ** Do not redistribute without authorization.
 ** This project is licensed under GNU General Public License 3.0
 ***************************************************************
 **************************************************************/

import path from 'node:path';
import process from 'node:process';
import express from 'express';
import bodyParser from 'body-parser';
import { Server } from 'socket.io';
import Draft from './Draft.js';
import registerRoutes from './routes.js';
import registerSockets from './sockets/index.js';
import { flushSave, loadDrafts } from './storage.js';

// Globals
const PORT = process.env.PORT || 3000;

global.app = express();

global.Drafts = {};
global.CurrentDraft = '';

global.Configs = {
  dataFile: 'data.json',
  saveDelay: 1000,
};

// Configs
const __dirname = path.resolve();
app.use(express.static(__dirname + '/public'));
app.use('/vendor/normalize', express.static(__dirname + '/node_modules/normalize.css'));
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(bodyParser.json());
app.set('trust proxy', 1);

// Load games
try {
  Drafts = await loadDrafts(Configs.dataFile);

  Object.values(Drafts)
    .filter((draft) => draft.tournament && !draft.standings)
    .forEach((draft) => Draft.updateStandings(draft.id));

  console.log('Drafts loaded.');
} catch (error) {
  console.error(error);
}

// Starts server
global.io = new Server(
  app.listen(PORT, () => console.log(`\n- - - Server running on port ${PORT} - - -\n`))
);

// Routing
registerRoutes(app);

// Sockets
registerSockets(io);

// Saves pending changes before the server stops
for (const signal of ['SIGINT', 'SIGTERM']) {
  process.once(signal, async () => {
    await flushSave();
    process.exit(0);
  });
}
