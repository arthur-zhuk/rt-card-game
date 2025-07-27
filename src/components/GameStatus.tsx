import React from "react"
import type { Player } from "../types/game"

interface GameStatusProps {
  currentState: string
  currentPlayer?: Player
  playersCount: number
  noValidMoves?: boolean
}

const GameStatus: React.FC<GameStatusProps> = ({
  currentState,
  currentPlayer,
  playersCount,
  noValidMoves = false,
}) => {
  const getStatusMessage = () => {
    if (
      noValidMoves &&
      (currentState === "playerTurn" || currentState === "waitingForTurn")
    ) {
      return "No valid moves remaining!"
    }

    switch (currentState) {
      case "lobby":
        return `Waiting for players (${playersCount}/4)`
      case "gameStarting":
        return "Game starting... Dealing cards"
      case "playerTurn":
        return currentPlayer ? `${currentPlayer.name}'s turn` : "Player turn"
      case "waitingForTurn":
        return "Processing turn..."
      case "gameEnding":
        return "Time's up! Calculating scores..."
      case "gameOver":
        return "Game Over"
      default:
        return "Unknown state"
    }
  }

  return (
    <div className="text-center">
      <div
        className={`text-lg font-bold mb-1 ${
          noValidMoves &&
          (currentState === "playerTurn" || currentState === "waitingForTurn")
            ? "text-red-600"
            : ""
        }`}
      >
        {getStatusMessage()}
      </div>
      <div className="text-sm opacity-80">
        <span>Players: {playersCount}</span>
      </div>
    </div>
  )
}

export default GameStatus
