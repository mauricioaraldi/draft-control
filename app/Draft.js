import crypto from 'node:crypto';
import PlayerModel from './objects/PlayerModel.js';
import { scheduleSave } from './storage.js';

/**
 * @typedef {import('./objects/DraftModel.js').default} DraftModel
 */

/**
 * Checks if a match between two players already has a registered score
 *
 * @author mauricio.araldi
 * @since 0.10.0
 *
 * @param {object} tournament The tournament table of the draft
 * @param {string} playerId The id of one of the players of the match
 * @param {string} opponentId The id of the other player of the match
 * @returns {boolean} If any score was registered for the match
 */
function isMatchPlayed(tournament, playerId, opponentId) {
  const hasScore = (score) => score !== null && score !== undefined;

  return [tournament[playerId][opponentId], tournament[opponentId][playerId]].some(
    ({ matchesWon, matchesLost }) => hasScore(matchesWon) || hasScore(matchesLost)
  );
}

/**
 * Finds the best round of simultaneous matches among the pending ones. The best round has
 * as many matches as possible and, between rounds of the same size, gives priority to the
 * players with more pending matches, so they don't delay the end of the tournament
 *
 * @author mauricio.araldi
 * @since 0.10.0
 *
 * @param {string[]} playerIds The ids of all players of the draft
 * @param {Map<string, Set<string>>} pendingMatches The opponents each player still has to face
 * @returns {Array<[string, string]>} The pairs of players that play in the round
 */
function findBestRound(playerIds, pendingMatches) {
  const pendingCount = (playerId) => pendingMatches.get(playerId).size;
  const players = playerIds
    .filter((playerId) => pendingCount(playerId) > 0)
    .toSorted((a, b) => pendingCount(b) - pendingCount(a));
  const enrolled = new Set();
  const round = [];
  let best = { pairs: [], priority: -1 };

  const search = (index, priority) => {
    while (index < players.length && enrolled.has(players[index])) {
      index++;
    }

    const freePlayers = players.slice(index).filter((playerId) => !enrolled.has(playerId));
    const freePriorities = freePlayers.map((playerId) => pendingCount(playerId));
    const maxPairs = round.length + Math.floor(freePlayers.length / 2);
    // With an odd number of free players, at least one of them sits out
    const maxPriority =
      priority +
      freePriorities.reduce((sum, count) => sum + count, 0) -
      (freePlayers.length % 2 === 1 ? Math.min(...freePriorities) : 0);

    if (
      maxPairs < best.pairs.length ||
      (maxPairs === best.pairs.length && maxPriority <= best.priority)
    ) {
      return;
    }

    if (index >= players.length) {
      best = { pairs: [...round], priority };
      return;
    }

    const player = players[index];

    enrolled.add(player);

    for (const opponent of players.slice(index + 1)) {
      if (enrolled.has(opponent) || !pendingMatches.get(player).has(opponent)) {
        continue;
      }

      enrolled.add(opponent);
      round.push([player, opponent]);
      search(index + 1, priority + pendingCount(player) + pendingCount(opponent));
      round.pop();
      enrolled.delete(opponent);
    }

    // Also tries the round without this player
    search(index + 1, priority);
    enrolled.delete(player);
  };

  search(0, 0);

  return best.pairs;
}

/**
 * Gets a draft that has a tournament table, checking that the given players are part of it
 *
 * @author mauricio.araldi
 * @since 0.10.0
 *
 * @param {string} id ID of the draft that should hold the tournament
 * @param {string[]} playerIds IDs of the players that must be in the tournament
 * @returns {DraftModel} The draft from register
 */
