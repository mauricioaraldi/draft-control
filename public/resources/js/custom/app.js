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
    thirdNotificationBeepTime: 10,
  },

  Keys: {
    mouseRight: false,
    touch: false,
  },

  Data: {
    name: '',

    values: {
      currentTime: 0,
      draftTimer: 0,
      roundsLeft: 0,
      currentOrientation: 'none',
    },

    players: {},

    tournament: {},
  },

  Sockets: {},

  Utils: {
    /**
     * Default template for the confirmation popup.
     *
     * @param {string} text Question shown to the user
     * @param {() => void} [yesAction] Called when the user clicks "Yes"
     * @param {() => void} [noAction] Called when the user clicks "No"
     */
    confirmPopup(text, yesAction, noAction) {
      yesAction = typeof yesAction === 'function' ? yesAction : $.noop;
      noAction = typeof noAction === 'function' ? noAction : $.noop;

      const confirm = new Noty({
        layout: 'center',
        theme: 'metroui',
        type: 'confirmation',
        text,
        dismissQueue: false,
        buttons: [
          Noty.button('Yes', 'btn btn-success', () => {
            yesAction();
            confirm.close();
          }),
          Noty.button('No', 'btn btn-error', () => {
            noAction();
            confirm.close();
          }),
        ],
      }).show();
    },

    /**
     * Default template for the error popup.
     *
     * @param {string} text Error message shown to the user
     */
    errorPopup(text) {
      new Noty({
        layout: 'center',
        theme: 'metroui',
        type: 'error',
        text,
        timeout: 3000,
      }).show();
    },

    /**
     * Default template for the success popup.
     *
     * @param {string} text Success message shown to the user
     */
    successPopup(text) {
      new Noty({
        layout: 'center',
        theme: 'metroui',
        type: 'success',
        text,
        timeout: 3000,
      }).show();
    },

    /**
     * Default template for the warning popup.
     *
     * @param {string} text Warning message shown to the user
     */
    warningPopup(text) {
      new Noty({
        layout: 'center',
        theme: 'metroui',
        type: 'warning',
        text,
        timeout: 3000,
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
     * @returns {Array} The shuffled array
     */
    shuffle(array, times) {
      let currentIndex = array.length;

      // While there remain elements to shuffle...
      while (currentIndex !== 0) {
        // Pick a remaining element...
        const randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        const temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
      }

      return times-- > 0 ? App.Utils.shuffle(array, times) : array;
    },
  },
};
