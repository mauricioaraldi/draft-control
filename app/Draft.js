import crypto from 'crypto';

import DraftModel from './objects/DraftModel.js';
import PlayerModel from './objects/PlayerModel.js';

/**
 * Manages data and flows about drafts
 *
 * @author mauricio.araldi
 * @since 0.8.0
 */
export default class Draft {
	/**
	 * Generates a random ID for the draft
	 * 
	 * @author mauricio.araldi
	 * @since  0.8.0
	 * 
	 * @param {String} [salt = ''] An aditional identifier to help make the ID unique
	 * @return {String} An md5 hex string format to be used as draft ID
	 */
	static generateId(salt = '') {
		return crypto.createHash('md5').update(`${new Date().getTime()}${salt}`).digest('hex');
	}

	/**
	 * Registers a new draft in the server
	 * 
	 * @author mauricio.araldi
	 * @since  0.8.0
	 * 
	 * @param {DraftModel} The draft to be registered on server
	 */
	static register(draft) {
		if (!draft) {
			throw new Error('A draft to be registered is required.');
		}

		Drafts[draft.id] = draft;
	}

	/**
	 * Gets a draft from register
	 * 
	 * @author mauricio.araldi
	 * @since 0.8.0
	 *
	 * @param {Integer} id ID of the draft to be retrieved
	 * @return {DraftModel} The draft from register
	 */
	static get(id) {
		if (!id) {
			throw new Error('An id is required to retrieve a draft from register.');
		}
        CurrentDraft=id;
		return Drafts[id];
	}

	/**
	 * Sets the name of a draft register
	 * 
	 * @author mauricio.araldi
	 * @since 0.8.0
	 *
	 * @param {Integer} id ID of the draft to have its name set
	 * @param {String} name Name of the draft
	 * @return {DraftModel} The draft from register
	 */
	static setName(id, name) {
		if (!id) {
			throw new Error('An id is required to set the draft name.');
		}

		if (!name) {
			throw new Error('A name is required to set the draft name.');
		}

		if (!Drafts[id]) {
			throw new Error(`Draft of id ${id} not found to set name`);
		}

		Drafts[id].name = name;
        Drafts[id].date = new Date();

		return Drafts[id];
	}

	/**
	 * Adds a player into the draft
	 * 
	 * @author mauricio.araldi
	 * @since 0.8.0
	 *
	 * @param {Integer} id ID of the draft to have the player added
	 * @param {String} name Name of the player to be added
	 * @return {DraftModel} The draft from register
	 */
	static addPlayer(id, name) {
		if (!Drafts[id].players) {
			Drafts[id].players = {};
		}

		Drafts[id].players[name] = new PlayerModel(name, 0, 0, 0, 0, 0);

		return Drafts[id];
	}

	/**
	 * Builds the tournament table for a draft
	 * 
	 * @author mauricio.araldi
	 * @since 0.8.0
	 * 
	 * @param {Integer} id ID of the draft to have its tournament table builded
	 * @return {DraftModel} The draft from register
	 */
	static buildTournamentObject(id) {
		const draft = Drafts[id];

		if (!draft) {
			throw Error(`No valid draft was found for the id ${id}`);
		}

		const tournament = {};

		Object.values(draft.players).forEach(player => {
			Object.values(draft.players).forEach(opponent => {
				if (player.id === opponent.id) {
					return;
				}

				if (!tournament[player.id]) {
					tournament[player.id] = {};
				}
				
				tournament[player.id][opponent.id] = { matchesWon: null, matchesLost: null };
			});
		});

		Drafts[id].tournament = tournament;

		return Drafts[id];
	}

	/**
	 * Builds the suggested matches for a draft
	 *
	 * @author mauricio.araldi
	 * @since 0.8.0
	 *
	 * @param {Integer} id ID of the draft to have its matches suggested
	 * @return {DraftModel} The draft from register
	 */
	static buildSuggestedMatches(id) {
		const draft = Drafts[id];

		if (!draft) {
			throw Error(`No valid draft was found for the id ${id}`);
		}

		const suggestedMatches = [],
			alreadyEnrolled = [],
			players = Object.values(draft.players);

		//Sort players by number of games
		players.sort((a, b) => { 
			const aGames = a.gamesWon + a.gamesLost,
				bGames = b.gamesWon + b.gamesLost;

			return aGames - bGames;
		});

		players.forEach(player => {
			//If a match was already suggested to this player, skip it
			if (alreadyEnrolled.indexOf(player.id) > -1) {
				return;
			}

			players.some(opponent => {
				let matchesWon = null;

				//If is the same as pĺayer, or if a match was already suggested for this opponent, skip it
				if (player.id == opponent.id
					|| alreadyEnrolled.indexOf(opponent.id) > -1) {
					return;
				}

				matchesWon = parseInt(draft.tournament[player.id][opponent.id].matchesWon);

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

	/**
	 * Sets the score for a match
	 *
	 * @author mauricio.araldi
	 * @since 0.8.0
	 *
	 * @param {Integer} id ID of the draft to have its matches suggested
	 * @param {Integer} playerId The id of the player who played the match
	 * @param {Integer} playerScore The score of the player who played the match
	 * @param {Integer} opponentId The id of the opponent
	 * @param {Integer} opponentScore The score of the opponent
	 * @return {DraftModel} The draft from register
	 */
	static setMatchScore(id, playerId, playerScore, opponentId, opponentScore) {
		if (!Drafts[id]) {
			throw Error(`No valid draft was found for the id ${id}`);
		}

		//Updates table owner score
		Drafts[id].tournament[playerId][opponentId]['matchesWon'] = playerScore ? parseInt(playerScore) : null;
		Drafts[id].tournament[playerId][opponentId]['matchesLost'] = opponentScore ? parseInt(opponentScore) : null;
		
		//Updates opponent score
		Drafts[id].tournament[opponentId][playerId]['matchesWon'] = opponentScore ? parseInt(opponentScore) : null;
		Drafts[id].tournament[opponentId][playerId]['matchesLost'] = playerScore ? parseInt(playerScore) : null;

		return Drafts[id];
	}
}