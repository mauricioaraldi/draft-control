/**
 * Represents a Player in the system
 *
 * @author mauricio.araldi
 * @since 0.2.0
 */
export default class Player { 
	constructor(id, gamesWon, gamesLost, totalGames, matchesWon, matchesLost) {
		this.id = id;
		this.gamesWon = gamesWon;
		this.gamesLost = gamesLost;
		this.totalGames = totalGames;
		this.matchesWon = matchesWon;
		this.matchesLost = matchesLost;
	}
}