import Player from './../public/resources/js/objects/Player.js';

/**
 * Server socket
 *
 * @author mauricio.araldi
 *
 * @socket /server
 */
export default socket => {
	var session = socket.request.session;

	console.log('Server connected');

	/**
	 * On changing draft name
	 *
	 * @author mauricio.araldi
	 * @since 0.6.0
	 */
	socket.on('draftName', data => {
		Draft.name = data.draftName;
		socket.emit('draftName', Draft.name);
	});

	/**
	 * Sets the draft players
	 *
	 * @author mauricio.araldi
	 * @since 0.6.0
	 */
	socket.on('players', data => {
		Draft.players = {};

		data.forEach(playerName => {
			Draft.players[playerName] = new Player(playerName, 0, 0, 0, 0, 0);
		});

		socket.emit('players', Draft.players);
	});

	/**
	 * Sends all data to the client
	 *
	 * @author mauricio.araldi
	 * @since  0.6.0
	 */
	socket.on('loadGame', data => {
		socket.emit('loadGame', Draft);
		socket.emit('suggestedMatches', buildSuggestedMatches());
	});

	/**
	 * Builds the tournament table
	 *
	 * @author mauricio.araldi
	 * @since 0.6.0
	 */
	socket.on('tournament', data => {
		buildTournamentObject();
		socket.emit('tournament', Draft.tournament);
		socket.emit('suggestedMatches', buildSuggestedMatches());
	})

	/**
	 * Updates tournament scores
	 *
	 * @author mauricio.araldi
	 * @since 0.6.0
	 */
	socket.on('updateScore', data => {
		//Updates table owner score
		Draft.tournament[data.playerId][data.opponentId]['matchesWon'] = data.playerScore ? parseInt(data.playerScore) : null;
		Draft.tournament[data.playerId][data.opponentId]['matchesLost'] = data.opponentScore ? parseInt(data.opponentScore) : null;
		
		//Updates opponent score
		Draft.tournament[data.opponentId][data.playerId]['matchesWon'] = data.opponentScore ? parseInt(data.opponentScore) : null;
		Draft.tournament[data.opponentId][data.playerId]['matchesLost'] = data.playerScore ? parseInt(data.playerScore) : null;

		socket.emit('tournament', Draft.tournament);
		socket.emit('suggestedMatches', buildSuggestedMatches());
	});
};



/* --- Functions --- */ //TODO - Functions should not be in routing



/**
 * Builds the tournament object
 *
 * @author mauricio.araldi
 * @since 0.6.0
 */
function buildTournamentObject() {
	Draft.tournament = {};

	Object.values(Draft.players).forEach(player => {
		Object.values(Draft.players).forEach(opponent => {
			if (player.id == opponent.id) {
				return;
			}

			if (!Draft.tournament[player.id]) {
				Draft.tournament[player.id] = {};
			}
			
			Draft.tournament[player.id][opponent.id] = {matchesWon:null, matchesLost:null};
		});
	});
}

/**
 * Builds the suggested matches
 *
 * @author mauricio.araldi
 * @since 0.6.0
 *
 * @return {Array} Array containing suggested matches
 */
function buildSuggestedMatches() {
	var suggestedMatches = [],
		alreadyEnrolled = [],
		players = Object.values(Draft.players);

	//Sort players by number of games
	players.sort((a, b) => { 
		var aGames = a.gamesWon + a.gamesLost,
			bGames = b.gamesWon + b.gamesLost;

		return aGames - bGames;
	});

	players.forEach(player => {
		//If a match was already suggested to this player, skip it
		if (alreadyEnrolled.indexOf(player.id) > -1) {
			return;
		}

		players.some(opponent => {
			var matchesWon;

			//If is the same as pĺayer, or if a match was already suggested for this opponent, skip it
			if (player.id == opponent.id
				|| alreadyEnrolled.indexOf(opponent.id) > -1) {
				return;
			}

			matchesWon = parseInt(Draft.tournament[player.id][opponent.id].matchesWon);

			//If the player X opponent have played already, skip them
			if (!isNaN(matchesWon)) {
				return;
			}

			alreadyEnrolled.push(player.id);
			alreadyEnrolled.push(opponent.id);

			suggestedMatches.push(player.id +' x '+ opponent.id);

			return true;
		});
	});

	return suggestedMatches;
}