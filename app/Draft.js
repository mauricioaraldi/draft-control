import crypto from 'crypto';

import DraftModel from './objects/DraftModel';

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

		return Drafts[id];
	}
}