import express from 'express';
import fs from 'fs';

    import path from 'path';
    const __dirname = path.resolve();
const router = express.Router();

/**
 * Server Route
 *
 * @author mauricio.araldi
 * @since 0.8.0
 *
 * @path /counter/
 */
router.get('/', (req, res) => {
        
	const html = fs.readFileSync(__dirname + '/public/counter.html');

	res.writeHead(200, {
		'Content-Type' : 'text/html'
	});

	res.write(html);
	res.end();
});

export default router;