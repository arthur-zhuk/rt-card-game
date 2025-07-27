import React from "react"
import type { GameContext } from "../types/game"
import { getValidCards } from "../utils/cardUtils"

interface ActionIndicatorProps {
  context: GameContext
  currentState: string
}

const ActionIndicator: React.FC<ActionIndicatorProps> = ({
  context,
  currentState,
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
      // Show detailed message based on why the game ended
      const endReason = context.gameEndReason

      let message = "Calculating final scores..."
      let icon = "🏁"

      switch (endReason) {
        case "timer_expired":
          message =
            "⏰ Time's up! Game ended after 3 minutes. Calculating final scores..."
          icon = "⏰"
          break
        case "no_valid_moves":
          message =
            "🚫 No valid moves available for any player! Calculating final scores..."
          icon = "🚫"
          break
        case "manual_end":
          message =
            "🛑 Game manually ended by player. Calculating final scores..."
          icon = "🛑"
          break
        case "player_won":
          message =
            "🎉 A player emptied their hand and won! Calculating final scores..."
          icon = "🎉"
          break
        default:
          message = "🏁 Game ended. Calculating final scores..."
          icon = "🏁"
      }

      return {
        type: "ending",
        message,
        icon,
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

      // Single cards and no-move scenarios are handled instantly
      if (validCards.length === 1) {
        return {
          type: "auto-play",
          message: `Auto-playing ${currentPlayer.name}'s only valid card...`,
          icon: "🤖",
          color: "bg-orange-100 text-orange-800 border-orange-200",
        }
      }

      if (validCards.length === 0) {
        return {
          type: "auto-skip",
          message: `${currentPlayer.name} has no valid moves - skipping turn...`,
          icon: "⏭️",
          color: "bg-red-100 text-red-800 border-red-200",
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
