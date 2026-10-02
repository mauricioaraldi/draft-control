(function (window) {
  /**
   * This module controls socket interactions
   *
   * @author mauricio.araldi
   * @since 0.6.0
   */
  App.Sockets.ServerHome = (function () {
    const socket = io.connect('/serverHome');

    /**
     * Default function with all event bindings related to this module
     *
     * @author mauricio.fiorest
     * @since 0.9.0
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
       * On receiving history information
       *
       * @author mauricio.fiorest
       * @since 0.9.0
       */
      socket.on('history', (data) => {
        App.serverHome.drawHistory(data);
      });
      /**
       * On receiving no history information
       *
       * @author mauricio.fiorest
       * @since 0.9.0
       */
      socket.on('historyUnavailable', (data) => {
        App.serverHome.noHistory();
      });
      /**
       * On new draft created
       *
       * @author mauricio.fiorest
       * @since 0.9.0
       */
      socket.on('newDraft', (data) => {
        location.assign('/server?id=' + data);
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
     *
     * @param {string} draftName Name given to the new draft
     */
    function setDraftName(draftName) {
      socket.emit('setName', {
        draftName,
      });
    }

    return {
      bindEvents,
      init,
      setDraftName,
    };
  })();

  // DOM Ready -- Initialize the module
  document.addEventListener('DOMContentLoaded', () => {
    App.Sockets.ServerHome.init();
    App.Sockets.ServerHome.bindEvents();
  });
})(window);
