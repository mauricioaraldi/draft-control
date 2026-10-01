/**
 * Server controller
 *
 * @param {jQuery} $ The jQuery function
 * @param {Window} window The browser window
 */
(($, window) => {
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
      $(document).on('blur', '#player-inputs input:last-child', (ev) => {
        const value = $(ev.currentTarget).val();

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
      $('#submit-draft-name').on('click', (ev) => {
        setLoading(true);

        const name = $('#draft-name > input').val();

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
      $('#draft-name > input').on('keyup', (ev) => {
        if (ev.which === 13) {
          $('#submit-draft-name').click();
        }
      });

      /**
       * On submitting player names
       *
       * @author mauricio.araldi
       * @since 0.5.0
       */
      $('#submit-player-names').on('click', (ev) => {
        ev.preventDefault();
        if (
          $('#player-names input').filter(function () {
            return $(this).val().length > 0;
          }).length > 1
        ) {
          setLoading(true);

          try {
            buildPlayers();
          } catch (error) {
            return App.Utils.errorPopup(error.message);
          }

          /**
           * When players are loaded, build tournament tables
           */
          $(document).on('playersLoaded', () => {
            changeScreen('table');

            // Build Tournament
            App.Sockets.Server.getTournamentTable();

            setLoading(false);
          });
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
      $(document).on('blur', '.score', (ev) => {
        const playerId = $(ev.currentTarget).closest('.player-table').attr('data-player-id');
        const opponentId = $(ev.currentTarget).closest('tr').attr('data-opp-id');
        const playerScore = $(ev.currentTarget).closest('tr').find('.player-score').text();
        const opponentScore = $(ev.currentTarget).closest('tr').find('.opp-score').text();

        // When changing the score of a player, auto switch to the scores
        // of opponent on the same match on blur
        if ($(ev.currentTarget).hasClass('player-score')) {
          return $('.player-table[data-player-index=' + playerId + ']')
            .find('tr[data-opp-index=' + opponentId + ']')
            .find('.opp-score')
            .focus();
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
      $(document).on('click', '.opp-name', (ev) => {
        $(ev.currentTarget).siblings('.player-score').focus();
      });

      /**
       * Return to home screen
       *
       * @author mauricio.fiorest
       * @since 0.9.0
       */
      $('#home').on('click', (ev) => {
        location.assign('/server');
      });

      /**
       * Upon clicking Draft Timer
       *
       * @author mauricio.araldi
       * @since 0.5.0
       */
      $('#enter-draft-timer').on('click', (ev) => {
        if (
          $('#player-names input').filter(function () {
            return $(this).val().length > 0;
          }).length > 1
        ) {
          try {
            buildPlayers();
          } catch (error) {
            return App.Utils.errorPopup(error.message);
          }

          /**
           * Once players are loaded
           */
          $(document).on('playersLoaded', () => {
            sortPlayerPlaces();
            App.Data.values.currentOrientation = 'Right';

            changeScreen('timer');

            setLoading(false);
          });
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
      $('#init-timer').on('click', (ev) => {
        const rounds = Number($('#round-number').val());
        const time = Math.ceil(rounds * App.Config.draftRoundTime);

        App.Data.values.roundsLeft = rounds;
        App.Data.values.draftTimer = time;
        App.Data.values.currentTime = time;

        changeScreen('startTimer');

        $('#clock').text(App.Data.values.draftTimer);
        $('#rounds-left-timer').text(App.Data.values.roundsLeft);
        $('#rounds-orientation').text(App.Data.values.currentOrientation);
      });

      /**
       * Upon starting timer
       *
       * @author mauricio.araldi
       * @since 0.5.0
       */
      $('#start-timer').on('click', (ev) => {
        startRoundSound();

        setTimeout(() => {
          changeScreen('timerRunning');

          decreaser = setInterval(() => {
            $('#clock').text(--App.Data.values.currentTime);
            timeIndicatorSound(App.Data.values.currentTime);

            if (App.Data.values.currentTime !== 0) {
              return;
            }

            clearInterval(decreaser);

            $('#alarm-clock-sound')[0].play();
            $('body').addClass('alarm-playing');
          }, 1000);
        }, 500);
      });

      /**
       * Upon restarting timer
       *
       * @author mauricio.araldi
       * @since 0.5.0
       */
      $('#restart-timer').on('click', (ev) => {
        $('body').removeClass('alarm-playing');
        $('#alarm-clock-sound')[0].pause();
        $('#alarm-clock-sound')[0].currentTime = 0;

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

        $('#clock').text(App.Data.values.currentTime);
        $('#rounds-left-timer').text(--App.Data.values.roundsLeft);
        $('#rounds-orientation').text(App.Data.values.currentOrientation);

        if (App.Data.values.roundsLeft === 0) {
          $(document).trigger('draft-timer-finished');
        }
      });

      /**
       * Starting new draft round
       *
       * @author mauricio.araldi
       * @since 0.5.0
       */
      $('#new-draft-round').on('click', (ev) => {
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
      $('#return-home').on('click', (ev) => {
        App.Data.players = {};
        changeScreen('players');
      });

      /**
       * Upon finishing the number of rounds to draft
       *
       * @author mauricio.araldi
       * @since 0.5.0
       */
      $(document).on('draft-timer-finished', (ev) => {
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
      if ($('#player-inputs input').length === 0) {
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
      $('#player-names input').each((index, input) => {
        const playerName = $(input).val();

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
      $('#buttons').addClass('hidden');
      $('#buttons > #load').addClass('hidden');

      $('#draft-name').addClass('hidden');

      $('#draft-timer').addClass('hidden');
      $('#draft-timer > #draft-finished').addClass('hidden');
      $('#draft-timer > #draft-timer-runner').addClass('hidden');
      $('#draft-timer > #draft-timer-settings').addClass('hidden');
      $('#draft-timer > #draft-timer-places').addClass('hidden');
      $('#draft-timer #restart-timer').addClass('hidden');
      $('#draft-timer #start-timer').addClass('hidden');

      $('#player-names').addClass('hidden');

      $('#tournament-table').addClass('hidden');

      // Shows what must be shown
      switch (screen) {
        case 'draftName': {
          $('#draft-name').removeClass('hidden');
          $('#buttons').removeClass('hidden');
          $('#buttons > #load').removeClass('hidden');
          break;
        }

        case 'players': {
          $('#buttons').removeClass('hidden');
          $('#buttons > #load').removeClass('hidden');
          $('#player-names').removeClass('hidden');
          break;
        }

        case 'table': {
          $('#buttons').removeClass('hidden');
          $('#buttons > #load').removeClass('hidden');
          $('#tournament-table').removeClass('hidden');
          break;
        }

        case 'timer': {
          $('#draft-timer').removeClass('hidden');
          $('#draft-timer > #draft-timer-settings').removeClass('hidden');
          $('#draft-timer > #draft-timer-places').removeClass('hidden');
          break;
        }

        case 'startTimer': {
          $('#draft-timer').removeClass('hidden');
          $('#draft-timer > #draft-timer-runner').removeClass('hidden');
          $('#draft-timer #start-timer').removeClass('hidden');
          break;
        }

        case 'timerRunning': {
          $('#draft-timer').removeClass('hidden');
          $('#draft-timer > #draft-timer-runner').removeClass('hidden');
          $('#draft-timer #restart-timer').removeClass('hidden');
          break;
        }

        case 'newDraftRound': {
          $('#draft-timer').removeClass('hidden');
          $('#draft-timer > #draft-timer-settings').removeClass('hidden');
          break;
        }

        case 'timerFinished': {
          $('#draft-timer').removeClass('hidden');
          $('#draft-timer > #draft-finished').removeClass('hidden');
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
      const playerNumber = $('#player-inputs input').length + 1;
      const newInput = $('<input>');

      newInput.attr('id', 'player-' + playerNumber).attr('placeholder', 'Player ' + playerNumber);

      newInput.on('keypress', (ev) => {
        if (ev.which === 13) {
          $(ev.currentTarget).blur();
        }
      });

      $('#player-inputs').append(newInput);

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
      $('#hi-beep-sound')[0].play();
      setTimeout(() => {
        $('#hi-beep-sound')[0].pause();
        $('#hi-beep-sound')[0].currentTime = 0;

        $('#hi-beep-sound')[0].play();
        setTimeout(() => {
          $('#hi-beep-sound')[0].pause();
          $('#hi-beep-sound')[0].currentTime = 0;

          $('#chime-sound')[0].play();
          setTimeout(() => {
            $('#chime-sound')[0].pause();
            $('#chime-sound')[0].currentTime = 0;
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
          $('#hi-beep-sound')[0].play();
          setTimeout(() => {
            $('#hi-beep-sound')[0].pause();
            $('#hi-beep-sound')[0].currentTime = 0;
          }, 500);

          break;
        }

        case App.Config.secondNotificationBeepTime: {
          $('#lo-beep-sound')[0].play();
          setTimeout(() => {
            $('#lo-beep-sound')[0].pause();
            $('#lo-beep-sound')[0].currentTime = 0;

            $('#hi-beep-sound')[0].play();
            setTimeout(() => {
              $('#hi-beep-sound')[0].pause();
              $('#hi-beep-sound')[0].currentTime = 0;
            }, 500);
          }, 500);

          break;
        }

        case App.Config.thirdNotificationBeepTime: {
          $('#lo-beep-sound')[0].play();
          setTimeout(() => {
            $('#lo-beep-sound')[0].pause();
            $('#lo-beep-sound')[0].currentTime = 0;

            $('#lo-beep-sound')[0].play();
            setTimeout(() => {
              $('#lo-beep-sound')[0].pause();
              $('#lo-beep-sound')[0].currentTime = 0;

              $('#hi-beep-sound')[0].play();
              setTimeout(() => {
                $('#hi-beep-sound')[0].pause();
                $('#hi-beep-sound')[0].currentTime = 0;
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
      changeScreen('table');
      $('#tables').empty();

      getPlayersInOrder().forEach((player, index) => {
        $('#tables').append(buildPlayerTable(player.id, index + 1));
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
     * @returns {jQuery} The player's table element
     */
    function buildPlayerTable(playerId, position) {
      const player = App.Data.players[playerId];
      const playerTable = App.Data.tournament[playerId];
      const htmlTable = $('<table class="player-table">');
      const positionTr = $('<tr class="position">');
      const positionTd = $('<td colspan="5">').text(position + 'º');
      let isCreatePlayerName = true;
      let totalGamesWon = 0;
      let totalGamesLost = 0;
      let totalMatchesWon = 0;
      let totalMatchesLost = 0;

      htmlTable.attr('data-player-id', playerId).append(positionTr.append(positionTd));

      App.Data.players[playerId].matchesWon = 0;
      App.Data.players[playerId].matchesLost = 0;

      // Runs all the players to build the matches of a player
      for (const [opponentId, opponent] of Object.entries(App.Data.players)) {
        const tr = $('<tr>');
        const playerScore = $('<td class="score player-score" contenteditable>');
        const divider = $('<td class="divider">').text('X');
        const oppScore = $('<td class="score opp-score" contenteditable>');
        const oppName = $('<td class="opp-name">').text(opponent.id);

        // If the opponent is the same of player, doesn't create match
        if (player.id === opponent.id) {
          continue;
        }

        // Data opp index
        tr.attr('data-opp-id', opponentId);

        if (isCreatePlayerName) {
          tr.append(
            $('<td class="player-name">')
              .attr('rowspan', Object.keys(App.Data.players).length)
              .append($('<p>').text(player.id))
              .append($('<p class="player-games-score">'))
              .append($('<p class="player-matches-score">'))
          );
          isCreatePlayerName = false;
        }

        // Adjust scores
        const { matchesWon, matchesLost } = playerTable[opponentId];
        playerScore.text(matchesWon || (matchesLost ? '0' : ''));
        oppScore.text(matchesLost || (matchesWon ? '0' : ''));
        totalMatchesWon += matchesWon ? Number(matchesWon) : 0;
        totalMatchesLost += matchesLost ? Number(matchesLost) : 0;

        // If the wins/loses are 2 or higher, adds a win/lose to player
        totalGamesWon += Math.trunc(matchesWon / 2);
        totalGamesLost += Math.trunc(matchesLost / 2);

        if (matchesWon > 1 && matchesWon > matchesLost) {
          tr.addClass('win');
        } else if (matchesLost > 1 && matchesLost > matchesWon) {
          tr.addClass('loss');
        }

        tr.append(playerScore).append(divider).append(oppScore).append(oppName);

        htmlTable.append(tr);
      }

      // Adjust player object
      App.Data.players[playerId].gamesWon = totalGamesWon;
      App.Data.players[playerId].gamesLost = totalGamesLost;
      App.Data.players[playerId].totalGames = totalGamesWon + totalGamesLost;
      App.Data.players[playerId].matchesWon = totalMatchesWon;
      App.Data.players[playerId].matchesLost = totalMatchesLost;

      htmlTable
        .find('.player-games-score')
        .text(
          `G: ${App.Data.players[playerId].gamesWon}/${App.Data.players[playerId].gamesWon + App.Data.players[playerId].gamesLost}`
        );
      htmlTable
        .find('.player-matches-score')
        .text(
          `M: ${App.Data.players[playerId].matchesWon}/${App.Data.players[playerId].matchesWon + App.Data.players[playerId].matchesLost}`
        );

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

      order.forEach((player) => {
        $('#draft-timer-places > span').text(
          `${$('#draft-timer-places > span').text()} ${player.id}, `
        );
      });

      $('#draft-timer-places > span').text($('#draft-timer-places > span').text().slice(0, -2));
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
        $('#loader').remove();
        return;
      }

      $('body').append($('<div id="loader">Loading</div>'));
    }

    /**
     * Draws suggested matches on screen
     *
     * @public
     * @author mauricio.araldi
     * @since 0.6.0
     *
     * @param {string[]} data Suggested matches received from server
     */
    function drawSuggestedMatches(data) {
      $('#suggested-matches > p').remove();

      data.forEach((suggestedMatch) => {
        $('#suggested-matches').append($('<p>').text(suggestedMatch));
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
  $(() => {
    App.server.bindEvents();
    App.server.load();
  });
})(jQuery, window);
