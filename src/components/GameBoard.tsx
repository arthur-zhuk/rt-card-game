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

import React, { useEffect, useMemo, useCallback } from "react"

import { useMachine } from "@xstate/react"
import { cardGameMachine } from "../machines/cardGameMachine"
import type { GameContext, Player } from "../types/game"
import { getValidCards } from "../utils/cardUtils"
import PlayerHand from "./PlayerHand"
import DiscardPile from "./DiscardPile"
import GameTimer from "./GameTimer"
import GameStatus from "./GameStatus"
import Lobby from "./Lobby"
import GameOver from "./GameOver"
import { RuleHelper } from "./RuleHelper"
import ActionIndicator from "./ActionIndicator"
import AutoPlayNotifications from "./AutoPlayNotifications"

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

const GameBoard: React.FC = () => {
  const [state, send] = useMachine(cardGameMachine)
  const { context } = state

  // Memoize expensive computations
  const currentPlayerNoValidMoves = useMemo(() => {
    return !currentPlayerHasValidMoves(context)
  }, [context])

  const noValidMoves = useMemo(() => {
    return !hasAnyValidMoves(context)
  }, [context])

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

  // Instant auto-play effect - immediately play single cards and skip no-move scenarios
  useEffect(() => {
    // Only run auto-play logic during player turns with no selected cards
    if (state.matches("playerTurn") && context.selectedCards.length === 0) {
      const currentPlayer = context.players[context.currentPlayerIndex]
      const topDiscardCard = context.discardPile[context.discardPile.length - 1]

      if (currentPlayer && topDiscardCard) {
        const validCards = getValidCards(currentPlayer.hand, topDiscardCard)

        // Instantly auto-play if only one valid card (no choice needed)
        if (validCards.length === 1) {
          // Use setTimeout with 0ms to avoid state update conflicts
          setTimeout(() => {
            send({
              type: "AUTO_PLAY",
              card: validCards[0],
              playerId: currentPlayer.id,
            })
          }, 0)
        }
        // Instantly auto-skip if no valid cards (no choice needed)
        else if (validCards.length === 0) {
          // Use setTimeout with 0ms to avoid state update conflicts
          setTimeout(() => {
            send({ type: "SKIP_TURN" })
          }, 0)
        }
        // Multiple valid cards = manual play required (no auto-play)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    // Only trigger when turn state changes, not on every context update
    state.value,
    context.currentPlayerIndex,
    context.selectedCards.length,
    context.players.length,
    context.discardPile.length,
  ])

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

  const handleCardSelect = useCallback(
    (cardId: string) => {
      const currentPlayer = context.players[context.currentPlayerIndex]
      if (!currentPlayer) return

      const isSelected = context.selectedCards.some(
        (card) => card.id === cardId
      )

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
    },
    [context.players, context.currentPlayerIndex, context.selectedCards, send]
  )

  const handlePlayCards = useCallback(() => {
    const currentPlayer = context.players[context.currentPlayerIndex]
    if (currentPlayer && context.selectedCards.length > 0) {
      send({
        type: "PLAY_CARDS",
        cards: context.selectedCards,
        playerId: currentPlayer.id,
      })
    }
  }, [context.players, context.currentPlayerIndex, context.selectedCards, send])

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
        gameEndReason={context.gameEndReason}
        onRestart={() => send({ type: "RESTART_GAME" })}
        onLeave={(playerId) => send({ type: "LEAVE_GAME", playerId })}
      />
    )
  }

  return (
    <div className="flex-1 flex flex-col w-full max-w-6xl mx-auto">
      <div className="flex justify-between items-center bg-white/95 px-6 py-4 rounded-xl mb-5 shadow-lg">
        <div className="flex items-center gap-6">
          <GameTimer timeRemaining={context.gameTimer} />

          <div className="flex flex-col items-center gap-2">
            <div className="px-4 py-2 rounded-lg font-bold text-sm bg-blue-100 text-blue-800 border-2 border-blue-200">
              Instant Auto-Play: ON
            </div>
            <div className="text-xs text-gray-600 text-center max-w-48">
              Single cards play instantly • Multiple cards require manual
              selection
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
        />
      </div>

      {/* Main Game Area */}
      <div className="flex-1 flex flex-col gap-6">
        {/* Discard Pile Section */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
          <div className="flex justify-center">
            <DiscardPile
              discardPile={context.discardPile}
              deckSize={context.deck.length}
            />
          </div>
        </div>

        {/* Rule Helper */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
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
        </div>

        {/* Players Section */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">👥</span>
            </div>
            <h3 className="text-white font-bold text-lg">Players</h3>
          </div>
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
        </div>

        {/* Play Button */}
        {state.matches("playerTurn") && context.selectedCards.length > 0 && (
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <div className="flex justify-center">
              <button
                onClick={handlePlayCards}
                className="bg-gradient-to-r from-green-500 to-emerald-600 text-white border-none px-8 py-4 rounded-xl text-lg font-bold cursor-pointer transition-all duration-200 hover:from-green-600 hover:to-emerald-700 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-green-500/30 flex items-center gap-3"
              >
                <span>🎯</span>
                Play Selected Cards
                <span className="text-sm opacity-80">(or press SPACE)</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Auto-play notifications - floating on top right */}
      <AutoPlayNotifications notifications={context.autoPlayNotifications} />
    </div>
  )
}

export default GameBoard
