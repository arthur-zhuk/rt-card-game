/**
 * Real-time Card Game State Machine
 *
 * Implements a comprehensive state machine for managing a multiplayer card game
 * with turn-based play, timer management, and complex game state transitions.
 *
 * @author Frontend Engineering Challenge
 * @version 1.0.0
 */

import { createMachine, assign } from "xstate"
import type { GameContext, Player, PlayerScore, Card } from "../types/game"
import {
  createDeck,
  dealCards,
  getValidCards,
  calculateHandScore,
  canPlayCards,
} from "../utils/cardUtils"
import { v4 as uuidv4 } from "uuid"

// Helper function to check if any player has valid moves
const hasAnyValidMoves = (context: GameContext): boolean => {
  const topDiscardCard = context.discardPile[context.discardPile.length - 1]
  if (!topDiscardCard) return true

  return context.players.some(
    (player) => getValidCards(player.hand, topDiscardCard).length > 0
  )
}

const initialContext: GameContext = {
  players: [],
  currentPlayerIndex: 0,
  deck: [],
  discardPile: [],
  gameTimer: 180, // 3 minutes
  selectedCards: [],
  gameId: uuidv4(),
  roundStartTime: null,
  finalScores: [],
  winner: null,
  autoPlayNotifications: [],
}

export const cardGameMachine = createMachine({
  id: "cardGame",
  initial: "lobby",
  context: initialContext,
  states: {
    lobby: {
      on: {
        PLAYER_JOIN: {
          actions: assign({
            players: ({ context, event }) => [
              ...context.players,
              {
                id: event.playerId,
                name: event.playerName,
                hand: [],
                isCurrentPlayer: false,
              } as Player,
            ],
          }),
        },
        START_GAME: {
          target: "gameStarting",
          guard: ({ context }) => context.players.length >= 2,
        },
      },
    },
    gameStarting: {
      entry: assign({
        deck: () => createDeck(),
        roundStartTime: () => new Date(),
        gameTimer: () => 180,
      }),
      after: {
        1000: {
          target: "playerTurn",
          actions: assign(({ context }) => {
            const { playerHands, remainingDeck } = dealCards(
              context.deck,
              context.players.length
            )

            const updatedPlayers = context.players.map((player, index) => ({
              ...player,
              hand: playerHands[index],
              isCurrentPlayer: index === 0,
            }))

            // Place first card on discard pile
            const discardPile =
              remainingDeck.length > 0 ? [remainingDeck[0]] : []
            const finalDeck = remainingDeck.slice(1)

            return {
              players: updatedPlayers,
              deck: finalDeck,
              discardPile,
              currentPlayerIndex: 0,
            }
          }),
        },
      },
    },
    playerTurn: {
      entry: assign({
        selectedCards: () => [],
      }),
      on: {
        END_GAME: {
          target: "gameEnding",
        },
        SKIP_TURN: {
          target: "waitingForTurn",
          actions: assign(({ context }) => {
            const currentPlayer = context.players[context.currentPlayerIndex]

            // Add auto-skip notification
            const notification = {
              id: uuidv4(),
              playerId: currentPlayer.id,
              playerName: currentPlayer.name,
              card: null, // No card for skip
              timestamp: new Date(),
              type: "auto-skip" as const,
            }

            // Keep only the last 10 notifications to prevent memory bloat
            const updatedNotifications = [
              ...context.autoPlayNotifications,
              notification,
            ].slice(-10)

            return {
              autoPlayNotifications: updatedNotifications,
            }
          }),
        },
        CARD_SELECTED: {
          actions: assign({
            selectedCards: ({ context, event }) => {
              const card = context.players
                .find((p) => p.id === event.playerId)
                ?.hand.find((c) => c.id === event.cardId)

              if (
                card &&
                !context.selectedCards.find((c) => c.id === card.id)
              ) {
                return [...context.selectedCards, card]
              }
              return context.selectedCards
            },
          }),
          guard: ({ context, event }) => {
            const currentPlayer = context.players[context.currentPlayerIndex]
            return currentPlayer.id === event.playerId
          },
        },
        CARD_DESELECTED: {
          actions: assign({
            selectedCards: ({ context, event }) =>
              context.selectedCards.filter((card) => card.id !== event.cardId),
          }),
        },
        PLAY_CARDS: {
          target: "waitingForTurn",
          actions: assign(({ context, event }) => {
            const currentPlayer = context.players[context.currentPlayerIndex]
            const cardsToPlay = event.cards

            // Remove played cards from player's hand
            const updatedHand = currentPlayer.hand.filter(
              (card) =>
                !cardsToPlay.find(
                  (playedCard: Card) => playedCard.id === card.id
                )
            )

            // Update discard pile
            const newDiscardPile = [...context.discardPile, ...cardsToPlay]

            // Update players
            const updatedPlayers = context.players.map((player, index) => ({
              ...player,
              hand:
                index === context.currentPlayerIndex
                  ? updatedHand
                  : player.hand,
              isCurrentPlayer: false,
            }))

            return {
              players: updatedPlayers,
              discardPile: newDiscardPile,
              selectedCards: [],
            }
          }),
          guard: ({ context, event }) => {
            const currentPlayer = context.players[context.currentPlayerIndex]
            const topDiscardCard =
              context.discardPile[context.discardPile.length - 1]

            return (
              currentPlayer.id === event.playerId &&
              event.cards.length > 0 &&
              canPlayCards(event.cards, topDiscardCard)
            )
          },
        },
        AUTO_PLAY: {
          target: "waitingForTurn",
          actions: assign(({ context, event }) => {
            const currentPlayer = context.players[context.currentPlayerIndex]

            // Remove played card from player's hand
            const updatedHand = currentPlayer.hand.filter(
              (card) => card.id !== event.card.id
            )

            // Update discard pile
            const newDiscardPile = [...context.discardPile, event.card]

            // Update players
            const updatedPlayers = context.players.map((player, index) => ({
              ...player,
              hand:
                index === context.currentPlayerIndex
                  ? updatedHand
                  : player.hand,
              isCurrentPlayer: false,
            }))

            // Add auto-play notification
            const notification = {
              id: uuidv4(),
              playerId: currentPlayer.id,
              playerName: currentPlayer.name,
              card: event.card,
              timestamp: new Date(),
              type: "auto-play" as const,
            }

            // Keep only the last 10 notifications to prevent memory bloat
            const updatedNotifications = [
              ...context.autoPlayNotifications,
              notification,
            ].slice(-10)

            return {
              players: updatedPlayers,
              discardPile: newDiscardPile,
              selectedCards: [],
              autoPlayNotifications: updatedNotifications,
            }
          }),
          guard: ({ context, event }) => {
            const currentPlayer = context.players[context.currentPlayerIndex]
            const topDiscardCard =
              context.discardPile[context.discardPile.length - 1]

            return (
              currentPlayer.id === event.playerId &&
              canPlayCards([event.card], topDiscardCard)
            )
          },
        },
        TIMER_TICK: [
          {
            target: "gameEnding",
            guard: ({ event }) => event.remainingTime <= 0,
            actions: assign({
              gameTimer: ({ event }) => event.remainingTime,
            }),
          },
          {
            actions: assign({
              gameTimer: ({ event }) => event.remainingTime,
            }),
          },
        ],
      },
    },
    waitingForTurn: {
      entry: assign(({ context }) => {
        // Find the next player who has valid moves, or cycle through all players
        let nextPlayerIndex =
          (context.currentPlayerIndex + 1) % context.players.length
        let attempts = 0
        const maxAttempts = context.players.length

        const topDiscardCard =
          context.discardPile[context.discardPile.length - 1]

        // Keep advancing until we find a player with valid moves or exhaust all players
        while (attempts < maxAttempts && topDiscardCard) {
          const nextPlayer = context.players[nextPlayerIndex]
          const validCards = getValidCards(nextPlayer.hand, topDiscardCard)

          // If this player has valid moves, stop here
          if (validCards.length > 0) {
            break
          }

          // Otherwise, try the next player
          nextPlayerIndex = (nextPlayerIndex + 1) % context.players.length
          attempts++
        }

        const updatedPlayers = context.players.map((player, index) => ({
          ...player,
          isCurrentPlayer: index === nextPlayerIndex,
        }))

        return {
          players: updatedPlayers,
          currentPlayerIndex: nextPlayerIndex,
        }
      }),
      after: {
        500: [
          {
            target: "gameEnding",
            guard: ({ context }) => !hasAnyValidMoves(context),
          },
          {
            target: "playerTurn",
          },
        ],
      },
      on: {
        TIMER_TICK: [
          {
            target: "gameEnding",
            guard: ({ event }) => event.remainingTime <= 0,
            actions: assign({
              gameTimer: ({ event }) => event.remainingTime,
            }),
          },
          {
            actions: assign({
              gameTimer: ({ event }) => event.remainingTime,
            }),
          },
        ],
      },
    },
    gameEnding: {
      entry: assign(({ context }) => {
        const finalScores: PlayerScore[] = context.players.map((player) => ({
          playerId: player.id,
          playerName: player.name,
          finalScore: calculateHandScore(player.hand),
          handCards: player.hand,
        }))

        const winner = finalScores.reduce((lowest, current) =>
          current.finalScore < lowest.finalScore ? current : lowest
        )

        return {
          finalScores,
          winner,
        }
      }),
      after: {
        2000: "gameOver",
      },
    },
    gameOver: {
      on: {
        RESTART_GAME: {
          target: "lobby",
          actions: assign(() => ({
            ...initialContext,
            gameId: uuidv4(),
          })),
        },
        LEAVE_GAME: {
          actions: assign({
            players: ({ context, event }) =>
              context.players.filter((player) => player.id !== event.playerId),
          }),
        },
      },
    },
  },
})
