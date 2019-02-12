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

/////////////
// Imports //
/////////////
import express from 'express';
import session from 'express-session';
import fs from 'fs';
import bodyParser from 'body-parser';
import socketIo from 'socket.io';

import counterSocket from './counterSocket';
import serverSocket from './serverSocket';

////////////
//Globals //
////////////
const KEY = 'express.sid';
const SECRET = 'D54F7C0N750L';
global.app = express();

global.Draft = {
	name: '',
	tournament: {},
	players: {}
};
global.Configs = {
	autosaveTime: 60000 //1 minute
}

/////////////
// Configs //
/////////////
app.use(express.static(__dirname + '/../public'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.set('trust proxy', 1);
const sessionStore = session({
	key: KEY,
	secret: SECRET, 
	resave: false,
	saveUninitialized: true,
	cookie: {
		secure: true
	}
});

//////////
// Body //
//////////

// Load games
fs.readFile('draft.json', 'UTF-8', (err, data) => {
	if (err) {return console.error(err)};

	Draft = data ? JSON.parse(data) : Draft;

	console.log('Draft loaded.');
});

global.io = socketIo.listen(
	app.listen(3000, () => {
		console.log('\n- - - Server running - - -\n');
	})
);

// Set ession store on Express
app.use(sessionStore);

// Set session store on Socket.io
io.use(function(socket, next) {sessionStore(socket.request, socket.request.res, next)});

// Routing
require('./routes');

// Initialize game socket
io.of('/game').on('connection', counterSocket);

// Initialize server socket
io.of('/server').on('connection', serverSocket);

// Save Games automatically
setInterval(function() {
	fs.writeFile('draft.json', JSON.stringify(Draft), err => {
		if (err) {return log.error(err)};
		console.log('Draft saved.');
	});
}, Configs.autosaveTime);