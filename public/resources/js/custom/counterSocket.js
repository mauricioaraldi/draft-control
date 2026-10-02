((window) => {
  /**
   * This module controls socket interactions
   *
   * @author mauricio.araldi
   * @since 0.6.0
   */
  App.Sockets.counter = (() => {
    const socket = io.connect('/counter');
    const baseTitle = document.title;
    const draftId = new URLSearchParams(location.search).get('id') ?? '';

    /**
     * Default function with all event bindings related to this module
     *
     * @author mauricio.araldi
     * @since 0.6.0
     */
    function bindEvents() {
      /**
       * When the server fails to handle a request
       *
       * @author mauricio.araldi
       * @since 0.10.0
       */
      socket.on('appError', (message) => {
        App.Utils.errorPopup(message);
      });

      /**
       * On receiving players informations
       *
       * @author mauricio.araldi
       * @since 0.6.0
       */
      socket.on('players', (data) => {
        document.querySelector('#draftName').textContent = data.draft.name;
        document.title = `${data.draft.name} - ${baseTitle}`;
        App.counter.drawPlayers(data.draft.players);
      });

      /**
       * On receiving no game warning
       *
       * @author mauricio.fiorest
       * @since 0.9.0
       */
      socket.on('noGame', (data) => {
        App.counter.drawNoGame();
      });
    }

    /**
     * Default function that runs as soon as the page is loaded
     * and events are binded (see bindEvents())
     *
     * @author mauricio.araldi
     * @since 0.6.0
     */
    function init() {
      getPlayers();
    }

    /**
     * Request game players
     *
     * @author mauricio.araldi
     * @since 0.6.0
     */
    function getPlayers() {
      socket.emit('players', { id: draftId });
    }

    /**
     * Ends a game with a winner and a loser
     *
     * @author mauricio.araldi
     * @since 0.6.0
     *
     * @param {{winner: string, loser: string}} result Names of the winner and the loser of the game
     */
    function endGame(result) {
      socket.emit('endGame', { ...result, id: draftId });
    }

    return {
      bindEvents,
      init,
      getPlayers,
      endGame,
    };
  })();

  // DOM Ready -- Initialize the module
  document.addEventListener('DOMContentLoaded', () => {
    App.Sockets.counter.init();
    App.Sockets.counter.bindEvents();
  });
})(window);
