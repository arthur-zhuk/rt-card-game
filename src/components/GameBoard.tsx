/**
 * GameBoard Component
 *
 * Main game interface that orchestrates the entire card game experience.
 * Manages state machine interactions, player turns, card selection, and game flow.
 *
 * Features:
 * - Real-time game state management with XState
 * - Turn-based player interactions
 * - Card selection and batch playing
 * - Timer management and game ending
 * - Skip turn functionality
 * - Auto-play for single valid cards
 *
 * @component
 */

import React, { useEffect } from "react"

import { useMachine } from "@xstate/react"
import { cardGameMachine } from "../machines/cardGameMachine"
import type { GameContext, Player } from "../types/game"
import { getValidCards } from "../utils/cardUtils"

// Helper function to check if current player has valid moves
const currentPlayerHasValidMoves = (context: GameContext): boolean => {
  const topDiscardCard = context.discardPile[context.discardPile.length - 1]
  if (!topDiscardCard) return true

  const currentPlayer = context.players[context.currentPlayerIndex]
  if (!currentPlayer) return true

  return getValidCards(currentPlayer.hand, topDiscardCard).length > 0
}

// Helper function to check if any player has valid moves (for automatic game ending)
const hasAnyValidMoves = (context: GameContext): boolean => {
  const topDiscardCard = context.discardPile[context.discardPile.length - 1]
  if (!topDiscardCard) return true

  return context.players.some(
    (player: Player) => getValidCards(player.hand, topDiscardCard).length > 0
  )
}

// Import components
import PlayerHand from "./PlayerHand"
import DiscardPile from "./DiscardPile"
import GameTimer from "./GameTimer"
import GameStatus from "./GameStatus"
import Lobby from "./Lobby"
import GameOver from "./GameOver"
import { RuleHelper } from "./RuleHelper"
import ActionIndicator from "./ActionIndicator"

