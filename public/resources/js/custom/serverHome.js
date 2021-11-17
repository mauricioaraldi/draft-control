/**
 * Counter controller
 */
;(($, window) => {
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
			$('#load').on('click', ev => {
                ev.preventDefault();
                if($(".draft").val()){
                    location.href = "/server?id="+$(".draft").val();
                }
			});
            
            /**
			 * Submit draft name
			 *
			 * @author mauricio.araldi
			 * @since 0.6.0
			 */
			$('#submit-draft-name').on('click', ev => {
				setLoading(true);

				var name = $('#draft-name > input').val();

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
		 */
		function drawHistory(data) {
            $('option').remove();
            $('select').append('<option value="" disabled selected>Select your option</option>');
            for (var draft in data.drafts) {
                if(draft == data.current){
                    $('select').append(
                        $('<option selected>').val(draft).text(data.drafts[draft])
                    );
                }
                else{
                    $('select').append(
                        $('<option>').val(draft).text(data.drafts[draft])
                    );
                }
            }
            $("#draft-load").show();
		}
        
        /**
		 * Hides the draft history list
		 *
		 * @public
		 * @author mauricio.fiorest
		 * @since 0.9.0
		 */
		function noHistory() {
            $("#draft-load").hide();
		}

        /**
		 * Toggles the screen block and loader
		 *
		 * @private
		 * @author mauricio.araldi
		 * @since  0.6.0
		 * 
		 * @param {Boolean} isLoading If the app is loading or not
		 */
		function setLoading(isLoading) {
			if (!isLoading) {
				return $('#loader').remove();
			}

			$('body').append( $('<div id="loader">Loading</div>') );
		}

		return {
			bindEvents,
            drawHistory,
            noHistory
		}
	})();

	//DOM Ready -- initializes the module
	$(() => {
		App.serverHome.bindEvents();
	});
})(jQuery, window);