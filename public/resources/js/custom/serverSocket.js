(function (window) {
  /**
   * This module controls socket interactions
   *
   * @author mauricio.araldi
   * @since 0.6.0
   */
  App.Sockets.Server = (function () {
    const socket = io.connect('/server');

    /**
     * Default function with all event bindings related to this module
     *
     * @author mauricio.araldi
     * @since 0.6.0
     */
    function bindEvents() {
      /**
       * On receiving tournament data
       *
       * @author mauricio.araldi
       * @since 0.6.0
       */
      socket.on('tournament', (data) => {
        App.Data.tournament = data.tournament;
        App.Data.players = data.players;
        App.Data.standings = data.standings;
        App.server.drawTournamentTable();
      });

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
       * When draft is unavailable to connection
       *
       * @author mauricio.araldi
       * @since 0.8.0
       */
      socket.on('draftUnavailable', (data) => {
        App.Utils.errorPopup('Draft unavailable');
      });

      /**
       * When draft name changes
       *
       * @author mauricio.araldi
       * @since 0.6.0
       */
      socket.on('setName', (data) => {
        App.Data = data;

        // Adjust title
        document.querySelector('h1').textContent = App.Data.name;
        const dateElement = document.querySelector('h2');
        dateElement.textContent = new Date(App.Data.date).toLocaleDateString();
        dateElement.classList.remove('hidden');
      });

      /**
       * Loads all data
       *
       * @author mauricio.araldi
       * @since 0.6.0
       */
      socket.on('loadGame', (data) => {
        App.Data = data;

        if (App.Data.name) {
          // Adjust title
          document.querySelector('h1').textContent = App.Data.name;
          const dateElement = document.querySelector('h2');
          dateElement.textContent = new Date(App.Data.date).toLocaleDateString();
          dateElement.classList.remove('hidden');
          if (App.Data.players && App.Data.tournament) {
            // Build tournament
            App.server.drawTournamentTable();
          } else {
            App.server.initPlayers(App.Data.players);
          }
        } else {
          App.server.init();
        }
      });

      /**
       * Receiving players data
       *
       * @author mauricio.araldi
       * @since 0.6.0
       */
      socket.on('players', (data) => {
        App.Data.players = data;

        document.dispatchEvent(new CustomEvent('playersLoaded'));
      });

      /**
       * Whenever suggested matches are received
       *
       * @author mauricio.araldi
       * @since 0.6.0
       */
      socket.on('suggestedMatches', (data) => {
        App.server.drawSuggestedMatches(data);
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
      sendId();
    }

    /**
     * Sets the draft name
     *
     * @author mauricio.araldi
     * @since 0.6.0
     *
     * @param {string} draftName New name of the draft
     */
    function setDraftName(draftName) {
      socket.emit('setName', {
        draftName,
      });
    }

    /**
     * Loads all data
     *
     * @author mauricio.araldi
     * @since 0.6.0
     */
    function loadGame() {
      socket.emit('loadGame');
    }

    /**
     * Sets players
     *
     * @author mauricio.araldi
     * @since 0.6.0
     *
     * @param {string[]} players Names of the players taking part in the draft
     */
    function setPlayers(players) {
      socket.emit('players', players);
    }

    /**
     * Requests the tournament table
     *
     * @author mauricio.araldi
     * @since 0.6.0
     */
    function getTournamentTable() {
      socket.emit('tournament');
    }

    /**
     * Updates tournament scores
     *
     * @author mauricio.araldi
     * @since 0.6.0
     *
     * @param {{playerId: string, playerScore: string, opponentId: string, opponentScore: string}} scores Result of a match, as typed in the table
     */
    function updateScore(scores) {
      socket.emit('updateScore', scores);
    }

    /**
     * Sends the ID of the draft to the server
     *
     * @author mauricio.araldi
     * @since 0.8.0
     */
    function sendId() {
      socket.emit('id', {
        id: location.search.slice(location.search.indexOf('id') + 3),
      });
    }

    return {
      bindEvents,
      init,
      setDraftName,
      loadGame,
      setPlayers,
      getTournamentTable,
      updateScore,
    };
  })();

  // DOM Ready -- Initialize the module
  document.addEventListener('DOMContentLoaded', () => {
    App.Sockets.Server.init();
    App.Sockets.Server.bindEvents();
  });
})(window);
