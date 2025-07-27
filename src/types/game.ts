export type Suit = "hearts" | "diamonds" | "clubs" | "spades"
export type CardValue =
  | "A"
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"
  | "9"
  | "10"
  | "J"
  | "Q"
  | "K"

export interface Card {
  id: string
  suit: Suit
  value: CardValue
  points: number
}

export interface Player {
  id: string
  name: string
  hand: Card[]
  isCurrentPlayer: boolean
}

export interface PlayerScore {
  playerId: string
  playerName: string
  finalScore: number
  handCards: Card[]
}

export interface AutoPlayNotification {
  id: string
  playerId: string
  playerName: string
  card: Card | null // null for auto-skip
  timestamp: Date
  type: "auto-play" | "auto-skip"
}

export type GameEndReason =
  | "timer_expired"
  | "no_valid_moves"
  | "manual_end"
  | "player_won"
  | null

export interface GameContext {
  players: Player[]
  currentPlayerIndex: number
  deck: Card[]
  discardPile: Card[]
  gameTimer: number // seconds remaining
  selectedCards: Card[]
  gameId: string
  roundStartTime: Date | null
  finalScores: PlayerScore[]
  winner: PlayerScore | null
  autoPlayNotifications: AutoPlayNotification[]
  gameEndReason: GameEndReason
}

export type GameEvent =
  | { type: "PLAYER_JOIN"; playerId: string; playerName: string }
  | { type: "START_GAME" }
  | { type: "CARDS_DEALT" }
  | { type: "CARD_SELECTED"; cardId: string; playerId: string }
  | { type: "CARD_DESELECTED"; cardId: string; playerId: string }
  | { type: "PLAY_CARDS"; cards: Card[]; playerId: string }
  | { type: "AUTO_PLAY"; card: Card; playerId: string }
  | { type: "TURN_COMPLETED"; nextPlayerId: string }
  | { type: "TIMER_TICK"; remainingTime: number }
  | { type: "END_GAME" }
  | { type: "SCORES_CALCULATED"; finalScores: PlayerScore[] }
  | { type: "RESTART_GAME" }
  | { type: "LEAVE_GAME"; playerId: string }

export type GameState =
  | "lobby"
  | "gameStarting"
  | "playerTurn"
  | "waitingForTurn"
  | "gameEnding"
  | "gameOver"
