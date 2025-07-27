import React from "react"
import type { GameContext } from "../types/game"
import { getValidCards } from "../utils/cardUtils"

interface ActionIndicatorProps {
  context: GameContext
  currentState: string
  autoPlayEnabled: boolean
}

const ActionIndicator: React.FC<ActionIndicatorProps> = ({
  context,
  currentState,
  autoPlayEnabled,
}) => {
  const getCurrentAction = () => {
    if (currentState === "lobby") {
      return {
        type: "waiting",
        message: "Waiting for players to join",
        icon: "👥",
        color: "bg-blue-100 text-blue-800 border-blue-200",
      }
    }

    if (currentState === "gameStarting") {
      return {
        type: "starting",
        message: "Dealing cards and starting game...",
        icon: "🎴",
        color: "bg-green-100 text-green-800 border-green-200",
      }
    }

    if (currentState === "waitingForTurn") {
      return {
        type: "processing",
        message: "Processing turn and updating game state...",
        icon: "⚙️",
        color: "bg-yellow-100 text-yellow-800 border-yellow-200",
      }
    }

    if (currentState === "gameEnding") {
      // Check if game ended due to time or no valid moves
      const endedDueToTime = context.gameTimer <= 0
      return {
        type: "ending",
        message: endedDueToTime
          ? "Time's up! Calculating final scores..."
          : "No more valid moves! Calculating final scores...",
        icon: endedDueToTime ? "⏰" : "🏁",
        color: "bg-purple-100 text-purple-800 border-purple-200",
      }
    }

    if (currentState === "gameOver") {
      return {
        type: "finished",
        message: "Game completed! Check the results above.",
        icon: "🎉",
        color: "bg-green-100 text-green-800 border-green-200",
      }
    }

    if (currentState === "playerTurn") {
      const currentPlayer = context.players[context.currentPlayerIndex]
      const topDiscardCard = context.discardPile[context.discardPile.length - 1]

      if (!currentPlayer || !topDiscardCard) {
        return {
          type: "waiting",
          message: "Preparing game state...",
          icon: "⏳",
          color: "bg-gray-100 text-gray-800 border-gray-200",
        }
      }

      const validCards = getValidCards(currentPlayer.hand, topDiscardCard)
      const hasSelectedCards = context.selectedCards.length > 0

      // Player has selected cards
      if (hasSelectedCards) {
        return {
          type: "selection",
          message: `${context.selectedCards.length} card${
            context.selectedCards.length > 1 ? "s" : ""
          } selected - Press SPACE or click Play button`,
          icon: "🎯",
          color: "bg-blue-100 text-blue-800 border-blue-200",
        }
      }

      // Auto-play scenarios (only when auto-play is enabled)
      if (autoPlayEnabled) {
        if (validCards.length === 1) {
          return {
            type: "auto-play",
            message: `Auto-playing ${currentPlayer.name}'s only valid card in 3 seconds...`,
            icon: "🤖",
            color: "bg-orange-100 text-orange-800 border-orange-200",
          }
        }

        if (validCards.length === 0) {
          return {
            type: "auto-skip",
            message: `${currentPlayer.name} has no valid moves - skipping turn in 4 seconds...`,
            icon: "⏭️",
            color: "bg-red-100 text-red-800 border-red-200",
          }
        }
      }

      // Manual play scenarios
      if (validCards.length === 0) {
        return {
          type: "no-moves",
          message: `${currentPlayer.name} has no valid moves - waiting for manual action`,
          icon: "🚫",
          color: "bg-red-100 text-red-800 border-red-200",
        }
      }

      if (validCards.length === 1) {
        return {
          type: "single-card",
          message: autoPlayEnabled
            ? `${currentPlayer.name} has 1 valid card - will auto-play soon`
            : `${currentPlayer.name} has 1 valid card - click to play or enable auto-play`,
          icon: "🎴",
          color: "bg-green-100 text-green-800 border-green-200",
        }
      }

      // Multiple valid cards
      return {
        type: "multiple-cards",
        message: `${currentPlayer.name} has ${validCards.length} valid cards - click to select and play`,
        icon: "🃏",
        color: "bg-indigo-100 text-indigo-800 border-indigo-200",
      }
    }

    return {
      type: "unknown",
      message: "Game state updating...",
      icon: "❓",
      color: "bg-gray-100 text-gray-800 border-gray-200",
    }
  }

  const action = getCurrentAction()

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-lg border-2 ${action.color} transition-all duration-300`}
    >
      <div className="text-2xl" role="img" aria-label={action.type}>
        {action.icon}
      </div>
      <div className="flex-1">
        <div className="font-semibold text-sm uppercase tracking-wide opacity-75">
          {action.type.replace("-", " ")}
        </div>
        <div className="font-medium">{action.message}</div>
      </div>
      {(action.type === "auto-play" || action.type === "auto-skip") && (
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-current rounded-full animate-pulse"></div>
          <div
            className="w-2 h-2 bg-current rounded-full animate-pulse"
            style={{ animationDelay: "0.2s" }}
          ></div>
          <div
            className="w-2 h-2 bg-current rounded-full animate-pulse"
            style={{ animationDelay: "0.4s" }}
          ></div>
        </div>
      )}
    </div>
  )
}

export default ActionIndicator
