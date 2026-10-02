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
    suggestedRoundsShown: 2,
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
     * Shows a dialog that stays open until the user picks one of its buttons
     *
     * @author mauricio.araldi
     * @since 0.10.0
     *
     * @param {string} type Kind of the dialog, used for its style (error or confirmation)
     * @param {string} text Message shown to the user
     * @param {{label: string, action?: () => void}[]} buttons Buttons that close the dialog
     */
    dialogPopup(type, text, buttons) {
      const dialog = document.createElement('dialog');
      const message = document.createElement('p');
      const actions = document.createElement('div');

      dialog.className = `popup-dialog popup-${type}`;
      message.textContent = text;
      actions.className = 'popup-actions';

      buttons.forEach(({ label, action }) => {
        const button = document.createElement('button');

        button.type = 'button';
        button.className = 'button';
        button.textContent = label;
        button.addEventListener('click', () => {
          dialog.close();
          action?.();
        });
        actions.append(button);
      });

      dialog.addEventListener('close', () => dialog.remove());
      dialog.append(message, actions);
      document.body.append(dialog);
      dialog.showModal();
    },

    /**
     * Shows a message at the top of the screen that disappears by itself
     *
     * @author mauricio.araldi
     * @since 0.10.0
     *
     * @param {string} type Kind of the message, used for its style (success or warning)
     * @param {string} text Message shown to the user
     */
    toastPopup(type, text) {
      let container = document.querySelector('#toasts');

      if (!container) {
        container = document.createElement('div');
        container.id = 'toasts';
        document.body.append(container);
      }

      const toast = document.createElement('div');

      toast.className = `toast popup-${type}`;
      toast.setAttribute('role', 'status');
      toast.textContent = text;
      container.append(toast);

      setTimeout(() => toast.remove(), 3000);
    },

    /**
     * Default template for the confirmation popup.
     *
     * @param {string} text Question shown to the user
     * @param {() => void} [yesAction] Called when the user clicks "Yes"
     * @param {() => void} [noAction] Called when the user clicks "No"
     */
    confirmPopup(text, yesAction, noAction) {
      App.Utils.dialogPopup('confirmation', text, [
        { label: 'Yes', action: yesAction },
        { label: 'No', action: noAction },
      ]);
    },

    /**
     * Default template for the error popup.
     *
     * @param {string} text Error message shown to the user
     */
    errorPopup(text) {
      App.Utils.dialogPopup('error', text, [{ label: 'OK' }]);
    },

    /**
     * Default template for the success popup.
     *
     * @param {string} text Success message shown to the user
     */
    successPopup(text) {
      App.Utils.toastPopup('success', text);
    },

    /**
     * Default template for the warning popup.
     *
     * @param {string} text Warning message shown to the user
     */
    warningPopup(text) {
      App.Utils.toastPopup('warning', text);
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

    /**
     * Shows an element, even if it is hidden by CSS
     *
     * @author mauricio.araldi
     * @since 0.10.0
     *
     * @param {HTMLElement} element Element to be shown
     */
    show(element) {
      element.style.display = '';

      if (getComputedStyle(element).display === 'none') {
        element.style.display = 'block';
      }
    },

    /**
     * Hides an element
     *
     * @author mauricio.araldi
     * @since 0.10.0
     *
     * @param {HTMLElement} element Element to be hidden
     */
    hide(element) {
      element.style.display = 'none';
    },

    /**
     * Toggles the visibility of an element
     *
     * @author mauricio.araldi
     * @since 0.10.0
     *
     * @param {HTMLElement} element Element to be toggled
     */
    toggle(element) {
      if (getComputedStyle(element).display === 'none') {
        App.Utils.show(element);
      } else {
        App.Utils.hide(element);
      }
    },
  },
};
