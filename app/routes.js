//Dependencies
import server from './routes/server.js';

//Self executable
export default (function(req, res) {
	//Routes
	app.use('/server', server);
})();