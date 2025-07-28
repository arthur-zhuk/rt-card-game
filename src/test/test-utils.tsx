import type { ReactElement } from "react"
import { render, type RenderOptions } from "@testing-library/react"
import type { Card, Player, GameContext, CardValue } from "../types/game"
import { vi } from "vitest"

// Custom render function that includes providers if needed
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">
) => render(ui, { ...options })

export * from "@testing-library/react"
export { customRender as render }

// Test data factories
export const createMockCard = (overrides?: Partial<Card>): Card => {
  const card = {
    id: "test-card-1",
    value: "7" as CardValue,
    suit: "hearts" as const,
    ...overrides,
  }

  // Add points based on value
  const getCardPoints = (value: CardValue): number => {
    if (value === "A") return 1
    if (value === "J") return 11
    if (value === "Q") return 12
    if (value === "K") return 13
    return parseInt(value, 10)
  }

  return {
    ...card,
    points: card.points ?? getCardPoints(card.value),
  }
}

export const createMockPlayer = (overrides?: Partial<Player>): Player => ({
  id: "test-player-1",
  name: "Test Player",
  hand: [
    createMockCard({ id: "card-1", value: "7", suit: "hearts" }),
    createMockCard({ id: "card-2", value: "8", suit: "spades" }),
  ],
  isCurrentPlayer: false,
  ...overrides,
})

export const createMockGameContext = (
  overrides?: Partial<GameContext>
): GameContext => ({
  players: [
    createMockPlayer({
      id: "player-1",
      name: "Player 1",
      isCurrentPlayer: true,
    }),
    createMockPlayer({
      id: "player-2",
      name: "Player 2",
      isCurrentPlayer: false,
    }),
  ],
  currentPlayerIndex: 0,
  deck: [],
  discardPile: [createMockCard({ id: "discard-1", value: "6", suit: "clubs" })],
  gameTimer: 180,
  selectedCards: [],
  gameId: "test-game-123",
  roundStartTime: new Date("2024-01-01T00:00:00Z"),
  finalScores: [],
  winner: null,
  autoPlayNotifications: [],
  gameEndReason: null,
  ...overrides,
})

// Mock XState machine state
export const createMockMachineState = (
  value: string,
  context: GameContext
) => ({
  value,
  context,
  matches: vi.fn((state: string) => state === value),
  can: vi.fn(() => true),
  hasTag: vi.fn(() => false),
  toStrings: vi.fn(() => [value]),
})

// Helper to create cards with specific values
export const createCards = (values: CardValue[]): Card[] =>
  values.map((value, index) =>
    createMockCard({
      id: `card-${index}`,
      value,
      suit: ["hearts", "diamonds", "clubs", "spades"][
        index % 4
      ] as Card["suit"],
    })
  )

// Helper to wait for async operations
export const waitFor = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms))
