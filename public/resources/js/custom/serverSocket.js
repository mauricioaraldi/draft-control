;(function ( $, window ) {

	/**
	 * This module controls socket interactions
	 *
	 * @author mauricio.araldi
	 * @since 0.6.0
	 */
	App.Sockets.Server = (function() {
		var socket = io.connect('/server');

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
			socket.on('tournament', data => {
				App.Data.tournament = data;
				App.server.drawTournamentTable();
			});

			/**
			 * When draft is unavailable to connection
			 *
			 * @author mauricio.araldi
			 * @since 0.8.0
			 */
			socket.on('draftUnavailable', data => {
				App.Utils.errorPopup('Draft unavailable');
			});

			/**
			 * When draft name changes
			 * 
			 * @author mauricio.araldi
			 * @since 0.6.0
			 */
			socket.on('setName', data => {
				App.Data.name = data;

				//Adjust title
				$('h1').text(App.Data.name);
			});

			/**
			 * Loads all data
			 *
			 * @author mauricio.araldi
			 * @since 0.6.0
			 */
			socket.on('loadGame', data => {
				App.Data = data;

				//Adjust title
				$('h1').text(App.Data.name);

				//Build tournament
				App.server.drawTournamentTable();
			});

			/**
			 * Receiving players data
			 *
			 * @author mauricio.araldi
			 * @since 0.6.0
			 */
			socket.on('players',data => {
				App.Data.players = data;

				$(document).trigger('playersLoaded');
			});

			/**
			 * Whenever suggested matches are received
			 *
			 * @author mauricio.araldi
			 * @since 0.6.0
			 */
			socket.on('suggestedMatches', data => {
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
		 */
		function setDraftName(draftName) {
			socket.emit('setName', {draftName});
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
			socket.emit('id', { id: location.search.slice(location.search.indexOf('id') + 3, location.search.length) });
		}

		return {
			bindEvents,
			init,
			setDraftName,
			loadGame,
			setPlayers,
			getTournamentTable,
			updateScore
		}
	})();

	// DOM Ready -- Initialize the module
	$(function() {
		App.Sockets.Server.init();
		App.Sockets.Server.bindEvents();
	});

})( jQuery, window );