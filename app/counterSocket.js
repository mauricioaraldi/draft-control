/**
 * Counter socket
 *
 * @author mauricio.araldi
 *
 * @socket /
 */
export default socket => {
	var session = socket.request.session;

	console.log('Counter connected');

	/**
	 * When players are requested
	 *
	 * @author mauricio.araldi
	 * @since 0.6.0
	 */
	socket.on('players', data => {
		socket.emit('players', {players: Draft.players});
	});

	/**
	 * Whenever a game ends
	 *
	 * @author mauricio.araldi
	 * @since 0.6.0
	 */
	socket.on('endGame', data => {
		//Updates winner score
		Draft.tournament[data.winner][data.loser]['matchesWon']++;
		
		//Updates loser score
		Draft.tournament[data.loser][data.winner]['matchesLost']++;

		io.of('/server').emit('tournament', Draft.tournament);
	});
};