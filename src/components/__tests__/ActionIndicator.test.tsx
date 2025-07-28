import { describe, it, expect } from "vitest"
import { render, screen } from "../../test/test-utils"
import ActionIndicator from "../ActionIndicator"
import {
  createMockGameContext,
  createMockPlayer,
  createCards,
} from "../../test/test-utils"

describe("ActionIndicator", () => {
  it("shows lobby message in lobby state", () => {
    const context = createMockGameContext({ players: [] })
    render(<ActionIndicator context={context} currentState="lobby" />)

    expect(screen.getByText(/Waiting for players to join/)).toBeInTheDocument()
  })

  it("shows game starting message", () => {
    const context = createMockGameContext()
    render(<ActionIndicator context={context} currentState="gameStarting" />)

    expect(
      screen.getByText(/Dealing cards and starting game/)
    ).toBeInTheDocument()
  })

  it("shows current player turn message", () => {
    const context = createMockGameContext({
      players: [
        createMockPlayer({
          id: "player-1",
          name: "Alice",
          isCurrentPlayer: true,
        }),
        createMockPlayer({
          id: "player-2",
          name: "Bob",
          isCurrentPlayer: false,
        }),
      ],
      currentPlayerIndex: 0,
    })

    render(<ActionIndicator context={context} currentState="playerTurn" />)

    expect(
      screen.getByText(/Auto-playing Alice's only valid card/)
    ).toBeInTheDocument()
  })

  it("shows auto-play message for single valid card", () => {
    const context = createMockGameContext({
      players: [
        createMockPlayer({
          id: "player-1",
          name: "Alice",
          hand: createCards(["7"]), // Only one card that matches discard
          isCurrentPlayer: true,
        }),
      ],
      discardPile: createCards(["6"]), // 7 can be played on 6
      selectedCards: [],
    })

    render(<ActionIndicator context={context} currentState="playerTurn" />)

    expect(
      screen.getByText(/Auto-playing Alice's only valid card/)
    ).toBeInTheDocument()
  })

  it("shows auto-skip message for no valid cards", () => {
    const context = createMockGameContext({
      players: [
        createMockPlayer({
          id: "player-1",
          name: "Alice",
          hand: createCards(["2", "3"]), // No cards match discard 7
          isCurrentPlayer: true,
        }),
      ],
      discardPile: createCards(["7"]),
      selectedCards: [],
    })

    render(<ActionIndicator context={context} currentState="playerTurn" />)

    expect(
      screen.getByText(/Alice has no valid moves - skipping turn/)
    ).toBeInTheDocument()
  })

  it("shows multiple cards message when player has multiple valid cards", () => {
    const context = createMockGameContext({
      players: [
        createMockPlayer({
          id: "player-1",
          name: "Alice",
          hand: createCards(["7", "8"]), // Both cards can be played on 7
          isCurrentPlayer: true,
        }),
      ],
      discardPile: createCards(["7"]),
      selectedCards: [],
    })

    render(<ActionIndicator context={context} currentState="playerTurn" />)

    expect(screen.getByText(/Alice has 2 valid cards/)).toBeInTheDocument()
  })

  it("shows card selection message when cards are selected", () => {
    const selectedCards = createCards(["7", "8"])
    const context = createMockGameContext({
      players: [
        createMockPlayer({
          id: "player-1",
          name: "Alice",
          hand: selectedCards,
          isCurrentPlayer: true,
        }),
      ],
      selectedCards,
    })

    render(<ActionIndicator context={context} currentState="playerTurn" />)

    expect(screen.getByText(/2 cards selected/)).toBeInTheDocument()
    expect(
      screen.getByText(/Press SPACE or click Play button/)
    ).toBeInTheDocument()
  })

  it("shows waiting for turn message", () => {
    const context = createMockGameContext()
    render(<ActionIndicator context={context} currentState="waitingForTurn" />)

    expect(
      screen.getByText(/Processing turn and updating game state/)
    ).toBeInTheDocument()
  })

  describe("game ending messages", () => {
    it("shows timer expired message", () => {
      const context = createMockGameContext({
        gameTimer: 0,
        gameEndReason: "timer_expired",
      })

      render(<ActionIndicator context={context} currentState="gameEnding" />)

      expect(
        screen.getByText(/Time's up! Game ended after 3 minutes/)
      ).toBeInTheDocument()
    })

    it("shows no valid moves message", () => {
      const context = createMockGameContext({
        gameEndReason: "no_valid_moves",
      })

      render(<ActionIndicator context={context} currentState="gameEnding" />)

      expect(
        screen.getByText(/No valid moves available for any player/)
      ).toBeInTheDocument()
    })

    it("shows manual end message", () => {
      const context = createMockGameContext({
        gameEndReason: "manual_end",
      })

      render(<ActionIndicator context={context} currentState="gameEnding" />)

      expect(
        screen.getByText(/Game manually ended by player/)
      ).toBeInTheDocument()
    })

    it("shows player won message", () => {
      const context = createMockGameContext({
        gameEndReason: "player_won",
      })

      render(<ActionIndicator context={context} currentState="gameEnding" />)

      expect(
        screen.getByText(/A player emptied their hand and won/)
      ).toBeInTheDocument()
    })

    it("shows default ending message for unknown reason", () => {
      const context = createMockGameContext({
        gameEndReason: null,
      })

      render(<ActionIndicator context={context} currentState="gameEnding" />)

      expect(
        screen.getByText(/Game ended. Calculating final scores/)
      ).toBeInTheDocument()
    })
  })

  it("shows game over message", () => {
    const context = createMockGameContext()
    render(<ActionIndicator context={context} currentState="gameOver" />)

    expect(
      screen.getByText(/Game completed! Check the results above/)
    ).toBeInTheDocument()
  })

  it("handles unknown state gracefully", () => {
    const context = createMockGameContext()
    render(<ActionIndicator context={context} currentState="unknownState" />)

    // Should render without crashing
    expect(screen.getByText(/Game state updating/)).toBeInTheDocument()
  })

  it("applies correct styling classes", () => {
    const context = createMockGameContext()
    const { container } = render(
      <ActionIndicator context={context} currentState="lobby" />
    )

    const indicator = container.firstChild as HTMLElement
    expect(indicator).toHaveClass(
      "flex",
      "items-center",
      "gap-3",
      "px-4",
      "py-3",
      "rounded-lg",
      "border-2"
    )
  })

  it("displays appropriate icons for different states", () => {
    const states = [
      { state: "lobby", expectedIcon: "👥" },
      { state: "gameStarting", expectedIcon: "🎴" },
      { state: "gameOver", expectedIcon: "🎉" },
    ]

    states.forEach(({ state, expectedIcon }) => {
      const context = createMockGameContext()
      const { unmount } = render(
        <ActionIndicator context={context} currentState={state} />
      )

      expect(screen.getByText(expectedIcon)).toBeInTheDocument()
      unmount()
    })
  })
})
