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

import express from 'express';
import session from 'express-session';
import fs from 'fs';
import bodyParser from 'body-parser';
import socketIo from 'socket.io';

import counterSocket from './sockets/counter.js';
import serverSocket from './sockets/server.js';
import serverSocketHome from './sockets/serverHome.js';

/////////////
// Globals //
/////////////
const KEY = 'express.sid';
const SECRET = 'D54F7C0N750L';

global.app = express();

global.Drafts = {};
global.CurrentDraft  = '';

global.Configs = {
	autoSaveTime: 60000
}

/////////////
// Configs //
/////////////
import path from 'path';
const __dirname = path.resolve();
app.use(express.static(__dirname + '/public'));
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
fs.readFile('data.json', 'UTF-8', (err, data) => {
	if (err) { return console.error(err) };

	Drafts = data ? JSON.parse(data) : Drafts;

	console.log('Drafts loaded.');
});

// Starts server
global.io = socketIo.listen(app.listen(80, () => console.log('\n- - - Server running - - -\n')));

// Set ession store on Express
app.use(sessionStore);

// Set session store on Socket.io
io.use((socket, next) => sessionStore(socket.request, socket.request.res, next));

// Routing
import('./routes.js');

// Initialize counter socket
io.of('/counter').on('connection', counterSocket);

// Initialize server socket
io.of('/server').on('connection', serverSocket);

// Initialize server home socket
io.of('/serverHome').on('connection', serverSocketHome);

// Save Games automatically
setInterval(() => {
    //prevent empty draft save
    var tempDraft = {};
    for (var draft in Drafts) {
        if(Drafts[draft].name){
            tempDraft[draft]= Drafts[draft];
        }
    }
    ////---<
	fs.writeFile('data.json', JSON.stringify(tempDraft), err => {
		if (err) { return log.error(err) };
		console.log('Drafts saved.');
	});
}, Configs.autoSaveTime);