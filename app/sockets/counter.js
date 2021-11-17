import Draft from '../Draft.js';
/**
 * Counter socket
 *
 * @author mauricio.araldi
 *
 * @socket /
 */
export default socket => {
	const session = socket.request.session;

	/**
	 * When players are requested
	 *
	 * @author mauricio.araldi
	 * @since 0.6.0
	 */
	socket.on('players', data => {
        console.log(CurrentDraft);
        if(!CurrentDraft){
            socket.emit('noGame','');
        }
        else{
            socket.emit('players', { draft: Drafts[CurrentDraft] });
        }
	});

	/**
	 * Whenever a game ends
	 *
	 * @author mauricio.araldi
	 * @since 0.6.0
	 */
	socket.on('endGame', data => {
        if(!CurrentDraft){ 
            socket.emit('noGame','');
        }
        else{
            //Updates winner score
            Drafts[CurrentDraft].tournament[data.winner][data.loser]['matchesWon']++;
            
            //Updates loser score
            Drafts[CurrentDraft].tournament[data.loser][data.winner]['matchesLost']++;

            io.of('/server').emit('tournament', Drafts[CurrentDraft].tournament);
        }
	});
};