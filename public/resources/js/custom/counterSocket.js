;(($, window) => {

	/**
	 * This module controls socket interactions
	 *
	 * @author mauricio.araldi
	 * @since 0.6.0
	 */
	App.Sockets.counter = (() => {
		var socket = io.connect('/counter');

		/**
		 * Default function with all event bindings related to this module
		 *
		 * @author mauricio.araldi
		 * @since 0.6.0
		 */
		function bindEvents() {
			/**
			 * On receiving players informations
			 *
			 * @author mauricio.araldi
			 * @since 0.6.0
			 */
			socket.on('players', data => {
                $("#draftName").text(data.draft.name);
				App.counter.drawPlayers(data.draft.players);
			});
            
			/**
			 * On receiving no game warning
			 *
			 * @author mauricio.fiorest
			 * @since 0.9.0
			 */
			socket.on('noGame', data => {
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
			socket.emit('players');
		}

		/**
		 * Ends a game with a winner and a loser
		 *
		 * @author mauricio.araldi
		 * @since 0.6.0
		 */
		function endGame(result) {
			socket.emit('endGame', result);
		}

		return {
			bindEvents,
			init,
			getPlayers,
			endGame
		}
	})();

	// DOM Ready -- Initialize the module
	$(() => {
		App.Sockets.counter.init();
		App.Sockets.counter.bindEvents();
	});

})( jQuery, window );