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

import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import express from 'express';
import session from 'express-session';
import bodyParser from 'body-parser';
import { Server } from 'socket.io';
import counterSocket from './sockets/counter.js';
import serverSocket from './sockets/server.js';
import serverSocketHome from './sockets/serverHome.js';
import registerRoutes from './routes.js';

// Globals
const KEY = 'express.sid';
const SECRET = 'D54F7C0N750L';
const PORT = process.env.PORT || 3000;

global.app = express();

global.Drafts = {};
global.CurrentDraft = '';

global.Configs = {
  autoSaveTime: 60_000,
};

// Configs
const __dirname = path.resolve();
app.use(express.static(__dirname + '/public'));
app.use('/vendor/noty', express.static(__dirname + '/node_modules/noty/lib'));
app.use('/vendor/normalize', express.static(__dirname + '/node_modules/normalize.css'));
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(bodyParser.json());
app.set('trust proxy', 1);
const sessionStore = session({
  key: KEY,
  secret: SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: true,
  },
});

// Body

// Load games
try {
  const data = await fs.readFile('data.json', 'utf8');

  Drafts = data ? JSON.parse(data) : Drafts;

  console.log('Drafts loaded.');
} catch (error) {
  console.error(error);
}

// Starts server
global.io = new Server(
  app.listen(PORT, () => console.log(`\n- - - Server running on port ${PORT} - - -\n`))
);

// Set ession store on Express
app.use(sessionStore);

// Set session store on Socket.io
io.engine.use(sessionStore);

// Routing
registerRoutes(app);

// Initialize counter socket
io.of('/counter').on('connection', counterSocket);

// Initialize server socket
io.of('/server').on('connection', serverSocket);

// Initialize server home socket
io.of('/serverHome').on('connection', serverSocketHome);

// Save Games automatically
setInterval(async () => {
  // Prevent empty draft save
  const temporaryDraft = {};
  for (const draft in Drafts) {
    if (Drafts[draft].name) {
      temporaryDraft[draft] = Drafts[draft];
    }
  }

  try {
    await fs.writeFile('data.json', JSON.stringify(temporaryDraft));
    console.log('Drafts saved.');
  } catch (error) {
    console.error(error);
  }
}, Configs.autoSaveTime);
