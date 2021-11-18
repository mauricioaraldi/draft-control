import express from 'express';
import fs from 'fs';

import Draft from '../Draft.js';
import DraftModel from '../objects/DraftModel.js';
    import path from 'path';
    const __dirname = path.resolve();

const router = express.Router();

/**
 * Server Route
 *
 * @author mauricio.araldi
 * @since 0.8.0
 *
 * @path /server/
 */
router.get('/', (req, res) => {

	let id = req.query.id,
		draft = null;

	if (!id) {
        const html = fs.readFileSync(__dirname + '/public/serverHome.html');
        res.writeHead(200, {'Content-Type' : 'text/html',});
        res.write(html);
        res.end();
        /*
		id = Draft.generateId(req.connection.remoteAddress),
		draft = new DraftModel(id);

		Draft.register(draft);

		res.writeHead(301, {
			'Content-Type' : 'text/html',
			Location: `http://${req.headers['host']}/server?id=${draft.id}`
		});*/
	} else {
		draft = Draft.get(id);
        if (!draft) {
            res.write('Draft not found');
        }
        else{
            const html = fs.readFileSync(__dirname + '/public/server.html');
            res.writeHead(200, {'Content-Type' : 'text/html',});
            res.write(html);
        }
        res.end();
	}

});

export default router;