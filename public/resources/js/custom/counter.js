/**
 * Counter controller
 *
 * @param {jQuery} $ The jQuery function
 * @param {Window} window The browser window
 */
(($, window) => {
  App.counter = (() => {
    let moveDelta = 0;
    let playerBeingEdited = null;
    let lastScreenY = null;

    /**
     * Default function that contains all event binds related to this module
     *
     * @public
     * @author mauricio.araldi
     * @since 0.6.0
     */
    function bindEvents() {
      /**
       * Change player life
       *
       * @author mauricio.araldi
       * @since 0.6.0
       */
      $('.buttons > button').on('click', (ev) => {
        const value = Number($(ev.target).text());
        const player = $(ev.target).closest('.player');

        addPlayerHp(player, value);
      });

      /**
       * Toggles the visibility of the menu
       *
       * @author mauricio.araldi
       * @since 0.6.0
       */
      $('#openMenu').on('click', (ev) => {
        $('#menu').toggle();
      });

      /**
       * Toggles the visibility of the die menu
       *
       * @author mauricio.araldi
       * @since 0.7.0
       */
      $('#openDieMenu').on('click', (ev) => {
        $('#dieMenu').toggle();
      });

      /**
       * Button close in menu
       *
       * @author mauricio.araldi
       * @since 0.7.0
       */
      $('#closeMenu').on('click', (ev) => {
        $('#menu').toggle();
      });

      /**
       * Whenever mouse goes down on HP, change its key state
       *
       * @author mauricio.araldi
       * @since 0.6.0
       */
      $('.hp').on('mousedown', (ev) => {
        App.Keys.mouseRight = true;

        playerBeingEdited = $(ev.target).closest('.player');
      });

      /**
       * Whenever mouse goes up on HP, change its key state
       *
       * @author mauricio.araldi
       * @since 0.6.0
       */
      $(document).on('mouseup', (ev) => {
        App.Keys.mouseRight = false;
      });

      /**
       * When selecting a die to roll
       *
       * @author mauricio.araldi
       * @since 0.7.0
       */
      $('#dieMenu > button').on('click', (ev) => {
        const sides = Number($(ev.target).text());
        const randomNumber = Math.floor(Math.random() * sides) + 1;

        App.Utils.successPopup(`Rolled ${randomNumber}`);

        $('#dieMenu').toggle();
      });

      /**
       * Whenever touch starts in HP, change its key state
       *
       * @author mauricio.araldi
       * @since 0.6.0
       */
      $('.hp').on('touchstart', (ev) => {
        App.Keys.touch = true;

        playerBeingEdited = $(ev.target).closest('.player');
      });

      /**
       * Whenever touch ends in HP, change its key state
       *
       * @author mauricio.araldi
       * @since 0.6.0
       */
      $(document).on('touchend', (ev) => {
        App.Keys.touch = false;
        lastScreenY = null;
      });

      /**
       * When mouse moves
       *
       * @author mauricio.araldi
       * @since 0.6.0
       */
      $(document).on('mousemove', (ev) => {
        if (!playerBeingEdited || !App.Keys.mouseRight) {
          return;
        }

        moveDelta += ev.originalEvent.movementY;

        if (moveDelta > App.Config.addHpDelta) {
          moveDelta -= App.Config.addHpDelta;
          addPlayerHp(playerBeingEdited, -1);
        } else if (moveDelta < -App.Config.addHpDelta) {
          moveDelta += App.Config.addHpDelta;
          addPlayerHp(playerBeingEdited, 1);
        }
      });

      /**
       * When touch moves
       *
       * @author mauricio.araldi
       * @since 0.6.0
       */
      $(document).on('touchmove', (ev) => {
        if (!App.Keys.touch) {
          return;
        }

        if (lastScreenY === null) {
          lastScreenY = ev.originalEvent.changedTouches[0].screenY;
          return;
        }

        if (!playerBeingEdited) {
          return;
        }

        moveDelta += ev.originalEvent.changedTouches[0].screenY - lastScreenY;
        lastScreenY = ev.originalEvent.changedTouches[0].screenY;

        if (moveDelta > App.Config.addHpDelta) {
          moveDelta -= App.Config.addHpDelta;
          addPlayerHp(playerBeingEdited, -1);
        } else if (moveDelta < -App.Config.addHpDelta) {
          moveDelta += App.Config.addHpDelta;
          addPlayerHp(playerBeingEdited, 1);
        }
      });

      /**
       * Ends the game
       *
       * @author mauricio.araldi
       * @since 0.6.0
       */
      $('#endGame').on('click', (ev) => {
        const playerOne = $('.name:first').val();
        const playerTwo = $('.name:last').val();
        const buttonOne = $('<button>').text(playerOne);
        const buttonTwo = $('<button>').text(playerTwo);
        const cancelButton = $('<button>').text('Cancel');

        if (playerOne === playerTwo) {
          App.Utils.errorPopup('Os jogadores não podem ter o mesmo nome');
          $('#menu').toggle();
          return;
        }

        $('#whoWonMenu').show().find('button').remove();

        buttonOne.on('click', () => {
          App.Sockets.counter.endGame({
            winner: playerOne,
            loser: playerTwo,
          });
          $('#reset').click();
          cancelButton.click();
        });

        buttonTwo.on('click', () => {
          App.Sockets.counter.endGame({
            winner: playerTwo,
            loser: playerOne,
          });
          $('#reset').click();
          cancelButton.click();
        });

        cancelButton.on('click', () => {
          $('#whoWonMenu').hide();
        });

        $('#whoWonMenu').append(buttonOne).append(buttonTwo).append(cancelButton);
      });

      /**
       * Resets the game
       *
       * @author mauricio.araldi
       * @since  0.6.0
       */
      $('#reset').on('click', (ev) => {
        $('.hp').text(20);
        $('.history > div').empty();
        App.Sockets.counter.getPlayers();
        $('#openMenu').click();
      });

      /**
       * Undoes a player last hp change
       *
       * @author mauricio.araldi
       * @since 0.7.0
       */
      $('.undo').on('click', (ev) => {
        const playerElement = $(ev.target).closest('.player');
        const lastHpElement = playerElement.find('.history > div > span:last');
        const lastHpValue = lastHpElement.text().replace('-', '').replace('+', '-');

        if (lastHpElement.length === 0) {
          return;
        }

        lastHpElement.remove();

        addPlayerHp(playerElement, Number(lastHpValue), true);
      });
    }

    /**
     * Default function that runs as soons as the page is loaded and the event binds
     * have been already made (see bindEvents())
     *
     * @public
     * @author mauricio.araldi
     * @since 0.6.0
     */
    function init() {}

    /**
     * Adds to the HP of a player
     *
     * @private
     * @author mauricio.araldi
     * @since 0.6.0
     *
     * @param {jQuery} playerElement The player to have it's HP add
     * @param {number} hpDelta The amount of HP to add
     * @param {boolean} [preventHistory] If the life should NOT be added to history
     */
    function addPlayerHp(playerElement, hpDelta, preventHistory) {
      const hpElement = playerElement.find('.hp');
      const curHp = Number(hpElement.text());
      const historyElement = playerElement.find('.history');
      const curHistoryDelta = Number(historyElement.attr('data-delta'));

      hpElement.text(curHp + hpDelta);
      historyElement.attr('data-delta', curHistoryDelta + hpDelta);

      historyElement.attr('data-time', Date.now());

      setTimeout(() => {
        if (Date.now() - Number(historyElement.attr('data-time')) < App.Config.hpProccessTime) {
          return;
        }

        let diff = historyElement.attr('data-delta');

        if (diff === '0') {
          return;
        }

        if (!diff.includes('-')) {
          diff = '+'.concat(diff);
        }

        if (!preventHistory) {
          historyElement.find('div').append($('<span>').text(diff));
        }

        historyElement.scrollTop(historyElement[0].scrollTopMax);
        historyElement.attr('data-delta', 0);
      }, App.Config.hpProccessTime);
    }

    /**
     * Populates the player's select
     *
     * @public
     * @author mauricio.araldi
     * @since 0.6.0
     *
     * @param {{[key: string]: {id: string}}} players Players of the draft, keyed by player ID
     */
    function drawPlayers(players) {
      $('option').remove();

      Object.values(players).forEach((player) => {
        $('select').append($('<option>').val(player.id).text(player.id));
      });
    }

    /**
     * Issues the no Game warning
     *
     * @public
     * @author mauricio.fiorest
     * @since 0.9.0
     */
    function drawNoGame() {
      $('#NoGame').show();
    }

    return {
      bindEvents,
      drawPlayers,
      drawNoGame,
      init,
    };
  })();

  // DOM Ready -- initializes the module
  $(() => {
    App.counter.bindEvents();
    App.counter.init();
  });
})(jQuery, window);
