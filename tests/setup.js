import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import Draft from '../app/Draft.js';

/**
 * Prepares the globals the server code relies on, saving drafts into a temporary folder
 *
 * @returns {Promise<string>} Path of the temporary folder
 */
export async function setupGlobals() {
  const folder = await fs.mkdtemp(path.join(os.tmpdir(), 'draft-control-'));

  global.Drafts = {};
  global.CurrentDraft = '';
  global.Configs = {
    dataFile: path.join(folder, 'data.json'),
    saveDelay: 20,
  };

  return folder;
}

/**
 * Creates a named draft with players and its tournament table
 *
 * @param {string[]} playerNames Names of the players of the draft
 * @returns {object} The created draft
 */
export function createTournament(playerNames) {
  const id = Draft.generateId();

  Draft.register({ id, players: {} });
  Draft.setName(id, 'Test draft');
  playerNames.forEach((name) => Draft.addPlayer(id, name));

  return Draft.buildTournamentObject(id);
}
