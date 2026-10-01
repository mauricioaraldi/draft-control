/**
 * Represents a Player in the system
 *
 * @author mauricio.araldi
 * @since 0.2.0
 */
export default class PlayerModel {
  /**
   * Creates a player with no results yet, unless initial results are given.
   *
   * @param {string} id Name of the player, also used as its ID
   * @param {object} [stats] Initial results of the player (all default to 0)
   * @param {number} [stats.gamesWon] Best-of-three rounds this player won
   * @param {number} [stats.gamesLost] Best-of-three rounds this player lost
   * @param {number} [stats.totalGames] Sum of rounds won and lost
   * @param {number} [stats.matchesWon] Single matches this player won, across all rounds
   * @param {number} [stats.matchesLost] Single matches this player lost, across all rounds
   */
  constructor(
    id,
    { gamesWon = 0, gamesLost = 0, totalGames = 0, matchesWon = 0, matchesLost = 0 } = {}
  ) {
    this.id = id;
    this.gamesWon = gamesWon;
    this.gamesLost = gamesLost;
    this.totalGames = totalGames;
    this.matchesWon = matchesWon;
    this.matchesLost = matchesLost;
  }
}
