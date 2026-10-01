/**
 * Counter controller
 *
 * @param {Window} window The browser window
 */
((window) => {
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
       * @since 0.10.0
       */
      document.querySelectorAll('.buttons > button').forEach((button) => {
        button.addEventListener('click', (ev) => {
          const value = Number(ev.target.textContent);
          const { playerPosition } = ev.target.closest('.controls').dataset;

          addPlayerHp(playerPosition, value);
        });
      });

      /**
       * Toggles the visibility of the menu
       *
       * @author mauricio.araldi
       * @since 0.6.0
       */
      document.querySelector('#openMenu').addEventListener('click', (ev) => {
        App.Utils.toggle(document.querySelector('#menu'));
      });

      /**
       * Toggles the visibility of the die menu
       *
       * @author mauricio.araldi
       * @since 0.7.0
       */
      document.querySelector('#openDieMenu').addEventListener('click', (ev) => {
        App.Utils.toggle(document.querySelector('#dieMenu'));
      });

      /**
       * Button close in menu
       *
       * @author mauricio.araldi
       * @since 0.7.0
       */
      document.querySelector('#closeMenu').addEventListener('click', (ev) => {
        App.Utils.toggle(document.querySelector('#menu'));
      });

      /**
       * Whenever mouse goes down on HP, change its key state
       *
       * @author mauricio.araldi
       * @since 0.6.0
       */
      document.querySelectorAll('.hp').forEach((hp) => {
        hp.addEventListener('mousedown', (ev) => {
          App.Keys.mouseRight = true;

          playerBeingEdited = ev.target.dataset.playerPosition;
        });
      });

      /**
       * Whenever mouse goes up on HP, change its key state
       *
       * @author mauricio.araldi
       * @since 0.6.0
       */
      document.addEventListener('mouseup', (ev) => {
        App.Keys.mouseRight = false;
      });

      /**
       * When selecting a die to roll
       *
       * @author mauricio.araldi
       * @since 0.7.0
       */
      document.querySelectorAll('#dieMenu > button').forEach((button) => {
        button.addEventListener('click', (ev) => {
          const sides = Number(ev.target.textContent);
          const randomNumber = Math.floor(Math.random() * sides) + 1;

          App.Utils.successPopup(`Rolled ${randomNumber}`);

          App.Utils.toggle(document.querySelector('#dieMenu'));
        });
      });

      /**
       * Whenever touch starts in HP, change its key state
       *
       * @author mauricio.araldi
       * @since 0.6.0
       */
      document.querySelectorAll('.hp').forEach((hp) => {
        hp.addEventListener(
          'touchstart',
          (ev) => {
            App.Keys.touch = true;

            playerBeingEdited = ev.target.dataset.playerPosition;
          },
          { passive: true }
        );
      });

      /**
       * Whenever touch ends in HP, change its key state
       *
       * @author mauricio.araldi
       * @since 0.6.0
       */
      document.addEventListener(
        'touchend',
        (ev) => {
          App.Keys.touch = false;
          lastScreenY = null;
        },
        { passive: true }
      );

      /**
       * When mouse moves
       *
       * @author mauricio.araldi
       * @since 0.6.0
       */
      document.addEventListener('mousemove', (ev) => {
        if (!playerBeingEdited || !App.Keys.mouseRight) {
          return;
        }

        moveDelta += ev.movementY;

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
      document.addEventListener(
        'touchmove',
        (ev) => {
          if (!App.Keys.touch) {
            return;
          }

          if (lastScreenY === null) {
            lastScreenY = ev.changedTouches[0].screenY;
            return;
          }

          if (!playerBeingEdited) {
            return;
          }

          moveDelta += ev.changedTouches[0].screenY - lastScreenY;
          lastScreenY = ev.changedTouches[0].screenY;

          if (moveDelta > App.Config.addHpDelta) {
            moveDelta -= App.Config.addHpDelta;
            addPlayerHp(playerBeingEdited, -1);
          } else if (moveDelta < -App.Config.addHpDelta) {
            moveDelta += App.Config.addHpDelta;
            addPlayerHp(playerBeingEdited, 1);
          }
        },
        { passive: true }
      );

      /**
       * Ends the game
       *
       * @author mauricio.araldi
       * @since 0.6.0
       */
      document.querySelector('#endGame').addEventListener('click', (ev) => {
        const playerNames = [...document.querySelectorAll('.name')];
        const playerOne = playerNames[0].value;
        const playerTwo = playerNames.at(-1).value;
        const whoWonMenu = document.querySelector('#whoWonMenu');
        const buttonOne = document.createElement('button');
        const buttonTwo = document.createElement('button');
        const cancelButton = document.createElement('button');

        buttonOne.textContent = playerOne;
        buttonTwo.textContent = playerTwo;
        cancelButton.textContent = 'Cancel';

        if (playerOne === playerTwo) {
          App.Utils.errorPopup('Os jogadores não podem ter o mesmo nome');
          App.Utils.toggle(document.querySelector('#menu'));
          return;
        }

        App.Utils.show(whoWonMenu);
        whoWonMenu.querySelectorAll('button').forEach((button) => button.remove());

        buttonOne.addEventListener('click', () => {
          App.Sockets.counter.endGame({
            winner: playerOne,
            loser: playerTwo,
          });
          document.querySelector('#reset').click();
          cancelButton.click();
        });

        buttonTwo.addEventListener('click', () => {
          App.Sockets.counter.endGame({
            winner: playerTwo,
            loser: playerOne,
          });
          document.querySelector('#reset').click();
          cancelButton.click();
        });

        cancelButton.addEventListener('click', () => {
          App.Utils.hide(whoWonMenu);
        });

        whoWonMenu.append(buttonOne, buttonTwo, cancelButton);
      });

      /**
       * Resets the game
       *
       * @author mauricio.araldi
       * @since  0.6.0
       */
      document.querySelector('#reset').addEventListener('click', (ev) => {
        document.querySelectorAll('.hp').forEach((hp) => {
          hp.textContent = 20;
        });
        document.querySelectorAll('.history > div').forEach((history) => history.replaceChildren());
        App.Sockets.counter.getPlayers();
        document.querySelector('#openMenu').click();
      });

      /**
       * Undoes a player last hp change
       *
       * @author mauricio.araldi
       * @since 0.10.0
       */
      document.querySelectorAll('.undo').forEach((button) => {
        button.addEventListener('click', (ev) => {
          const { playerPosition } = ev.target.closest('.controls').dataset;
          const lastHpElement = document.querySelector(
            `.history[data-player-position="${CSS.escape(playerPosition)}"] > div > span:first-child`
          );

          if (!lastHpElement) {
            return;
          }

          const lastHpDelta = Number(lastHpElement.dataset.delta);

          lastHpElement.remove();

          addPlayerHp(playerPosition, -lastHpDelta, true);
        });
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
     * @since 0.10.0
     *
     * @param {string} playerPosition The position of the player to have it's HP add
     * @param {number} hpDelta The amount of HP to add
     * @param {boolean} [preventHistory] If the life should NOT be added to history
     */
    function addPlayerHp(playerPosition, hpDelta, preventHistory) {
      const hpElement = document.querySelector(
        `.hp[data-player-position="${CSS.escape(playerPosition)}"]`
      );
      const curHp = Number(hpElement.textContent);
      const historyElement = document.querySelector(
        `.history[data-player-position="${CSS.escape(playerPosition)}"]`
      );
      const curHistoryDelta = Number(historyElement.dataset.delta);

      hpElement.textContent = curHp + hpDelta;
      historyElement.dataset.delta = curHistoryDelta + hpDelta;

      historyElement.dataset.time = Date.now();

      setTimeout(() => {
        if (Date.now() - Number(historyElement.dataset.time) < App.Config.hpProccessTime) {
          return;
        }

        let diff = historyElement.dataset.delta;

        if (diff === '0') {
          return;
        }

        if (!diff.includes('-')) {
          diff = '+'.concat(diff);
        }

        if (!preventHistory) {
          const historyEntry = document.createElement('span');

          historyEntry.dataset.delta = historyElement.dataset.delta;
          historyEntry.textContent = `${diff} → ${hpElement.textContent}`;
          historyElement.querySelector('div').prepend(historyEntry);
        }

        historyElement.scrollTop = 0;
        historyElement.dataset.delta = 0;
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
      const selects = document.querySelectorAll('select');

      selects.forEach((select) => select.replaceChildren());

      Object.values(players).forEach((player) => {
        selects.forEach((select) => {
          select.append(new Option(player.id, player.id));
        });
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
      App.Utils.show(document.querySelector('#NoGame'));
    }

    return {
      bindEvents,
      drawPlayers,
      drawNoGame,
      init,
    };
  })();

  // DOM Ready -- initializes the module
  document.addEventListener('DOMContentLoaded', () => {
    App.counter.bindEvents();
    App.counter.init();
  });
})(window);
