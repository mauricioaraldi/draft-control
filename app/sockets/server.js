import Draft from '../Draft.js';
import PlayerModel from '../objects/PlayerModel.js';

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

		socket.emit('draftData', draft);
	});

	/**
	 * On changing draft name
	 *
	 * @author mauricio.araldi
	 * @since 0.8.0
	 */
	socket.on('setName', data => {
		draft = Draft.setName(draft.id, data.draftName);
		socket.emit('setName', draft);
	});

	/**
	 * Sets the draft players
	 * 
	 * @author mauricio.araldi
	 * @since 0.8.0
	 */
	socket.on('players', data => {
		data.forEach(playerName => {
			draft = Draft.addPlayer(draft.id, playerName);
		});

		socket.emit('players', draft.players);
	});

	/**
	 * Sends all data to the client
	 * TODO
	 * @author mauricio.araldi
	 * @since  0.6.0
	 */
	socket.on('loadGame', data => {
        draft = Draft.get(draft.id);
		socket.emit('loadGame', draft);
        if(draft.tournament){
            socket.emit('suggestedMatches', Draft.buildSuggestedMatches(draft.id));
        }
	});

	/**
	 * Builds the tournament table
	 * 
	 * @author mauricio.araldi
	 * @since 0.8.0
	 */
	socket.on('tournament', data => {
		draft = Draft.buildTournamentObject(draft.id);

		socket.emit('tournament', draft.tournament);
		socket.emit('suggestedMatches', Draft.buildSuggestedMatches(draft.id));
	})

	/**
	 * Updates tournament scores
	 * 
	 * @author mauricio.araldi
	 * @since 0.8.0
	 */
	socket.on('updateScore', data => {
		draft = Draft.setMatchScore(draft.id, data.playerId, data.playerScore, data.opponentId, data.opponentScore);

		socket.emit('tournament', draft.tournament);
		socket.emit('suggestedMatches', Draft.buildSuggestedMatches(draft.id));
	});
};