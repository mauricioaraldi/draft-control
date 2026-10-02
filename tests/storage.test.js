import assert from 'node:assert/strict';
import { afterEach, beforeEach, test } from 'node:test';
import fs from 'node:fs/promises';
import path from 'node:path';
import { setTimeout as wait } from 'node:timers/promises';
import { flushSave, loadDrafts, saveDrafts, scheduleSave } from '../app/storage.js';
import { setupGlobals } from './setup.js';

let folder;

beforeEach(async () => {
  folder = await setupGlobals();
});

afterEach(async () => {
  await flushSave();
  await fs.rm(folder, { recursive: true, force: true });
});

test('loading a missing file gives no drafts', async () => {
  assert.deepEqual(await loadDrafts(path.join(folder, 'missing.json')), {});
});

test('only named drafts are saved and no temporary file is left', async () => {
  await saveDrafts(Configs.dataFile, {
    a: { id: 'a', name: 'Friday draft' },
    b: { id: 'b' },
  });

  assert.deepEqual(await loadDrafts(Configs.dataFile), { a: { id: 'a', name: 'Friday draft' } });
  assert.deepEqual(await fs.readdir(folder), ['data.json']);
});

test('saving replaces the previous file', async () => {
  await saveDrafts(Configs.dataFile, { a: { id: 'a', name: 'First' } });
  await saveDrafts(Configs.dataFile, { b: { id: 'b', name: 'Second' } });

  assert.deepEqual(await loadDrafts(Configs.dataFile), { b: { id: 'b', name: 'Second' } });
});

test('scheduled saves wait for the changes to stop', async () => {
  Drafts.a = { id: 'a', name: 'First' };
  scheduleSave();
  await wait(Configs.saveDelay / 2);

  Drafts.a.name = 'Renamed';
  scheduleSave();
  await wait(Configs.saveDelay / 2);

  assert.deepEqual(await fs.readdir(folder), []);

  await wait(Configs.saveDelay * 2);

  assert.deepEqual(await loadDrafts(Configs.dataFile), { a: { id: 'a', name: 'Renamed' } });
});

test('flushSave saves right away', async () => {
  Drafts.a = { id: 'a', name: 'Now' };
  scheduleSave();
  await flushSave();

  assert.deepEqual(await loadDrafts(Configs.dataFile), { a: { id: 'a', name: 'Now' } });
});
