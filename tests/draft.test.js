import assert from 'node:assert/strict';
import { after, beforeEach, describe, test } from 'node:test';
import fs from 'node:fs/promises';
import Draft from '../app/Draft.js';
import { flushSave } from '../app/storage.js';
import { createTournament, setupGlobals } from './setup.js';

const names = ['Ana', 'Bruno', 'Caio', 'Duda', 'Edu', 'Fê', 'Gabi', 'Hugo'];
let folder;

/**
 * Identifies a match regardless of which player is listed first
 *
 * @param {string} playerId One of the players of the match
 * @param {string} opponentId The other player of the match
 * @returns {string} Both IDs sorted alphabetically, joined by "|"
 */
const matchKey = (playerId, opponentId) =>
  [playerId, opponentId].toSorted((a, b) => a.localeCompare(b)).join('|');

beforeEach(async () => {
  folder = await setupGlobals();
});

after(async () => {
  await flushSave();
  await fs.rm(folder, { recursive: true, force: true });
});

/**
 * Lists the pairs of players that still have to play
 *
 * @param {object} draft Draft whose tournament table is read
 * @returns {Set<string>} Keys of the unplayed matches (see matchKey)
 */
function unplayedPairs(draft) {
  const pairs = new Set();

  Object.keys(draft.players).forEach((playerId) => {
    Object.entries(draft.tournament[playerId]).forEach(([opponentId, result]) => {
      if (result.matchesWon === null && result.matchesLost === null) {
        pairs.add(matchKey(playerId, opponentId));
      }
    });
  });

  return pairs;
}

/**
 * Checks that the suggested rounds cover each unplayed pair exactly once and that no
 * player plays twice in the same round
 *
 * @param {object} draft Draft the suggestions were built for
 * @param {string[][]} rounds Suggested rounds, as returned by buildSuggestedMatches
 */
function assertValidSuggestions(draft, rounds) {
  const suggested = [];

  rounds.forEach((round) => {
    const playersInRound = round.flatMap((match) => match.split(' x '));

    assert.equal(new Set(playersInRound).size, playersInRound.length, 'player twice in a round');
    round.forEach((match) => {
      suggested.push(matchKey(...match.split(' x ', 2)));
    });
  });

  assert.equal(new Set(suggested).size, suggested.length, 'match suggested twice');
  assert.deepEqual(new Set(suggested), unplayedPairs(draft));
}

describe('Draft ids and register', () => {
  test('generateId returns unique UUIDs', () => {
    const ids = new Set(Array.from({ length: 100 }, () => Draft.generateId()));

    assert.equal(ids.size, 100);
    [...ids].forEach((id) => assert.match(id, /^[\da-f]{8}-(?:[\da-f]{4}-){3}[\da-f]{12}$/v));
  });

  test('get only changes the current draft when the draft exists', () => {
    const draft = createTournament(names.slice(0, 2));

    Draft.get(draft.id);
    Draft.get('missing');

    assert.equal(CurrentDraft, draft.id);
  });
});

describe('Draft tournament', () => {
  test('buildTournamentObject creates an empty result for every pair', () => {
    const draft = createTournament(names.slice(0, 4));

    Object.keys(draft.players).forEach((playerId) => {
      const opponents = Object.keys(draft.tournament[playerId]);

      assert.equal(opponents.length, 3);
      assert.ok(!opponents.includes(playerId));
      Object.values(draft.tournament[playerId]).forEach((result) => {
        assert.deepEqual(result, { matchesWon: null, matchesLost: null });
      });
    });
    assert.deepEqual(draft.standings, names.slice(0, 4));
  });

  test('setMatchScore mirrors the score on both players', () => {
    const draft = createTournament(names.slice(0, 2));

    Draft.setMatchScore(draft.id, {
      playerId: 'Ana',
      playerScore: '2',
      opponentId: 'Bruno',
      opponentScore: '0',
    });

    assert.deepEqual(draft.tournament.Ana.Bruno, { matchesWon: 2, matchesLost: 0 });
    assert.deepEqual(draft.tournament.Bruno.Ana, { matchesWon: 0, matchesLost: 2 });
  });

  test('setMatchScore with empty scores clears the match', () => {
    const draft = createTournament(names.slice(0, 2));
    const match = { playerId: 'Ana', opponentId: 'Bruno' };

    Draft.setMatchScore(draft.id, { ...match, playerScore: '2', opponentScore: '1' });
    Draft.setMatchScore(draft.id, { ...match, playerScore: '', opponentScore: '' });

    assert.deepEqual(draft.tournament.Ana.Bruno, { matchesWon: null, matchesLost: null });
  });

  test('setMatchScore rejects invalid matches', () => {
    const draft = createTournament(names.slice(0, 2));
    const score = { playerScore: '2', opponentScore: '0' };

    assert.throws(
      () => Draft.setMatchScore(draft.id, { ...score, playerId: 'Ana', opponentId: 'Zé' }),
      /Player Zé is not part of this tournament/v
    );
    assert.throws(
      () => Draft.setMatchScore(draft.id, { ...score, playerId: 'Ana', opponentId: 'Ana' }),
      /cannot play against themselves/v
    );
    assert.throws(
      () =>
        Draft.setMatchScore(draft.id, {
          playerId: 'Ana',
          opponentId: 'Bruno',
          playerScore: 'two',
          opponentScore: '0',
        }),
      /Scores must be numbers/v
    );
    assert.throws(
      () => Draft.setMatchScore('missing', { ...score, playerId: 'Ana', opponentId: 'Bruno' }),
      /No tournament was found/v
    );
  });

  test('registerGameResult adds one game to each side', () => {
    const draft = createTournament(names.slice(0, 2));

    Draft.registerGameResult(draft.id, { winner: 'Ana', loser: 'Bruno' });
    Draft.registerGameResult(draft.id, { winner: 'Ana', loser: 'Bruno' });
    Draft.registerGameResult(draft.id, { winner: 'Bruno', loser: 'Ana' });

    assert.deepEqual(draft.tournament.Ana.Bruno, { matchesWon: 2, matchesLost: 1 });
    assert.deepEqual(draft.tournament.Bruno.Ana, { matchesWon: 1, matchesLost: 2 });
    assert.throws(
      () => Draft.registerGameResult(draft.id, { winner: 'Ana', loser: 'Zé' }),
      /Player Zé is not part of this tournament/v
    );
  });
});

