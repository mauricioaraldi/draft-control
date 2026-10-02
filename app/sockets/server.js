import Draft from '../Draft.js';
import broadcastTournament from './broadcast.js';
import listen from './listen.js';

/**
 * @typedef {import('socket.io').Socket} Socket
 */
/**
 * @typedef {import('../objects/DraftModel.js').default} DraftModel
 */

/**
 * Server socket, attached to the `/server` namespace.
 *
 * @author mauricio.araldi
 * @since 0.8.0
 *
 * @param {Socket} socket The connected client socket
 */
export default (socket) => {
  /**
   * @type {DraftModel | null} The draft this client is working on
   */
  let draft = null;

  /**
   * Gets the ID of the draft this client is working on
   *
   * @returns {string} The ID of the open draft
   */
  const draftId = () => {
    if (!draft) {
      throw new Error('No draft is open on this page');
    }

    return draft.id;
  };

  /**
   * On receiving draft ID
   *
   * @author mauricio.araldi
   * @since 0.8.0
   */
  listen(socket, 'id', (data) => {
    draft = Draft.get(data.id);

    if (!draft) {
      socket.emit('draftUnavailable');
      return;
    }

    // eslint-disable-next-line unicorn/no-unused-builtin-method-return -- Socket#join, not Array#join
    socket.join(draft.id);
    socket.emit('draftData', draft);
  });

  /**
   * On changing draft name
   *
   * @author mauricio.araldi
   * @since 0.8.0
   */
  listen(socket, 'setName', (data) => {
    draft = Draft.setName(draftId(), data.draftName);
    socket.emit('setName', draft);
  });

  /**
   * Sets the draft players
   *
   * @author mauricio.araldi
   * @since 0.8.0
   */
  listen(socket, 'players', (data) => {
    const id = draftId();

    data.forEach((playerName) => {
      draft = Draft.addPlayer(id, playerName);
    });

    socket.emit('players', draft.players);
  });

  /**
   * Sends all data to the client
   * TODO
   * @author mauricio.araldi
   * @since  0.6.0
   */
  listen(socket, 'loadGame', (data) => {
    draft = Draft.get(draftId());
    socket.emit('loadGame', draft);
    if (draft.tournament) {
      socket.emit('suggestedMatches', Draft.buildSuggestedMatches(draft.id));
    }
  });

  /**
   * Builds the tournament table
   *
   * @author mauricio.araldi
   * @since 0.8.0
   */
  listen(socket, 'tournament', (data) => {
    draft = Draft.buildTournamentObject(draftId());

    broadcastTournament(draft.id);
  });

  /**
   * Updates tournament scores
   *
   * @author mauricio.araldi
   * @since 0.8.0
   */
  listen(socket, 'updateScore', (data) => {
    draft = Draft.setMatchScore(draftId(), data);

    broadcastTournament(draft.id);
  });
};
