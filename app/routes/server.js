/////////////
// Imports //
/////////////
import express from 'express';
import fs from 'fs';
import Response from './../../public/resources/js/objects/Response.js';

//Vars
var router = express.Router();

///////////////////
// Module routes //
///////////////////
/**
 * Server Route
 *
 * @author mauricio.araldi
 * @since 0.6.0
 *
 * @path /server/
 */
router.get('/', (req, res) => {
	let html = fs.readFileSync(__dirname + '/../../public/server.html');

	res.writeHead(200, {
		"Content-Type" : 'text/html'
	});

	res.write(html);
	res.end();
});

export default router;