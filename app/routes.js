import server from './routes/server.js';
import counter from './routes/counter.js';

export default ((req, res) => {
	//Routes
	app.use('/', counter);
	app.use('/server', server);
})();