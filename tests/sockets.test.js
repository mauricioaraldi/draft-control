import assert from 'node:assert/strict';
import { after, afterEach, before, beforeEach, test } from 'node:test';
import fs from 'node:fs/promises';
import { createServer } from 'node:http';
import { Server } from 'socket.io';
import { io as connect } from 'socket.io-client';
import Draft from '../app/Draft.js';
import registerSockets from '../app/sockets/index.js';
import { flushSave } from '../app/storage.js';
import { createTournament, setupGlobals } from './setup.js';

let httpServer;
let url;
let folder;
const clients = [];

/**
 * Connects a client to a namespace of the test server
 *
 * @param {string} namespace Namespace to connect to, like '/server'
 * @returns {Promise<import('socket.io-client').Socket>} The connected client
 */
async function client(namespace) {
  const socket = connect(url + namespace, { transports: ['websocket'], forceNew: true });

  clients.push(socket);
  await once(socket, 'connect');

  return socket;
}

/**
 * Waits for the next time a client receives an event
 *
 * @param {import('socket.io-client').Socket} socket The client
 * @param {string} event Name of the event
 * @returns {Promise<unknown>} The data sent with the event
 */
function once(socket, event) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`Timed out waiting for "${event}"`)), 2000);

    socket.once(event, (data) => {
      clearTimeout(timer);
      resolve(data);
    });
  });
}

/**
 * Connects a client to the server page namespace and opens a draft on it
 *
 * @param {string} draftId ID of the draft to open
 * @returns {Promise<import('socket.io-client').Socket>} The connected client
 */
async function serverPage(draftId) {
  const socket = await client('/server');
  const opened = once(socket, 'draftData');

  socket.emit('id', { id: draftId });
  await opened;

  return socket;
}

before(async () => {
  httpServer = createServer();
  global.io = new Server(httpServer);
  registerSockets(io);
  await new Promise((resolve) => {
    httpServer.listen(0, '127.0.0.1', resolve);
  });
  url = `http://127.0.0.1:${httpServer.address().port}`;
});

beforeEach(async () => {
  folder = await setupGlobals();
});

afterEach(async () => {
  clients.splice(0).forEach((socket) => socket.disconnect());
  await flushSave();
  await fs.rm(folder, { recursive: true, force: true });
});

after(async () => {
  await new Promise((resolve) => {
    io.close(resolve);
  });
});

test('a score update reaches every server page of the draft', async () => {
  const draft = createTournament(['Ana', 'Bruno', 'Caio', 'Duda']);
  const editor = await serverPage(draft.id);
  const viewer = await serverPage(draft.id);
  const viewerTournament = once(viewer, 'tournament');
  const viewerSuggestions = once(viewer, 'suggestedMatches');

  editor.emit('updateScore', {
    playerId: 'Ana',
    playerScore: '2',
    opponentId: 'Bruno',
    opponentScore: '0',
  });

  const update = await viewerTournament;
  const suggestions = await viewerSuggestions;

  assert.deepEqual(update.tournament.Ana.Bruno, { matchesWon: 2, matchesLost: 0 });
  assert.equal(update.standings[0], 'Ana');
  assert.equal(update.players.Ana.gamesWon, 1);
  assert.ok(!suggestions.flat().includes('Ana x Bruno'));
});

test('server pages of other drafts are not updated', async () => {
  const draft = createTournament(['Ana', 'Bruno']);
  const otherDraft = createTournament(['Caio', 'Duda']);
  const editor = await serverPage(draft.id);
  const otherPage = await serverPage(otherDraft.id);
  let wasOtherPageUpdated = false;

  otherPage.on('tournament', () => {
    wasOtherPageUpdated = true;
  });
  editor.emit('updateScore', {
    playerId: 'Ana',
    playerScore: '2',
    opponentId: 'Bruno',
    opponentScore: '1',
  });
  await once(editor, 'tournament');

  assert.equal(wasOtherPageUpdated, false);
});

test('invalid requests send an error and the server keeps working', async () => {
  const draft = createTournament(['Ana', 'Bruno']);
  const page = await serverPage(draft.id);
  const error = once(page, 'appError');

  page.emit('updateScore', {
    playerId: 'Ana',
    playerScore: '2',
    opponentId: 'Zé',
    opponentScore: '0',
  });

  assert.match(await error, /Player Zé is not part of this tournament/v);

  const update = once(page, 'tournament');

  page.emit('updateScore', {
    playerId: 'Ana',
    playerScore: '2',
    opponentId: 'Bruno',
    opponentScore: '0',
  });

  const { tournament } = await update;

  assert.equal(tournament.Ana.Bruno.matchesWon, 2);
});

test('requests before opening a draft send an error', async () => {
  const page = await client('/server');
  const error = once(page, 'appError');

  page.emit('tournament');

  assert.equal(await error, 'No draft is open on this page');
});

test('opening an unknown draft is reported', async () => {
  const page = await client('/server');
  const unavailable = once(page, 'draftUnavailable');

  page.emit('id', { id: 'missing' });

  assert.equal(await unavailable, undefined);
});

test('a game from the counter updates the server page of its draft', async () => {
  const draft = createTournament(['Ana', 'Bruno', 'Caio']);
  const otherDraft = createTournament(['Duda', 'Edu']);
  const page = await serverPage(draft.id);

  Draft.get(otherDraft.id);

  const counter = await client('/counter');
  const update = once(page, 'tournament');
  const suggestions = once(page, 'suggestedMatches');

  counter.emit('endGame', { id: draft.id, winner: 'Caio', loser: 'Ana' });

  const { tournament } = await update;
  const rounds = await suggestions;

  assert.deepEqual(tournament.Caio.Ana, { matchesWon: 1, matchesLost: null });
  assert.ok(rounds.length > 0);
});

test('the counter without an id uses the last opened draft', async () => {
  const draft = createTournament(['Ana', 'Bruno']);

  await serverPage(draft.id);

  const counter = await client('/counter');
  const players = once(counter, 'players');

  counter.emit('players', { id: '' });

  const { draft: counterDraft } = await players;

  assert.equal(counterDraft.id, draft.id);
});

test('the counter with an unknown draft gets the no game warning', async () => {
  const counter = await client('/counter');
  const noGame = once(counter, 'noGame');

  counter.emit('players', { id: 'missing' });

  assert.equal(await noGame, '');
});

test('the counter gets an error for players outside the tournament', async () => {
  const draft = createTournament(['Ana', 'Bruno']);
  const counter = await client('/counter');
  const error = once(counter, 'appError');

  counter.emit('endGame', { id: draft.id, winner: 'Ana', loser: 'Zé' });

  assert.match(await error, /Player Zé is not part of this tournament/v);
});

test('the draft history sends names and dates, or that there is none', async () => {
  const home = await client('/serverHome');
  const unavailable = once(home, 'historyUnavailable');

  home.emit('loadHistory');
  assert.equal(await unavailable, undefined);

  const draft = createTournament(['Ana', 'Bruno']);
  const history = once(home, 'history');

  home.emit('loadHistory');

  const { drafts } = await history;

  assert.equal(drafts[draft.id].name, 'Test draft');
  assert.ok(!Number.isNaN(new Date(drafts[draft.id].date).getTime()));
});
