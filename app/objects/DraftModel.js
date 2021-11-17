export default class DraftModel {
	constructor(id, name, games, players) {
		this.id = id;
		this.name = name;
		this.games = games;
		this.players = players;
        this.values = {
			currentTime: 0,
			draftTimer: 0,
			roundsLeft: 0,
			currentOrientation: 'none',
		};
	}
}