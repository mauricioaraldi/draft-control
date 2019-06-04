import express from 'express';
import fs from 'fs';

import Draft from '../Draft';
import DraftModel from '../objects/DraftModel';

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
	const html = fs.readFileSync(__dirname + '/../../public/server.html');

	let id = req.query.id,
		draft = null;

	if (!id) {
		id = Draft.generateId(req.connection.remoteAddress),
		draft = new DraftModel(id);

		Draft.register(draft);

		res.writeHead(301, {
			'Content-Type' : 'text/html',
			Location: `http://${req.headers['host']}/server?id=${draft.id}`
		});
	} else {
		draft = Draft.get(id);

		res.writeHead(200, {
			'Content-Type' : 'text/html',
		});
	}

	if (!draft) {
		res.write('Draft not found');
		res.end();
		return;
	}

	res.write(html);
	res.end();
});

export default router;