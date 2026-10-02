import fs from 'node:fs/promises';

let saveTimer = null;

/**
 * Loads the drafts saved on disk
 *
 * @author mauricio.araldi
 * @since 0.10.0
 *
 * @param {string} file Path of the file the drafts are saved in
 * @returns {Promise<object>} The saved drafts, keyed by draft ID (empty if there's no file yet)
 */
export async function loadDrafts(file) {
  try {
    const data = await fs.readFile(file, 'utf8');

    return data ? JSON.parse(data) : {};
  } catch (error) {
    if (error.code === 'ENOENT') {
      return {};
    }

    throw error;
  }
}

/**
 * Saves the drafts on disk. Only drafts with a name are saved. The data is written to a
 * temporary file first, which then replaces the previous one, so a crash while writing
 * never leaves a broken file behind
 *
 * @author mauricio.araldi
 * @since 0.10.0
 *
 * @param {string} file Path of the file the drafts are saved in
 * @param {object} drafts All drafts, keyed by draft ID
 */
export async function saveDrafts(file, drafts) {
  const namedDrafts = Object.fromEntries(Object.entries(drafts).filter(([, draft]) => draft.name));
  const temporaryFile = `${file}.tmp`;

  await fs.writeFile(temporaryFile, JSON.stringify(namedDrafts));
  await fs.rename(temporaryFile, file);
}

/**
 * Schedules saving the current drafts. Changes made in sequence are saved together, once
 * Configs.saveDelay has passed since the last one
 *
 * @author mauricio.araldi
 * @since 0.10.0
 */
export function scheduleSave() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(flushSave, Configs.saveDelay);
}

/**
 * Saves the current drafts right away, cancelling any scheduled save
 *
 * @author mauricio.araldi
 * @since 0.10.0
 */
export async function flushSave() {
  clearTimeout(saveTimer);
  saveTimer = null;

  try {
    await saveDrafts(Configs.dataFile, Drafts);
    console.log('Drafts saved.');
  } catch (error) {
    console.error(error);
  }
}
