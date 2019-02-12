/**
 * Counter controller
 */
;(($, window) => {
	App.counter = (() => {
		let moveDelta = 0,
			playerBeingEdited = null,
			lastScreenY = null;

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
			$('.buttons > button').on('click', ev => {
				let value = parseInt($(ev.target).text()),
					player = $(ev.target).closest('.player');

				addPlayerHp(player, value);
			});

			/**
			 * Toggles the visibility of the menu
			 *
			 * @author mauricio.araldi
			 * @since 0.6.0
			 */
			$('#openMenu').on('click', ev => {
				$('#menu').toggle();
			});

			/**
			 * Toggles the visibility of the die menu
			 *
			 * @author mauricio.araldi
			 * @since 0.7.0
			 */
			$('#openDieMenu').on('click', ev => {
				$('#dieMenu').toggle();
			});

			/**
			 * Button close in menu
			 *
			 * @author mauricio.araldi
			 * @since 0.7.0
			 */
			$('#closeMenu').on('click', ev => {
				$('#menu').toggle();
			});
			
			/**
			 * Whenever mouse goes down on HP, change its key state
			 *
			 * @author mauricio.araldi
			 * @since 0.6.0
			 */
			$('.hp').on('mousedown', ev => {
				App.Keys.mouseRight = true;

				playerBeingEdited = $(ev.target).closest('.player');
			});

			/**
			 * Whenever mouse goes up on HP, change its key state
			 *
			 * @author mauricio.araldi
			 * @since 0.6.0
			 */
			$(document).on('mouseup', ev => {
				App.Keys.mouseRight = false;
			});

			/**
			 * When selecting a die to roll
			 *
			 * @author mauricio.araldi
			 * @since 0.7.0
			 */
			$('#dieMenu > button').on('click', ev => {
				let sides = parseInt($(this).text()),
					randomNumber = Math.floor(Math.random() * sides) + 1;
    			
    			alert(randomNumber);

    			$('#dieMenu').toggle();
			});

			/**
			 * Whenever touch starts in HP, change its key state
			 *
			 * @author mauricio.araldi
			 * @since 0.6.0
			 */
			$('.hp').on('touchstart', ev => {
				App.Keys.touch = true;

				playerBeingEdited = $(ev.target).closest('.player');
			});

			/**
			 * Whenever touch ends in HP, change its key state
			 *
			 * @author mauricio.araldi
			 * @since 0.6.0
			 */
			$(document).on('touchend', ev => {
				App.Keys.touch = false;
				lastScreenY = null;
			});

			/**
			 * When mouse moves
			 *
			 * @author mauricio.araldi
			 * @since 0.6.0
			 */
			$(document).on('mousemove', ev => {
				if (!App.Keys.mouseRight) {
					return;
				}

				if (playerBeingEdited) {
					moveDelta += ev.originalEvent.movementY;

					if (moveDelta > App.Config.addHpDelta) {
						moveDelta -= App.Config.addHpDelta;
						addPlayerHp(playerBeingEdited, -1);
					} else if (moveDelta < -App.Config.addHpDelta) {
						moveDelta += App.Config.addHpDelta;
						addPlayerHp(playerBeingEdited, 1);
					}
				}
			});

			/**
			 * When touch moves
			 *
			 * @author mauricio.araldi
			 * @since 0.6.0
			 */
			$(document).on('touchmove', ev => {
				if (!App.Keys.touch) {
					return;
				}

				if (lastScreenY === null) {
					lastScreenY = ev.originalEvent.changedTouches[0].screenY;
					return;
				}

				if (playerBeingEdited) {
					moveDelta += ev.originalEvent.changedTouches[0].screenY - lastScreenY;
					lastScreenY = ev.originalEvent.changedTouches[0].screenY;

					if (moveDelta > App.Config.addHpDelta) {
						moveDelta -= App.Config.addHpDelta;
						addPlayerHp(playerBeingEdited, -1);
					} else if (moveDelta < -App.Config.addHpDelta) {
						moveDelta += App.Config.addHpDelta;
						addPlayerHp(playerBeingEdited, 1);
					}
				}
			});

			/**
			 * Ends the game
			 *
			 * @author mauricio.araldi
			 * @since 0.6.0
			 */
			$('#endGame').on('click', ev => {
				let playerOne = $('.name:first').val(),
					playerTwo = $('.name:last').val(),
					buttonOne = $('<button>').text( playerOne ),
					buttonTwo = $('<button>').text( playerTwo ),
					cancelButton = $('<button>').text('Cancel');

				if (playerOne == playerTwo) {
					alert('Os jogadores não podem ter o mesmo nome');
					$('#menu').toggle();
					return;
				}

				$('#whoWonMenu').show().find('button').remove();

				buttonOne.on('click', ev => {
					App.Sockets.counter.endGame({winner: playerOne, loser: playerTwo});
					$('#reset').click();
					cancelButton.click();
				});

				buttonTwo.on('click', ev => {
					App.Sockets.counter.endGame({winner: playerTwo, loser: playerOne});
					$('#reset').click();
					cancelButton.click();
				});

				cancelButton.on('click', ev => {
					$('#whoWonMenu').hide();
				});

				$('#whoWonMenu').append(
					buttonOne
				).append(
					buttonTwo
				).append(
					cancelButton
				);
			});

			/**
			 * Resets the game
			 *
			 * @author mauricio.araldi
			 * @since  0.6.0
			 */
			$('#reset').on('click', ev => {
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
			$('.undo').on('click', ev => {
				let playerEl = $(ev.target).closest('.player'),
					lastHpEl = playerEl.find('.history > div > span:last'),
					lastHpValue = lastHpEl.text().replace('-', '').replace('+', '-');

				lastHpEl.remove();

				addPlayerHp(playerEl, parseInt(lastHpValue), true);
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
		 * @param {jQuerySelector} playerEl The player to have it's HP add
		 * @param {Integer} hpDelta The amount of HP to add
		 * @param {Boolean} preventHistory If the life should NOT be added to history
		 */
		function addPlayerHp(playerEl, hpDelta, preventHistory) {
			var hpEl = playerEl.find('.hp'),
				curHp = parseInt(hpEl.text()),
				historyEl = playerEl.find('.history'),
				curHistoryDelta = parseInt(historyEl.attr('data-delta'));

			hpEl.text(curHp + hpDelta);
			historyEl.attr('data-delta', curHistoryDelta += hpDelta);

			historyEl.attr('data-time', new Date().getTime());

			setTimeout(() => {
				if ((new Date().getTime() - parseInt(historyEl.attr('data-time'))) < App.Config.hpProccessTime) {
					return;
				}

				let diff = historyEl.attr('data-delta');

				if (diff == '0') {
					return;
				}

				if (diff.indexOf('-') == -1) {
					diff = '+'.concat(diff);
				}

				if (!preventHistory) {
					historyEl.find('div').append(
						$('<span>').text(diff)
					);
				}

				historyEl.scrollTop( historyEl[0].scrollTopMax );
				historyEl.attr('data-delta', 0);
			}, App.Config.hpProccessTime);
		}

		/**
		 * Populates the player's select
		 *
		 * @public
		 * @author mauricio.araldi
		 * @since 0.6.0
		 */
		function drawPlayers(players) {
			$('option').remove();

			Object.values(players).forEach(player => {
				let id = player.id;

				$('select').append(
					$('<option>').val(player.id).text(player.id)
				);
			});
		}

		return {
			bindEvents,
			drawPlayers,
			init
		}
	})();

	//DOM Ready -- initializes the module
	$(() => {
		App.counter.bindEvents();
		App.counter.init();
	});
})(jQuery, window);