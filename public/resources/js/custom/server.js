/**
 * Server controller
 *
 * @param {Window} window The browser window
 */
((window) => {
  let decreaser;

  App.server = (() => {
    /**
     * Default function that contains all event binds related to this module
     *
     * @public
     * @author mauricio.araldi
     * @since 0.6.0
     */
    function bindEvents() {
      /**
       * Adds another field for a player name when bluring from a previous input
       *
       * @author mauricio.araldi
       * @since 0.5.0
       */
      document.addEventListener('focusout', (ev) => {
        if (!ev.target.matches('#player-inputs input:last-child')) {
          return;
        }

        const { value } = ev.target;

        // If blured input doesn't have any value, return
        if (!value) {
          return;
        }

        createPlayerInput();
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

        App.Sockets.Server.setDraftName(name);

        createPlayerInput();
        changeScreen('players');
        setLoading(false);
      });

      /**
       * When ENTER is pressed in Draft Name input, submit it
       *
       * @author mauricio.araldi
       * @since 0.6.0
       */
      document.querySelector('#draft-name > input').addEventListener('keyup', (ev) => {
        if (ev.key === 'Enter') {
          document.querySelector('#submit-draft-name').click();
        }
      });

      /**
       * On submitting player names
       *
       * @author mauricio.araldi
       * @since 0.5.0
       */
      document.querySelector('#submit-player-names').addEventListener('click', (ev) => {
        ev.preventDefault();
        if (countFilledPlayerNames() > 1) {
          setLoading(true);

          try {
            buildPlayers();
          } catch (error) {
            return App.Utils.errorPopup(error.message);
          }

          /**
           * When players are loaded, build tournament tables
           */
          document.addEventListener(
            'playersLoaded',
            () => {
              changeScreen('table');

              // Build Tournament
              App.Sockets.Server.getTournamentTable();

              setLoading(false);
            },
            { once: true }
          );
        } else {
          App.Utils.errorPopup('Please input at least 2 non-empty player names.');
        }
      });

      /**
       * On changing scores
       *
       * @author mauricio.araldi
       * @since 0.5.0
       */
      document.addEventListener('focusout', (ev) => {
        const score = ev.target.closest('.score');

        if (!score) {
          return;
        }

        const row = score.closest('tr');
        const { playerId } = score.closest('.player-table').dataset;
        const opponentId = row.dataset.oppId;
        const playerScore = row.querySelector('.player-score').textContent;
        const opponentScore = row.querySelector('.opp-score').textContent;

        // When changing the score of a player, auto switch to the scores
        // of opponent on the same match on blur
        if (score.classList.contains('player-score')) {
          return row.querySelector('.opp-score').focus();
        }

        App.Sockets.Server.updateScore({
          playerId,
          opponentId,
          playerScore,
          opponentScore,
        });
      });

      /**
       * When clicking into the name of the opponent, focus on the scores
       * of the player, instead
       *
       * @author mauricio.araldi
       * @since 0.5.0
       */
      document.addEventListener('click', (ev) => {
        const oppName = ev.target.closest('.opp-name');

        if (!oppName) {
          return;
        }

        oppName.parentElement.querySelector('.player-score').focus();
      });

      /**
       * Return to home screen
       *
       * @author mauricio.fiorest
       * @since 0.9.0
       */
      document.querySelector('#home').addEventListener('click', (ev) => {
        location.assign('/server');
      });

      /**
       * Upon clicking Draft Timer
       *
       * @author mauricio.araldi
       * @since 0.5.0
       */
      document.querySelector('#enter-draft-timer').addEventListener('click', (ev) => {
        if (countFilledPlayerNames() > 1) {
          try {
            buildPlayers();
          } catch (error) {
            return App.Utils.errorPopup(error.message);
          }

          /**
           * Once players are loaded
           */
          document.addEventListener(
            'playersLoaded',
            () => {
              sortPlayerPlaces();
              App.Data.values.currentOrientation = 'Right';

              changeScreen('timer');

              setLoading(false);
            },
            { once: true }
          );
        } else {
          App.Utils.errorPopup('Please input at least 2 non-empty player names.');
        }
      });

      /**
       * Upon initing draft timer
       *
       * @author mauricio.araldi
       * @since 0.5.0
       */
      document.querySelector('#init-timer').addEventListener('click', (ev) => {
        const rounds = Number(document.querySelector('#round-number').value);
        const time = Math.ceil(rounds * App.Config.draftRoundTime);

        App.Data.values.roundsLeft = rounds;
        App.Data.values.draftTimer = time;
        App.Data.values.currentTime = time;

        changeScreen('startTimer');

        document.querySelector('#clock').textContent = App.Data.values.draftTimer;
        document.querySelector('#rounds-left-timer').textContent = App.Data.values.roundsLeft;
        document.querySelector('#rounds-orientation').textContent =
          App.Data.values.currentOrientation;
      });

      /**
       * Upon starting timer
       *
       * @author mauricio.araldi
       * @since 0.5.0
       */
      document.querySelector('#start-timer').addEventListener('click', (ev) => {
        startRoundSound();

        setTimeout(() => {
          changeScreen('timerRunning');

          decreaser = setInterval(() => {
            document.querySelector('#clock').textContent = --App.Data.values.currentTime;
            timeIndicatorSound(App.Data.values.currentTime);

            if (App.Data.values.currentTime !== 0) {
              return;
            }

            clearInterval(decreaser);

            document.querySelector('#alarm-clock-sound').play();
            document.body.classList.add('alarm-playing');
          }, 1000);
        }, 500);
      });

      /**
       * Upon restarting timer
       *
       * @author mauricio.araldi
       * @since 0.5.0
       */
      document.querySelector('#restart-timer').addEventListener('click', (ev) => {
        const alarmClockSound = document.querySelector('#alarm-clock-sound');

        document.body.classList.remove('alarm-playing');
        alarmClockSound.pause();
        alarmClockSound.currentTime = 0;

        clearInterval(decreaser);

        changeScreen('startTimer');

        App.Data.values.draftTimer -= Math.floor(
          App.Data.values.draftTimer / App.Data.values.roundsLeft
        );

        if (App.Data.values.roundsLeft > App.Config.majorRoundTimeMax) {
          App.Data.values.draftTimer -= App.Config.majorRoundTimeDecrease;
        } else if (App.Data.values.roundsLeft > App.Config.minorRoundTimeMax) {
          App.Data.values.draftTimer -= App.Config.minorRoundTimeDecrease;
        }

        App.Data.values.currentTime = App.Data.values.draftTimer;

        document.querySelector('#clock').textContent = App.Data.values.currentTime;
        document.querySelector('#rounds-left-timer').textContent = --App.Data.values.roundsLeft;
        document.querySelector('#rounds-orientation').textContent =
          App.Data.values.currentOrientation;

        if (App.Data.values.roundsLeft === 0) {
          document.dispatchEvent(new CustomEvent('draft-timer-finished'));
        }
      });

      /**
       * Starting new draft round
       *
       * @author mauricio.araldi
       * @since 0.5.0
       */
      document.querySelector('#new-draft-round').addEventListener('click', (ev) => {
        App.Data.values.currentOrientation =
          App.Data.values.currentOrientation === 'Right' ? 'Left' : 'Right';
        changeScreen('newDraftRound');
      });

      /**
       * Return to home screen
       *
       * @author mauricio.araldi
       * @since 0.5.0
       */
      document.querySelector('#return-home').addEventListener('click', (ev) => {
        App.Data.players = {};
        changeScreen('players');
      });

      /**
       * Upon finishing the number of rounds to draft
       *
       * @author mauricio.araldi
       * @since 0.5.0
       */
      document.addEventListener('draft-timer-finished', (ev) => {
        changeScreen('timerFinished');
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
    function init() {
      changeScreen('draftName');
    }

    /**
     * Draws the player form
     *
     * @public
     * @author mauricio.fiorest
     * @since 0.9.0
     *
     * @param {object} playersData Players of the draft, keyed by player ID (not used yet)
     */
    function initPlayers(playersData) {
      changeScreen('players');
      if (!document.querySelector('#player-inputs input')) {
        createPlayerInput();
      }
    }

    /**
     * Loads previously saved data if exists
     *
     * @public
     * @author mauricio.fiorest
     * @since 0.9.0
     */
    function load() {
      setLoading(true);

      App.Sockets.Server.loadGame();

      setLoading(false);
    }

    /**
     * Build players objects from players list
     *
     * @private
     * @author mauricio.araldi
     * @since 0.5.0
     */
    function buildPlayers() {
      setLoading(true);

      const players = [];

      // Runs trought the inputs with player names
      document.querySelectorAll('#player-names input').forEach((input) => {
        const playerName = input.value;

        // Prevents blank names
        if (!playerName) {
          return;
        }

        if (players.includes(playerName)) {
          setLoading(false);
          throw new Error(`Names can't be equal: ${playerName}`);
        }

        players.push(playerName);
      });

      App.Sockets.Server.setPlayers(players);
    }

    /**
     * Changes app screen. Possible values:
     * -draftName
     * -newDraftRound
     * -players
     * -startTimer
     * -table
     * -timer
     * -timerFinished
     * -timerRunning
     *
     * @private
     * @author mauricio.araldi
     * @since 0.6.0
     *
     * @param {string} screen Name of the screen to show (one of the values above)
     */
    function changeScreen(screen) {
      // Reset everything
      document.querySelector('#buttons').classList.add('hidden');
      document.querySelector('#buttons > #load')?.classList.add('hidden');

      document.querySelector('#draft-name').classList.add('hidden');

      document.querySelector('#draft-timer').classList.add('hidden');
      document.querySelector('#draft-timer > #draft-finished').classList.add('hidden');
      document.querySelector('#draft-timer > #draft-timer-runner').classList.add('hidden');
      document.querySelector('#draft-timer > #draft-timer-settings').classList.add('hidden');
      document.querySelector('#draft-timer > #draft-timer-places').classList.add('hidden');
      document.querySelector('#draft-timer #restart-timer').classList.add('hidden');
      document.querySelector('#draft-timer #start-timer').classList.add('hidden');

      document.querySelector('#player-names').classList.add('hidden');

      document.querySelector('#tournament-table').classList.add('hidden');

      // Shows what must be shown
      switch (screen) {
        case 'draftName': {
          document.querySelector('#draft-name').classList.remove('hidden');
          document.querySelector('#buttons').classList.remove('hidden');
          document.querySelector('#buttons > #load')?.classList.remove('hidden');
          break;
        }

        case 'players': {
          document.querySelector('#buttons').classList.remove('hidden');
          document.querySelector('#buttons > #load')?.classList.remove('hidden');
          document.querySelector('#player-names').classList.remove('hidden');
          break;
        }

        case 'table': {
          document.querySelector('#buttons').classList.remove('hidden');
          document.querySelector('#buttons > #load')?.classList.remove('hidden');
          document.querySelector('#tournament-table').classList.remove('hidden');
          break;
        }

        case 'timer': {
          document.querySelector('#draft-timer').classList.remove('hidden');
          document.querySelector('#draft-timer > #draft-timer-settings').classList.remove('hidden');
          document.querySelector('#draft-timer > #draft-timer-places').classList.remove('hidden');
          break;
        }

        case 'startTimer': {
          document.querySelector('#draft-timer').classList.remove('hidden');
          document.querySelector('#draft-timer > #draft-timer-runner').classList.remove('hidden');
          document.querySelector('#draft-timer #start-timer').classList.remove('hidden');
          break;
        }

        case 'timerRunning': {
          document.querySelector('#draft-timer').classList.remove('hidden');
          document.querySelector('#draft-timer > #draft-timer-runner').classList.remove('hidden');
          document.querySelector('#draft-timer #restart-timer').classList.remove('hidden');
          break;
        }

        case 'newDraftRound': {
          document.querySelector('#draft-timer').classList.remove('hidden');
          document.querySelector('#draft-timer > #draft-timer-settings').classList.remove('hidden');
          break;
        }

        case 'timerFinished': {
          document.querySelector('#draft-timer').classList.remove('hidden');
          document.querySelector('#draft-timer > #draft-finished').classList.remove('hidden');
          break;
        }

        default: {
          App.Utils.errorPopup(`Invalid screen to load: ${screen}`);
          break;
        }
      }
    }

    /**
     * Creates a new player input
     *
     * @private
     * @author mauricio.araldi
     * @since 0.5.0
     */
    function createPlayerInput() {
      const playerNumber = document.querySelectorAll('#player-inputs input').length + 1;
      const newInput = document.createElement('input');

      newInput.id = 'player-' + playerNumber;
      newInput.placeholder = 'Player ' + playerNumber;

      newInput.addEventListener('keypress', (ev) => {
        if (ev.key === 'Enter') {
          ev.currentTarget.blur();
        }
      });

      document.querySelector('#player-inputs').append(newInput);

      newInput.focus();
    }

    /**
     * Plays the sound sequence that indicate round start
     *
     * @private
     * @author mauricio.araldi
     * @since 0.5.0
     */
    function startRoundSound() {
      document.querySelector('#hi-beep-sound').play();
      setTimeout(() => {
        document.querySelector('#hi-beep-sound').pause();
        document.querySelector('#hi-beep-sound').currentTime = 0;

        document.querySelector('#hi-beep-sound').play();
        setTimeout(() => {
          document.querySelector('#hi-beep-sound').pause();
          document.querySelector('#hi-beep-sound').currentTime = 0;

          document.querySelector('#chime-sound').play();
          setTimeout(() => {
            document.querySelector('#chime-sound').pause();
            document.querySelector('#chime-sound').currentTime = 0;
          }, 1000);
        }, 500);
      }, 500);
    }

    /**
     * Indicates time trough beeps
     *
     * @private
     * @author mauricio.araldi
     * @since 0.5.0
     *
     * @param {number} time Seconds left in the current round
     */
    function timeIndicatorSound(time) {
      switch (time) {
        case App.Config.firstNotificationBeepTime: {
          document.querySelector('#hi-beep-sound').play();
          setTimeout(() => {
            document.querySelector('#hi-beep-sound').pause();
            document.querySelector('#hi-beep-sound').currentTime = 0;
          }, 500);

          break;
        }

        case App.Config.secondNotificationBeepTime: {
          document.querySelector('#lo-beep-sound').play();
          setTimeout(() => {
            document.querySelector('#lo-beep-sound').pause();
            document.querySelector('#lo-beep-sound').currentTime = 0;

            document.querySelector('#hi-beep-sound').play();
            setTimeout(() => {
              document.querySelector('#hi-beep-sound').pause();
              document.querySelector('#hi-beep-sound').currentTime = 0;
            }, 500);
          }, 500);

          break;
        }

        case App.Config.thirdNotificationBeepTime: {
          document.querySelector('#lo-beep-sound').play();
          setTimeout(() => {
            document.querySelector('#lo-beep-sound').pause();
            document.querySelector('#lo-beep-sound').currentTime = 0;

            document.querySelector('#lo-beep-sound').play();
            setTimeout(() => {
              document.querySelector('#lo-beep-sound').pause();
              document.querySelector('#lo-beep-sound').currentTime = 0;

              document.querySelector('#hi-beep-sound').play();
              setTimeout(() => {
                document.querySelector('#hi-beep-sound').pause();
                document.querySelector('#hi-beep-sound').currentTime = 0;
              }, 500);
            }, 500);
          }, 500);

          break;
        }
        // No default
      }
    }

    /**
     * Draws onscreen the players table
     *
     * @public
     * @author mauricio.araldi
     * @since 0.6.0
     */
    function drawTournamentTable() {
      const tables = document.querySelector('#tables');

      changeScreen('table');
      tables.replaceChildren();

      getPlayersInOrder().forEach((player, index) => {
        tables.append(buildPlayerTable(player.id, index + 1));
      });

      setLoading(false);
    }

    /**
     * Build the HTML table of a player
     *
     * @private
     * @author mauricio.araldi
     * @since 0.5.0
     *
     * @param {string} playerId ID of the player whose table is built
     * @param {number} position Current ranking position of the player
     * @returns {HTMLTableElement} The player's table element
     */
    function buildPlayerTable(playerId, position) {
      const player = App.Data.players[playerId];
      const playerTable = App.Data.tournament[playerId];
      const htmlTable = createElement('table', 'player-table');
      const positionTr = createElement('tr', 'position');
      const positionTd = createElement('td', '', position + 'º');
      let isCreatePlayerName = true;
      let totalGamesWon = 0;
      let totalGamesLost = 0;
      let totalMatchesWon = 0;
      let totalMatchesLost = 0;

      positionTd.colSpan = 5;
      positionTr.append(positionTd);
      htmlTable.dataset.playerId = playerId;
      htmlTable.append(positionTr);

      App.Data.players[playerId].matchesWon = 0;
      App.Data.players[playerId].matchesLost = 0;

      // Runs all the players to build the matches of a player
      for (const [opponentId, opponent] of Object.entries(App.Data.players)) {
        const tr = createElement('tr');
        const playerScore = createElement('td', 'score player-score');
        const divider = createElement('td', 'divider', 'X');
        const oppScore = createElement('td', 'score opp-score');
        const oppName = createElement('td', 'opp-name', opponent.id);

        // If the opponent is the same of player, doesn't create match
        if (player.id === opponent.id) {
          continue;
        }

        // Data opp index
        tr.dataset.oppId = opponentId;
        playerScore.contentEditable = 'true';
        oppScore.contentEditable = 'true';

        if (isCreatePlayerName) {
          const playerName = createElement('td', 'player-name');

          playerName.rowSpan = Object.keys(App.Data.players).length;
          playerName.append(
            createElement('p', '', player.id),
            createElement('p', 'player-games-score'),
            createElement('p', 'player-matches-score')
          );
          tr.append(playerName);
          isCreatePlayerName = false;
        }

        // Adjust scores
        const { matchesWon, matchesLost } = playerTable[opponentId];
        playerScore.textContent = matchesWon || (matchesLost ? '0' : '');
        oppScore.textContent = matchesLost || (matchesWon ? '0' : '');
        totalMatchesWon += matchesWon ? Number(matchesWon) : 0;
        totalMatchesLost += matchesLost ? Number(matchesLost) : 0;

        // If the wins/loses are 2 or higher, adds a win/lose to player
        totalGamesWon += Math.trunc(matchesWon / 2);
        totalGamesLost += Math.trunc(matchesLost / 2);

        if (matchesWon > 1 && matchesWon > matchesLost) {
          tr.classList.add('win');
        } else if (matchesLost > 1 && matchesLost > matchesWon) {
          tr.classList.add('loss');
        }

        tr.append(playerScore, divider, oppScore, oppName);

        htmlTable.append(tr);
      }

      // Adjust player object
      App.Data.players[playerId].gamesWon = totalGamesWon;
      App.Data.players[playerId].gamesLost = totalGamesLost;
      App.Data.players[playerId].totalGames = totalGamesWon + totalGamesLost;
      App.Data.players[playerId].matchesWon = totalMatchesWon;
      App.Data.players[playerId].matchesLost = totalMatchesLost;

      htmlTable.querySelector('.player-games-score').textContent =
        `G: ${App.Data.players[playerId].gamesWon}/${App.Data.players[playerId].gamesWon + App.Data.players[playerId].gamesLost}`;
      htmlTable.querySelector('.player-matches-score').textContent =
        `M: ${App.Data.players[playerId].matchesWon}/${App.Data.players[playerId].matchesWon + App.Data.players[playerId].matchesLost}`;

      return htmlTable;
    }

    /**
     * Sort places for players
     *
     * @private
     * @author mauricio.araldi
     * @since 0.5.0
     */
    function sortPlayerPlaces() {
      // Shuffle three times
      const order = App.Utils.shuffle(Object.values(App.Data.players), 3);

      const placesElement = document.querySelector('#draft-timer-places > span');
      let places = placesElement.textContent;

      order.forEach((player) => {
        places += ` ${player.id}, `;
      });

      placesElement.textContent = places.slice(0, -2);
    }

    /**
     * Updates the ranking
     *
     * @private
     * @author mauricio.araldi
     * @since 0.5.0
     *
     * @returns {object[]} Players sorted from first to last place
     */
    function getPlayersInOrder() {
      // Gets all players that will be drawed
      const playerOrder = Object.values(App.Data.players);

      playerOrder.sort((a, b) => {
        // 1st Criteria = games won (more is better)
        if (a.gamesWon !== b.gamesWon) {
          return b.gamesWon - a.gamesWon;
        }

        // 2nd Criteria = total games played (more is better)
        if (a.totalGames !== b.totalGames) {
          return b.totalGames - a.totalGames;
        }

        // 3rd Criteria = games lost (less is beter)
        if (a.gamesLost !== b.gamesLost) {
          return a.gamesLost - b.gamesLost;
        }

        // 4th Criteria = matches won (more is better)
        if (a.matchesWon !== b.matchesWon) {
          return b.matchesWon - a.matchesWon;
        }

        // 5th Criteria = matches lost (less is better)
        return a.matchesLost - b.matchesLost;
      });

      return playerOrder;
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

      const loader = createElement('div', '', 'Loading');

      loader.id = 'loader';
      document.body.append(loader);
    }

    /**
     * Counts how many player name inputs are filled
     *
     * @private
     * @author mauricio.araldi
     * @since 0.10.0
     *
     * @returns {number} Amount of non-empty player names
     */
    function countFilledPlayerNames() {
      return [...document.querySelectorAll('#player-names input')].filter(
        (input) => input.value.length > 0
      ).length;
    }

    /**
     * Creates an HTML element
     *
     * @private
     * @author mauricio.araldi
     * @since 0.10.0
     *
     * @param {string} tagName HTML tag to create, like 'td' or 'p'
     * @param {string} [className] Space-separated CSS classes to add
     * @param {string|number} [textContent] Text shown inside the element
     * @returns {HTMLElement} The created element
     */
    function createElement(tagName, className, textContent) {
      const element = document.createElement(tagName);

      if (className) {
        element.className = className;
      }

      if (textContent !== undefined) {
        element.textContent = textContent;
      }

      return element;
    }

    /**
     * Draws suggested matches on screen
     *
     * @public
     * @author mauricio.araldi
     * @since 0.6.0
     *
     * @param {string[][]} data Rounds of suggested matches received from server (only the first
     * App.Config.suggestedRoundsShown are drawn)
     */
    function drawSuggestedMatches(data) {
      const suggestedMatches = document.querySelector('#suggested-matches');

      suggestedMatches.querySelectorAll(':scope > .suggested-round').forEach((round) => {
        round.remove();
      });

      data.slice(0, App.Config.suggestedRoundsShown).forEach((matches, index) => {
        const round = createElement('div', 'suggested-round');

        round.append(
          createElement('span', '', `Round ${index + 1}:`),
          ...matches.map((match) => createElement('span', 'suggested-match', match))
        );
        suggestedMatches.append(round);
      });
    }

    return {
      bindEvents,
      drawSuggestedMatches,
      drawTournamentTable,
      initPlayers,
      load,
      init,
    };
  })();

  // DOM Ready -- initializes the module
  document.addEventListener('DOMContentLoaded', () => {
    App.server.bindEvents();
    App.server.load();
  });
})(window);
