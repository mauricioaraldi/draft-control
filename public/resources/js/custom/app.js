App = {
	Config: {
		addHpDelta: 30,
		draftRoundTime: 11.5,
		firstNotificationBeepTime: 30,
		hpProccessTime: 800,
		majorRoundTimeDecrease: 8,
		majorRoundTimeMax: 10,
		minorRoundTimeDecrease: 3,
		minorRoundTimeMax: 5,
		secondNotificationBeepTime: 20,
		thirdNotificationBeepTime: 10
	},

	Keys: {
		mouseRight: false,
		touch: false
	},

	Data: {
		name: '',

		values: {
			currentTime: 0,
			draftTimer: 0,
			roundsLeft: 0,
			currentOrientation: 'none',
		},

		players: {
		},

		tournament: {
		},
	},
	
	Sockets: {},

	Utils: {
		/**
		 * Default template for the confirmation popup.
		 */
		confirmPopup : (text, yesAction, noAction) => {
			yesAction = typeof yesAction == 'function' ? yesAction : $.noop;
			noAction = typeof noAction == 'function' ? noAction : $.noop;

			var confirm = new Noty({layout: 'center', theme: 'metroui', 
				type: 'confirmation', text, dismissQueue: false,
				buttons : [
					Noty.button('Yes', 'btn btn-success', function() {
						yesAction();
						confirm.close();
					}),
					Noty.button('No', 'btn btn-error', function() {
						noAction();
						confirm.close();
					})
				]
			}).show();
		},
		
		/**
		 * Default template for the error popup.
		 */
		errorPopup : text => {
			new Noty({layout: 'center', theme: 'metroui', 
				type: 'error', text, timeout: 3000
			}).show();
		},
		
		/**
		 * Default template for the success popup.
		 */
		successPopup : text => {
			new Noty({layout: 'center', theme: 'metroui', 
				type: 'success', text, timeout: 3000
			}).show();
		},

		/**
		 * Default template for the info popup.
		 */
		warningPopup : text => {
			new Noty({layout: 'center', theme: 'metroui', 
				type: 'warning', text, timeout: 3000
			}).show();
		},

		/**
		* Shuffles an array
		*
		* @private
		* @author knuth.shuffle, mauricio.araldi
		* @since 0.5.0
		* 
		* @param {Array} array Array to be shuffled
		* @param {Integer} times How many times the array will be shuffled
		* @return {Array} The shuffled array
		*/
		shuffle: (array, times) => {
			var currentIndex = array.length, temporaryValue, randomIndex;

			// While there remain elements to shuffle...
			while (0 !== currentIndex) {
				// Pick a remaining element...
				randomIndex = Math.floor(Math.random() * currentIndex);
				currentIndex -= 1;

				// And swap it with the current element.
				temporaryValue = array[currentIndex];
				array[currentIndex] = array[randomIndex];
				array[randomIndex] = temporaryValue;
			}

			if (times-- > 0) {
				return App.Utils.shuffle(array, times);
			}

			return array;
		}
	}
};