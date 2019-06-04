import express from 'express';
import fs from 'fs';

const router = express.Router();

/**
 * Server Route
 *
 * @author mauricio.araldi
 * @since 0.6.0
 *
 * @path /server/
 */
router.get('/', (req, res) => {
	let html = fs.readFileSync(__dirname + '/../../public/counter.html');

	res.writeHead(200, {
		"Content-Type" : 'text/html'
	});

	res.write(html);
	res.end();
});

export default router;