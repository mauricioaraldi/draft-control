//Dependencies
import server from './routes/server.js';
import counter from './routes/counter.js';

//Self executable
export default (function(req, res) {
	//Routes
	app.use('/', counter);
	app.use('/server', server);
})();