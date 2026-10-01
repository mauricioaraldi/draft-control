import crypto from 'node:crypto';
import PlayerModel from './objects/PlayerModel.js';

/**
 * @typedef {import('./objects/DraftModel.js').default} DraftModel
 */

/**
 * Manages data and flows about drafts
 *
 * @author mauricio.araldi
 * @since 0.8.0
 */
const Draft = {
  /**
   * Generates a random ID for the draft
   *
   * @author mauricio.araldi
   * @since  0.10.0
   *
   * @returns {string} An md5 hex string format to be used as draft ID
   */
  generateId() {
    return crypto.createHash('md5').update(String(Date.now())).digest('hex');
  },

  /**
   * Registers a new draft in the server
   *
   * @author mauricio.araldi
   * @since  0.8.0
   *
   * @param {DraftModel} draft The draft to be registered on server
   */
  register(draft) {
    if (!draft) {
      throw new Error('A draft to be registered is required.');
    }

    Drafts[draft.id] = draft;
  },

  /**
   * Gets a draft from register
   *
   * @author mauricio.araldi
   * @since 0.8.0
   *
   * @param {string} id ID of the draft to be retrieved
   * @returns {DraftModel} The draft from register
   */
  get(id) {
    if (!id) {
      throw new Error('An id is required to retrieve a draft from register.');
    }

    CurrentDraft = id;
    return Drafts[id];
  },

  /**
   * Sets the name of a draft register
   *
   * @author mauricio.araldi
   * @since 0.8.0
   *
   * @param {string} id ID of the draft to have its name set
   * @param {string} name Display name given to the draft by the organizer
   * @returns {DraftModel} The draft from register
   */
  setName(id, name) {
    if (!id) {
      throw new Error('An id is required to set the draft name.');
    }

    if (!name) {
      throw new Error('A name is required to set the draft name.');
    }

    if (!Object.hasOwn(Drafts, id)) {
      throw new Error(`Draft of id ${id} not found to set name`);
    }

    Drafts[id].name = name;
    Drafts[id].date = new Date();

    return Drafts[id];
  },

  /**
   * Adds a player into the draft
   *
   * @author mauricio.araldi
   * @since 0.8.0
   *
   * @param {string} id ID of the draft to have the player added
   * @param {string} name Name of the player to be added
   * @returns {DraftModel} The draft from register
   */
  addPlayer(id, name) {
    Drafts[id].players ||= {};
    Drafts[id].players[name] = new PlayerModel(name);

    return Drafts[id];
  },

  /**
   * Builds the tournament table for a draft
   *
   * @author mauricio.araldi
   * @since 0.8.0
   *
   * @param {string} id ID of the draft to have its tournament table builded
   * @returns {DraftModel} The draft from register
   */
  buildTournamentObject(id) {
    const draft = Drafts[id];

    if (!draft) {
      throw new Error(`No valid draft was found for the id ${id}`);
    }

    const tournament = {};

    Object.values(draft.players).forEach((player) => {
      Object.values(draft.players).forEach((opponent) => {
        if (player.id === opponent.id) {
          return;
        }

        tournament[player.id] ||= {};
        tournament[player.id][opponent.id] = {
          matchesWon: null,
          matchesLost: null,
        };
      });
    });

    Drafts[id].tournament = tournament;

    return Drafts[id];
  },

  /**
   * Builds the suggested matches for a draft
   *
   * @author mauricio.araldi
   * @since 0.8.0
   *
   * @param {string} id ID of the draft to have its matches suggested
   * @returns {string[]} Suggested matches, formatted as "player x opponent"
   */
  buildSuggestedMatches(id) {
    const draft = Drafts[id];

    if (!draft) {
      throw new Error(`No valid draft was found for the id ${id}`);
    }

    const suggestedMatches = [];
    const alreadyEnrolled = [];
    const players = Object.values(draft.players);

    // Sort players by number of games
    players.sort((a, b) => {
      const aGames = a.gamesWon + a.gamesLost;
      const bGames = b.gamesWon + b.gamesLost;

      return aGames - bGames;
    });

    players.forEach((player) => {
      // If a match was already suggested to this player, skip it
      if (alreadyEnrolled.includes(player.id)) {
        return;
      }

      for (const opponent of players) {
        // If is the same as player, or if a match was already suggested for this opponent, skip it
        if (player.id === opponent.id || alreadyEnrolled.includes(opponent.id)) {
          continue;
        }

        const { matchesWon } = draft.tournament[player.id][opponent.id];

        // If the player X opponent have played already, skip them
        if (matchesWon !== null && matchesWon !== undefined) {
          continue;
        }

        alreadyEnrolled.push(player.id, opponent.id);
        suggestedMatches.push(player.id + ' x ' + opponent.id);
        break;
      }
    });

    return suggestedMatches;
  },

  /**
   * Sets the score for a match
   *
   * @author mauricio.araldi
   * @since 0.8.0
   *
   * @param {string} id ID of the draft the match belongs to
   * @param {object} match The match result
   * @param {string} match.playerId The id of the player who played the match
   * @param {number|string} match.playerScore Games won by the player (empty when not played)
   * @param {string} match.opponentId The id of the player faced in the match
   * @param {number|string} match.opponentScore Games won by that player (empty when not played)
   * @returns {DraftModel} The draft from register
   */
  setMatchScore(id, { playerId, playerScore, opponentId, opponentScore }) {
    if (!Object.hasOwn(Drafts, id)) {
      throw new Error(`No valid draft was found for the id ${id}`);
    }

    const player = playerScore ? Math.trunc(Number(playerScore)) : null;
    const opponent = opponentScore ? Math.trunc(Number(opponentScore)) : null;

    // Updates table owner score
    Drafts[id].tournament[playerId][opponentId].matchesWon = player;
    Drafts[id].tournament[playerId][opponentId].matchesLost = opponent;

    // Updates opponent score
    Drafts[id].tournament[opponentId][playerId].matchesWon = opponent;
    Drafts[id].tournament[opponentId][playerId].matchesLost = player;

    return Drafts[id];
  },
};

export default Draft;
