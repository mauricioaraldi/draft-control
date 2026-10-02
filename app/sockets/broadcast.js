import Draft from '../Draft.js';

/**
 * Sends the tournament of a draft, with its standings and suggested matches, to every
 * server page that has the draft open
 *
 * @author mauricio.araldi
 * @since 0.10.0
 *
 * @param {string} draftId ID of the draft whose tournament changed
 */
export default function broadcastTournament(draftId) {
  const draft = Drafts[draftId];
  const room = io.of('/server').to(draftId);

  room.emit('tournament', {
    tournament: draft.tournament,
    players: draft.players,
    standings: draft.standings,
  });
  room.emit('suggestedMatches', Draft.buildSuggestedMatches(draftId));
}
