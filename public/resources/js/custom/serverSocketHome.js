;(function ( $, window ) {

	/**
	 * This module controls socket interactions
	 *
	 * @author mauricio.araldi
	 * @since 0.6.0
	 */
	App.Sockets.ServerHome = (function() {
		var socket = io.connect('/serverHome');

		/**
		 * Default function with all event bindings related to this module
		 *
		 * @author mauricio.fiorest
		 * @since 0.9.0
		 */
		function bindEvents() {
			/**
			 * On receiving history information
			 *
			 * @author mauricio.fiorest
			 * @since 0.9.0
			 */
			socket.on('history', data => {
				App.serverHome.drawHistory(data);
			});
            /**
			 * On receiving no history information
			 *
			 * @author mauricio.fiorest
			 * @since 0.9.0
			 */
			socket.on('historyUnavailable', data => {
				App.serverHome.noHistory();
			});
            /**
			 * On new draft created
			 *
			 * @author mauricio.fiorest
			 * @since 0.9.0
			 */
			socket.on('newDraft', data => {
				location.href = "/server?id="+data;
			});
		}

		/**
		 * Default function that runs as soon as the page is loaded
		 * and events are binded (see bindEvents())
		 *
		 * @author mauricio.fiorest
		 * @since 0.9.0
		 */
		function init() {
			socket.emit('loadHistory');
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
        
		return {
			bindEvents,
			init,
			setDraftName
		}
	})();

	// DOM Ready -- Initialize the module
	$(function() {
		App.Sockets.ServerHome.init();
		App.Sockets.ServerHome.bindEvents();
	});

})( jQuery, window );