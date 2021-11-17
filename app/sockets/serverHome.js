import Draft from '../Draft.js';
import DraftModel from '../objects/DraftModel.js';

/**
 * Server socketHome
 *
 * @author mauricio.fiorest
 * @since 0.9.0
 *
 * @socket /serverHome
 */
export default socket => {
	const session = socket.request.session;

	let draft = null;

	/**
	 * On receiving init history request
	 *
	 * @author mauricio.fiorest
	 * @since 0.9.0
	 */
	socket.on('loadHistory', data => {
        var tempDraft = {};
        for (var draft in Drafts) {
            if(Drafts[draft].name){
                tempDraft[draft]= Drafts[draft].name+" - "+new Date(Drafts[draft].date).toLocaleDateString('pt-BR');
            }
        }
		if (!tempDraft) {
			socket.emit('historyUnavailable');
		}

		socket.emit('history', { drafts: tempDraft, current: CurrentDraft });
	});
    
    /**
	 * Create a new draft and set name
	 *
	 * @author mauricio.fiorest
	 * @since 0.9.0
	 */
	socket.on('setName', data => {
        let id = Draft.generateId(socket.handshake.address),
		 draft = new DraftModel(id);

		Draft.register(draft);

		draft = Draft.setName(draft.id, data.draftName);
		socket.emit('newDraft', draft.id);
	});

};