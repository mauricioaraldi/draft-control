import Draft from '../Draft.js';
import DraftModel from '../objects/DraftModel.js';
import listen from './listen.js';

/**
 * @typedef {import('socket.io').Socket} Socket
 */

/**
 * Server socketHome, attached to the `/serverHome` namespace.
 *
 * @author mauricio.fiorest
 * @since 0.9.0
 *
 * @param {Socket} socket The connected client socket
 */
export default (socket) => {
  /**
   * On receiving init history request
   *
   * @author mauricio.fiorest
   * @since 0.9.0
   */
  listen(socket, 'loadHistory', (data) => {
    const drafts = Object.fromEntries(
      Object.values(Drafts)
        .filter((draft) => draft.name)
        .map((draft) => [draft.id, { name: draft.name, date: draft.date }])
    );

    if (Object.keys(drafts).length === 0) {
      socket.emit('historyUnavailable');
      return;
    }

    socket.emit('history', {
      drafts,
      current: CurrentDraft,
    });
  });

  /**
   * Create a new draft and set name
   *
   * @author mauricio.fiorest
   * @since 0.9.0
   */
  listen(socket, 'setName', (data) => {
    const id = Draft.generateId();
    let draft = new DraftModel(id);

    Draft.register(draft);

    draft = Draft.setName(draft.id, data.draftName);
    socket.emit('newDraft', draft.id);
  });
};
