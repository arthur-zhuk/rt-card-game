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
import PlayerHand from "./PlayerHand"
import DiscardPile from "./DiscardPile"
import GameTimer from "./GameTimer"
import GameStatus from "./GameStatus"
import Lobby from "./Lobby"
import GameOver from "./GameOver"
import { RuleHelper } from "./RuleHelper"

const GameBoard: React.FC = () => {
  const [state, send] = useMachine(cardGameMachine)
  const { context } = state

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

  // Auto-play effect
  useEffect(() => {
    if (state.matches("playerTurn")) {
      const currentPlayer = context.players[context.currentPlayerIndex]
      const topDiscardCard = context.discardPile[context.discardPile.length - 1]

      if (currentPlayer && topDiscardCard) {
        const validCards = getValidCards(currentPlayer.hand, topDiscardCard)

        // Auto-play if only one valid card
        if (validCards.length === 1 && context.selectedCards.length === 0) {
          setTimeout(() => {
            send({
              type: "AUTO_PLAY",
              card: validCards[0],
              playerId: currentPlayer.id,
            })
          }, 1000)
        }
      }
    }
  }, [state, context, send])

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
        <GameTimer timeRemaining={context.gameTimer} />
        <GameStatus
          currentState={state.value as string}
          currentPlayer={context.players[context.currentPlayerIndex]}
          playersCount={context.players.length}
          noValidMoves={currentPlayerNoValidMoves}
        />
        {currentPlayerNoValidMoves &&
          (state.matches("playerTurn") || state.matches("waitingForTurn")) && (
            <button
              onClick={() =>
                send({ type: noValidMoves ? "END_GAME" : "SKIP_TURN" })
              }
              className="bg-red-500 text-white border-none px-6 py-3 rounded-lg text-base font-bold cursor-pointer transition-all duration-200 hover:bg-red-600 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-red-500/30"
            >
              {noValidMoves ? "End Game" : "Skip Turn"}
            </button>
          )}
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
