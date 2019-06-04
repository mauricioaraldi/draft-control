import Draft from '../Draft';
import PlayerModel from '../objects/PlayerModel';

/**
 * Server socket
 *
 * @author mauricio.araldi
 * @since 0.8.0
 *
 * @socket /server
 */
export default socket => {
	const session = socket.request.session;

	let draft = null;

	/**
	 * On receiving draft ID
	 *
	 * @author mauricio.araldi
	 * @since 0.8.0
	 */
	socket.on('id', data => {
		draft = Draft.get(data.id);

		if (!draft) {
			socket.emit('draftUnavailable');
		}
	});

	/**
	 * On changing draft name
	 *
	 * @author mauricio.araldi
	 * @since 0.8.0
	 */
	socket.on('setName', data => {
		draft = Draft.setName(draft.id, data.draftName);
		socket.emit('setName', draft.name);
	});

	/**
	 * Sets the draft players
	 * TODO
	 * @author mauricio.araldi
	 * @since 0.6.0
	 */
	socket.on('players', data => {
		Draft.players = {};

		data.forEach(playerName => {
			Draft.players[playerName] = new PlayerModel(playerName, 0, 0, 0, 0, 0);
		});

		socket.emit('players', Draft.players);
	});

	/**
	 * Sends all data to the client
	 * TODO
	 * @author mauricio.araldi
	 * @since  0.6.0
	 */
	socket.on('loadGame', data => {
		socket.emit('loadGame', Draft);
		socket.emit('suggestedMatches', buildSuggestedMatches());
	});

	/**
	 * Builds the tournament table
	 * TODO
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
	 * TODO
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