const GameBoard: React.FC = () => {
  const [state, send] = useMachine(cardGameMachine)
  const { context } = state
  const [autoPlayEnabled, setAutoPlayEnabled] = React.useState(false)

  // Timer effect
  useEffect(() => {
    if (state.matches("playerTurn") || state.matches("waitingForTurn")) {
      const interval = setInterval(() => {
        const newTime = Math.max(0, context.gameTimer - 1)
        send({ type: "TIMER_TICK", remainingTime: newTime })
      }, 1000)

      return () => clearInterval(interval)
    }
  }, [state, context.gameTimer, send])

  // Auto-play effect (only when enabled)
  useEffect(() => {
    if (state.matches("playerTurn") && autoPlayEnabled) {
      const currentPlayer = context.players[context.currentPlayerIndex]
      const topDiscardCard = context.discardPile[context.discardPile.length - 1]

      if (currentPlayer && topDiscardCard) {
        const validCards = getValidCards(currentPlayer.hand, topDiscardCard)

        // Auto-play if only one valid card (reasonable timing for human play)
        if (validCards.length === 1 && context.selectedCards.length === 0) {
          setTimeout(() => {
            send({
              type: "AUTO_PLAY",
              card: validCards[0],
              playerId: currentPlayer.id,
            })
          }, 3000) // 3 seconds - enough time to see the situation but not too slow
        }
        // Auto-advance if no valid cards (reasonable timing for human play)
        else if (validCards.length === 0) {
          setTimeout(() => {
            send({ type: "SKIP_TURN" })
          }, 4000) // 4 seconds - time to verify no valid moves without being tedious
        }
      }
    }
  }, [state, context, send, autoPlayEnabled])

  // Keyboard event handler for SPACE key
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.code === "Space" && state.matches("playerTurn")) {
        event.preventDefault()
        const currentPlayer = context.players[context.currentPlayerIndex]

        if (currentPlayer && context.selectedCards.length > 0) {
          send({
            type: "PLAY_CARDS",
            cards: context.selectedCards,
            playerId: currentPlayer.id,
          })
        }
      }
    }

    window.addEventListener("keydown", handleKeyPress)
    return () => window.removeEventListener("keydown", handleKeyPress)
  }, [state, context, send])

  const handleCardSelect = (cardId: string) => {
    const currentPlayer = context.players[context.currentPlayerIndex]
    if (!currentPlayer) return

    const isSelected = context.selectedCards.some((card) => card.id === cardId)

    if (isSelected) {
      send({
        type: "CARD_DESELECTED",
        cardId,
        playerId: currentPlayer.id,
      })
    } else {
      send({
        type: "CARD_SELECTED",
        cardId,
        playerId: currentPlayer.id,
      })
    }
  }

  const handlePlayCards = () => {
    const currentPlayer = context.players[context.currentPlayerIndex]
    if (currentPlayer && context.selectedCards.length > 0) {
      send({
        type: "PLAY_CARDS",
        cards: context.selectedCards,
        playerId: currentPlayer.id,
      })
    }
  }

  if (state.matches("lobby")) {
    return (
      <Lobby
        players={context.players}
        onPlayerJoin={(playerId, playerName) =>
          send({ type: "PLAYER_JOIN", playerId, playerName })
        }
        onStartGame={() => send({ type: "START_GAME" })}
      />
    )
  }

  if (state.matches("gameOver")) {
    return (
      <GameOver
        finalScores={context.finalScores}
        winner={context.winner}
        onRestart={() => send({ type: "RESTART_GAME" })}
        onLeave={(playerId) => send({ type: "LEAVE_GAME", playerId })}
      />
    )
  }

  // Check if current player has no valid moves (for UI button)
  const currentPlayerNoValidMoves = !currentPlayerHasValidMoves(context)
  // Check if no valid moves are available for any player (for automatic game ending)
  const noValidMoves = !hasAnyValidMoves(context)

  return (
    <div className="flex-1 flex flex-col p-5 max-w-7xl mx-auto w-full">
      <div className="flex justify-between items-center bg-white/95 px-6 py-4 rounded-xl mb-5 shadow-lg">
        <div className="flex items-center gap-6">
          <GameTimer timeRemaining={context.gameTimer} />

          <div className="flex flex-col items-center gap-2">
            <button
              onClick={() => setAutoPlayEnabled(!autoPlayEnabled)}
              className={`px-4 py-2 rounded-lg font-bold text-sm transition-all duration-200 ${
                autoPlayEnabled
                  ? "bg-green-500 text-white hover:bg-green-600"
                  : "bg-gray-300 text-gray-700 hover:bg-gray-400"
              }`}
            >
              Auto-Play: {autoPlayEnabled ? "ON" : "OFF"}
            </button>
            <div className="text-xs text-gray-600 text-center max-w-40">
              {autoPlayEnabled
                ? "Game will auto-play single cards and skip turns"
                : "Manual play - you control all moves"}
            </div>
          </div>
        </div>

        <GameStatus
          currentState={state.value as string}
          currentPlayer={context.players[context.currentPlayerIndex]}
          playersCount={context.players.length}
          noValidMoves={currentPlayerNoValidMoves}
        />

        {noValidMoves && state.matches("playerTurn") && (
          <button
            onClick={() => send({ type: "END_GAME" })}
            className="bg-red-500 text-white border-none px-6 py-3 rounded-lg text-base font-bold cursor-pointer transition-all duration-200 hover:bg-red-600 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-red-500/30"
          >
            End Game
          </button>
        )}
      </div>

      {/* Action Indicator - Always visible to show what's happening */}
      <div className="mb-5">
        <ActionIndicator
          context={context}
          currentState={state.value as string}
          autoPlayEnabled={autoPlayEnabled}
        />
      </div>

      <div className="flex-1 flex flex-col gap-5">
        <div className="flex justify-center my-5">
          <DiscardPile
            discardPile={context.discardPile}
            deckSize={context.deck.length}
          />
        </div>

        <RuleHelper
          topDiscardCard={
            context.discardPile[context.discardPile.length - 1] || null
          }
          validCards={getValidCards(
            context.players[context.currentPlayerIndex]?.hand || [],
            context.discardPile[context.discardPile.length - 1]
          )}
          selectedCards={context.selectedCards}
          isVisible={state.matches("playerTurn")}
        />

        <div className="flex flex-col gap-4">
          {context.players.map((player, index) => (
            <PlayerHand
              key={player.id}
              player={player}
              isCurrentPlayer={index === context.currentPlayerIndex}
              selectedCards={context.selectedCards}
              onCardSelect={handleCardSelect}
              canInteract={
                state.matches("playerTurn") &&
                index === context.currentPlayerIndex
              }
              topDiscardCard={
                context.discardPile[context.discardPile.length - 1]
              }
            />
          ))}
        </div>

        {state.matches("playerTurn") && context.selectedCards.length > 0 && (
          <div className="flex justify-center mt-5">
            <button
              onClick={handlePlayCards}
              className="bg-green-500 text-white border-none px-6 py-3 rounded-lg text-base font-bold cursor-pointer transition-all duration-200 hover:bg-green-600 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-green-500/30"
            >
              Play Selected Cards (or press SPACE)
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default GameBoard
