/** @typedef {import('socket.io').Socket} Socket */
/**
 * Counter socket
 *
 * @author mauricio.araldi
 *
 * @socket /counter
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
    if (!CurrentDraft) {
      socket.emit('noGame', '');
    } else {
      socket.emit('players', {
        draft: Drafts[CurrentDraft],
      });
    }
  });

  /**
   * Whenever a game ends
   *
   * @author mauricio.araldi
   * @since 0.6.0
   */
  socket.on('endGame', (data) => {
    if (!CurrentDraft) {
      socket.emit('noGame', '');
    } else {
      //Updates winner score
      Drafts[CurrentDraft].tournament[data.winner][data.loser]['matchesWon']++;

      //Updates loser score
      Drafts[CurrentDraft].tournament[data.loser][data.winner]['matchesLost']++;

      io.of('/server').emit('tournament', Drafts[CurrentDraft].tournament);
    }
  });
};
