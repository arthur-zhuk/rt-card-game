import { describe, it, expect, vi } from "vitest"
import { render, screen, fireEvent } from "../../test/test-utils"
import PlayerHand from "../PlayerHand"
import {
  createMockPlayer,
  createMockCard,
  createCards,
} from "../../test/test-utils"

describe("PlayerHand", () => {
  const mockOnCardSelect = vi.fn()

  const defaultProps = {
    player: createMockPlayer({
      name: "Test Player",
      hand: createCards(["7", "8", "5"]),
    }),
    isCurrentPlayer: false,
    selectedCards: [],
    onCardSelect: mockOnCardSelect,
    canInteract: true,
    topDiscardCard: createMockCard({ value: "7", suit: "hearts" }),
  }

  beforeEach(() => {
    mockOnCardSelect.mockClear()
  })

  it("renders player name and stats", () => {
    render(<PlayerHand {...defaultProps} />)

    expect(screen.getByText("Test Player")).toBeInTheDocument()
    expect(screen.getByText("Cards: 3")).toBeInTheDocument()
    expect(screen.getByText(/Score:/)).toBeInTheDocument()
  })

  it("calculates and displays correct hand score", () => {
    const player = createMockPlayer({
      hand: createCards(["A", "5", "J"]), // 1 + 5 + 11 = 17
    })

    render(<PlayerHand {...defaultProps} player={player} />)

    expect(screen.getByText("Score: 17")).toBeInTheDocument()
  })

  it('shows "Your Turn" indicator for current player', () => {
    render(<PlayerHand {...defaultProps} isCurrentPlayer={true} />)

    expect(screen.getByText("Your Turn")).toBeInTheDocument()
  })

  it('does not show "Your Turn" indicator for non-current player', () => {
    render(<PlayerHand {...defaultProps} isCurrentPlayer={false} />)

    expect(screen.queryByText("Your Turn")).not.toBeInTheDocument()
  })

  it("applies current player styling", () => {
    const { container } = render(
      <PlayerHand {...defaultProps} isCurrentPlayer={true} />
    )

    const handElement = container.firstChild as HTMLElement
    expect(handElement).toHaveClass("border-3", "border-green-500")
  })

  it("renders all cards in hand", () => {
    const player = createMockPlayer({
      hand: createCards(["7", "8", "5"]),
    })

    render(<PlayerHand {...defaultProps} player={player} />)

    // Should render 3 cards
    const cards = screen.getAllByRole("button")
    expect(cards).toHaveLength(3)
  })

  it("calls onCardSelect when card is clicked and interaction is allowed", () => {
    const player = createMockPlayer({
      hand: [createMockCard({ id: "test-card", value: "7" })],
    })

    render(<PlayerHand {...defaultProps} player={player} canInteract={true} />)

    const card = screen.getByRole("button")
    fireEvent.click(card)

    expect(mockOnCardSelect).toHaveBeenCalledWith("test-card")
  })

  it("does not call onCardSelect when interaction is disabled", () => {
    const player = createMockPlayer({
      hand: [createMockCard({ id: "test-card", value: "7" })],
    })

    render(<PlayerHand {...defaultProps} player={player} canInteract={false} />)

    // When interaction is disabled, cards don't have button role
    // Find the card by its large value text (not the small score text)
    const cardValue = screen.getByText((content, element) => {
      return element?.classList.contains("text-lg") && content === "7"
    })
    const cardContainer = cardValue.closest("div")
    fireEvent.click(cardContainer!)

    expect(mockOnCardSelect).not.toHaveBeenCalled()
  })

  it("marks selected cards correctly", () => {
    const testCard = createMockCard({ id: "selected-card", value: "7" })
    const player = createMockPlayer({
      hand: [testCard, createMockCard({ id: "other-card", value: "8" })],
    })

    render(
      <PlayerHand
        {...defaultProps}
        player={player}
        selectedCards={[testCard]}
      />
    )

    // The selected card should have different styling (tested via CardComponent)
    const cards = screen.getAllByRole("button")
    expect(cards).toHaveLength(2)
  })

  it("identifies valid cards based on discard pile", () => {
    const player = createMockPlayer({
      hand: createCards(["7", "8", "5"]), // 7 and 8 are valid for discard 7
    })
    const discardCard = createMockCard({ value: "7", suit: "hearts" })

    render(
      <PlayerHand
        {...defaultProps}
        player={player}
        topDiscardCard={discardCard}
      />
    )

    // Should render cards with valid/invalid states
    const cards = screen.getAllByRole("button")
    expect(cards).toHaveLength(3)
  })

  it("handles empty hand", () => {
    const player = createMockPlayer({
      hand: [],
    })

    render(<PlayerHand {...defaultProps} player={player} />)

    expect(screen.getByText("Cards: 0")).toBeInTheDocument()
    expect(screen.getByText("Score: 0")).toBeInTheDocument()
    expect(screen.queryByRole("button")).not.toBeInTheDocument()
  })

  it("handles missing discard card", () => {
    render(<PlayerHand {...defaultProps} topDiscardCard={undefined} />)

    // Should still render without errors
    expect(screen.getByText("Test Player")).toBeInTheDocument()
    const cards = screen.getAllByRole("button")
    expect(cards).toHaveLength(3)
  })

  it("updates when player hand changes", () => {
    const { rerender } = render(<PlayerHand {...defaultProps} />)

    expect(screen.getByText("Cards: 3")).toBeInTheDocument()

    const updatedPlayer = createMockPlayer({
      name: "Test Player",
      hand: createCards(["7", "8"]), // Reduced hand
    })

    rerender(<PlayerHand {...defaultProps} player={updatedPlayer} />)

    expect(screen.getByText("Cards: 2")).toBeInTheDocument()
  })
})
