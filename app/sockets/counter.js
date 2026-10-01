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
   * When players are requested
   *
   * @author mauricio.araldi
   * @since 0.6.0
   */
  socket.on('players', (data) => {
    if (CurrentDraft) {
      socket.emit('players', {
        draft: Drafts[CurrentDraft],
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
  socket.on('endGame', (data) => {
    if (CurrentDraft) {
      // Updates winner score
      Drafts[CurrentDraft].tournament[data.winner][data.loser].matchesWon++;

      // Updates loser score
      Drafts[CurrentDraft].tournament[data.loser][data.winner].matchesLost++;

      io.of('/server').emit('tournament', Drafts[CurrentDraft].tournament);
    } else {
      socket.emit('noGame', '');
    }
  });
};