describe('Draft standings', () => {
  test('player results count best-of-threes and games', () => {
    const draft = createTournament(names.slice(0, 3));

    Draft.setMatchScore(draft.id, {
      playerId: 'Ana',
      playerScore: '2',
      opponentId: 'Bruno',
      opponentScore: '1',
    });
    Draft.setMatchScore(draft.id, {
      playerId: 'Ana',
      playerScore: '0',
      opponentId: 'Caio',
      opponentScore: '2',
    });

    assert.deepEqual(
      {
        gamesWon: draft.players.Ana.gamesWon,
        gamesLost: draft.players.Ana.gamesLost,
        totalGames: draft.players.Ana.totalGames,
        matchesWon: draft.players.Ana.matchesWon,
        matchesLost: draft.players.Ana.matchesLost,
      },
      { gamesWon: 1, gamesLost: 1, totalGames: 2, matchesWon: 2, matchesLost: 3 }
    );
  });

  test('ranking follows the criteria in order', () => {
    const draft = createTournament(['Ana', 'Bruno', 'Caio', 'Duda']);
    const play = (playerId, opponentId, playerScore, opponentScore) =>
      Draft.setMatchScore(draft.id, { playerId, opponentId, playerScore, opponentScore });

    // Bruno and Duda tie on best-of-threes, Duda won more games
    play('Caio', 'Ana', '2', '0');
    play('Caio', 'Duda', '2', '1');
    play('Bruno', 'Ana', '2', '0');
    play('Bruno', 'Caio', '0', '2');
    play('Duda', 'Ana', '2', '1');

    assert.deepEqual(draft.standings, ['Caio', 'Duda', 'Bruno', 'Ana']);
  });

  test('games won and lost break ties between equal best-of-three records', () => {
    const draft = createTournament(['Ana', 'Bruno', 'Caio', 'Duda']);

    Draft.setMatchScore(draft.id, {
      playerId: 'Ana',
      playerScore: '2',
      opponentId: 'Bruno',
      opponentScore: '1',
    });
    Draft.setMatchScore(draft.id, {
      playerId: 'Caio',
      playerScore: '2',
      opponentId: 'Duda',
      opponentScore: '0',
    });

    assert.deepEqual(draft.standings, ['Caio', 'Ana', 'Bruno', 'Duda']);
  });
});

describe('Draft suggested matches', () => {
  test('returns no rounds while there is no tournament', () => {
    const id = Draft.generateId();

    Draft.register({ id, players: {} });
    Draft.addPlayer(id, 'Ana');

    assert.deepEqual(Draft.buildSuggestedMatches(id), []);
  });

  for (const [count, minimumRounds] of [
    [4, 3],
    [5, 5],
    [8, 7],
    [9, 9],
  ]) {
    test(`a fresh tournament of ${count} players takes ${minimumRounds} rounds`, () => {
      const draft = createTournament([...names, 'Ivo'].slice(0, count));
      const rounds = Draft.buildSuggestedMatches(draft.id);

      assert.equal(rounds.length, minimumRounds);
      assertValidSuggestions(draft, rounds);
    });
  }

  test('suggestions adapt to every registered match until the end', () => {
    const draft = createTournament(names);
    let rounds = Draft.buildSuggestedMatches(draft.id);
    let step = 0;

    while (rounds.length > 0) {
      const pending = rounds.flat();
      // Sometimes plays a match from the end of the list instead of the next suggested one
      const [playerId, opponentId] = (step % 3 === 2 ? pending.at(-1) : pending[0]).split(' x ', 2);

      Draft.setMatchScore(draft.id, {
        playerId,
        opponentId,
        playerScore: '2',
        opponentScore: '1',
      });
      rounds = Draft.buildSuggestedMatches(draft.id);
      assertValidSuggestions(draft, rounds);
      step++;
    }

    assert.equal(step, 28);
  });

  test('a score registered only for the opponent counts as played', () => {
    const draft = createTournament(names.slice(0, 2));

    draft.tournament.Bruno.Ana.matchesWon = 2;

    assert.deepEqual(Draft.buildSuggestedMatches(draft.id), []);
  });
});