function getTournamentDraft(id, playerIds) {
  const draft = Drafts[id];

  if (!draft?.tournament) {
    throw new Error(`No tournament was found for the draft ${id}`);
  }

  playerIds.forEach((playerId) => {
    if (!Object.hasOwn(draft.tournament, playerId)) {
      throw new Error(`Player ${playerId} is not part of this tournament`);
    }
  });

  if (new Set(playerIds).size !== playerIds.length) {
    throw new Error('A player cannot play against themselves');
  }

  return draft;
}

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
   * @returns {string} A random UUID to be used as draft ID
   */
  generateId() {
    return crypto.randomUUID();
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
    scheduleSave();
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

    if (Object.hasOwn(Drafts, id)) {
      CurrentDraft = id;
    }

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
    scheduleSave();

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
    scheduleSave();

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
    Draft.updateStandings(id);

    return Drafts[id];
  },

  /**
   * Builds the suggested order for all matches that weren't played yet, grouped in rounds of
   * matches that can happen at the same time. As it is rebuilt from the registered scores, the
   * suggestion adapts when a match different from the suggested one is played
   *
   * @author mauricio.araldi
   * @since 0.8.0
   *
   * @param {string} id ID of the draft to have its matches suggested
   * @returns {string[][]} Rounds of suggested matches, each formatted as "player x opponent"
   */
  buildSuggestedMatches(id) {
    const draft = Drafts[id];

    if (!draft) {
      throw new Error(`No valid draft was found for the id ${id}`);
    }

    if (!draft.tournament) {
      return [];
    }

    const playerIds = Object.keys(draft.players);
    const pendingMatches = new Map(playerIds.map((playerId) => [playerId, new Set()]));
    const rounds = [];

    playerIds.forEach((playerId, index) => {
      playerIds.slice(index + 1).forEach((opponentId) => {
        if (isMatchPlayed(draft.tournament, playerId, opponentId)) {
          return;
        }

        pendingMatches.get(playerId).add(opponentId);
        pendingMatches.get(opponentId).add(playerId);
      });
    });

    let round = findBestRound(playerIds, pendingMatches);

    while (round.length > 0) {
      rounds.push(round.map(([playerId, opponentId]) => `${playerId} x ${opponentId}`));

      round.forEach(([playerId, opponentId]) => {
        pendingMatches.get(playerId).delete(opponentId);
        pendingMatches.get(opponentId).delete(playerId);
      });

      round = findBestRound(playerIds, pendingMatches);
    }

    return rounds;
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
    const { tournament } = getTournamentDraft(id, [playerId, opponentId]);
    const player = playerScore ? Math.trunc(Number(playerScore)) : null;
    const opponent = opponentScore ? Math.trunc(Number(opponentScore)) : null;

    if (Number.isNaN(player) || Number.isNaN(opponent)) {
      throw new TypeError('Scores must be numbers');
    }

    // Updates table owner score
    tournament[playerId][opponentId].matchesWon = player;
    tournament[playerId][opponentId].matchesLost = opponent;

    // Updates opponent score
    tournament[opponentId][playerId].matchesWon = opponent;
    tournament[opponentId][playerId].matchesLost = player;

    Draft.updateStandings(id);

    return Drafts[id];
  },

  /**
   * Registers the result of a single game, as reported by the life counter
   *
   * @author mauricio.araldi
   * @since 0.10.0
   *
   * @param {string} id ID of the draft the game belongs to
   * @param {object} result Who won and who lost the game
   * @param {string} result.winner The id of the player who won the game
   * @param {string} result.loser The id of the player who lost the game
   * @returns {DraftModel} The draft from register
   */
  registerGameResult(id, { winner, loser }) {
    const { tournament } = getTournamentDraft(id, [winner, loser]);

    tournament[winner][loser].matchesWon++;
    tournament[loser][winner].matchesLost++;

    Draft.updateStandings(id);

    return Drafts[id];
  },

  /**
   * Updates the results of each player and the ranking of the draft. A best-of-three is won
   * by winning 2 games. The ranking criteria are, in order: best-of-threes won (more is
   * better), best-of-threes played (more is better), best-of-threes lost (less is better),
   * games won (more is better) and games lost (less is better)
   *
   * @author mauricio.araldi
   * @since 0.10.0
   *
   * @param {string} id ID of the draft to have its standings updated
   * @returns {DraftModel} The draft from register
   */
  updateStandings(id) {
    const draft = Drafts[id];

    Object.values(draft.players).forEach((player) => {
      const results = Object.values(draft.tournament[player.id] ?? {});

      player.matchesWon = results.reduce((sum, result) => sum + Number(result.matchesWon), 0);
      player.matchesLost = results.reduce((sum, result) => sum + Number(result.matchesLost), 0);
      player.gamesWon = results.reduce(
        (sum, result) => sum + Math.trunc(Number(result.matchesWon) / 2),
        0
      );
      player.gamesLost = results.reduce(
        (sum, result) => sum + Math.trunc(Number(result.matchesLost) / 2),
        0
      );
      player.totalGames = player.gamesWon + player.gamesLost;
    });

    draft.standings = Object.values(draft.players)
      .toSorted(
        (a, b) =>
          b.gamesWon - a.gamesWon ||
          b.totalGames - a.totalGames ||
          a.gamesLost - b.gamesLost ||
          b.matchesWon - a.matchesWon ||
          a.matchesLost - b.matchesLost
      )
      .map((player) => player.id);

    scheduleSave();

    return draft;
  },
};

export default Draft;
