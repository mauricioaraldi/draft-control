/**
 * Server home controller
 *
 * @param {Window} window The browser window
 */
((window) => {
  App.serverHome = (() => {
    /**
     * Default function that contains all event binds related to this module
     *
     * @public
     * @author mauricio.fiorest
     * @since 0.9.0
     */
    function bindEvents() {
      /**
       * Upon clicking load redirects to the id page
       *
       * @author mauricio.fiorest
       * @since 0.9.0
       */
      document.querySelector('#load').addEventListener('click', (ev) => {
        ev.preventDefault();
        const draftId = document.querySelector('.draft').value;

        if (draftId) {
          location.assign('/server?id=' + draftId);
        }
      });

      /**
       * Submit draft name
       *
       * @author mauricio.araldi
       * @since 0.6.0
       */
      document.querySelector('#submit-draft-name').addEventListener('click', (ev) => {
        setLoading(true);

        const name = document.querySelector('#draft-name > input').value;

        App.Sockets.ServerHome.setDraftName(name);

        setLoading(false);
      });
    }

    /**
     * Draws the draft history list
     *
     * @public
     * @author mauricio.fiorest
     * @since 0.9.0
     *
     * @param {{drafts: {[id: string]: string}, current: string}} data Saved drafts (ID to label) and the current draft ID
     */
    function drawHistory(data) {
      const select = document.querySelector('select');
      const placeholder = new Option('Select your option', '', true, true);

      placeholder.disabled = true;
      select.replaceChildren(placeholder);

      for (const [draft, label] of Object.entries(data.drafts)) {
        const isCurrent = draft === data.current;

        select.append(new Option(label, draft, isCurrent, isCurrent));
      }

      App.Utils.show(document.querySelector('#draft-load'));
    }

    /**
     * Hides the draft history list
     *
     * @public
     * @author mauricio.fiorest
     * @since 0.9.0
     */
    function noHistory() {
      App.Utils.hide(document.querySelector('#draft-load'));
    }

    /**
     * Toggles the screen block and loader
     *
     * @private
     * @author mauricio.araldi
     * @since  0.6.0
     *
     * @param {boolean} isLoading If the app is loading or not
     */
    function setLoading(isLoading) {
      if (!isLoading) {
        document.querySelector('#loader')?.remove();
        return;
      }

      const loader = document.createElement('div');

      loader.id = 'loader';
      loader.textContent = 'Loading';
      document.body.append(loader);
    }

    return {
      bindEvents,
      drawHistory,
      noHistory,
    };
  })();

  // DOM Ready -- initializes the module
  document.addEventListener('DOMContentLoaded', () => {
    App.serverHome.bindEvents();
  });
})(window);
