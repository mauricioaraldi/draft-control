import Draft from '../Draft.js';
import broadcastTournament from './broadcast.js';
import listen from './listen.js';

/**
 * @typedef {import('socket.io').Socket} Socket
 */

/**
 * Counter socket, attached to the `/counter` namespace.
 *
 * @author mauricio.araldi
 *
 * @param {Socket} socket The connected client socket
 */
export default (socket) => {
  /**
   * Gets the ID of the draft the counter is working on. It is the one in the counter URL or,
   * when the URL has none, the last draft opened on a server page
   *
   * @param {{id?: string}} [data] Data sent by the counter
   * @returns {string} The draft ID, or an empty string if there is no draft
   */
  const draftIdOf = (data) => {
    const id = data?.id || CurrentDraft;

    return Object.hasOwn(Drafts, id) ? id : '';
  };

  /**
   * When players are requested
   *
   * @author mauricio.araldi
   * @since 0.6.0
   */
  listen(socket, 'players', (data) => {
    const id = draftIdOf(data);

    if (id) {
      socket.emit('players', {
        draft: Drafts[id],
      });
    } else {
      socket.emit('noGame', '');
    }
  });

  /**
   * Whenever a game ends
   *
   * @author mauricio.araldi
   * @since 0.6.0
   */
  listen(socket, 'endGame', (data) => {
    const id = draftIdOf(data);

    if (!id) {
      socket.emit('noGame', '');
      return;
    }

    Draft.registerGameResult(id, data);
    broadcastTournament(id);
  });
};
