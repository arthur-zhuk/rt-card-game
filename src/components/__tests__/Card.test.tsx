import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, fireEvent } from "../../test/test-utils"
import CardComponent from "../Card"
import { createMockCard } from "../../test/test-utils"
import type { CardValue } from "../../types/game"

describe("CardComponent", () => {
  const mockOnClick = vi.fn()

  beforeEach(() => {
    mockOnClick.mockClear()
  })

  it("renders card value and suit", () => {
    const card = createMockCard({ value: "7", suit: "hearts" })
    render(<CardComponent card={card} />)

    // Check for value (appears twice - as value and points)
    const valueElements = screen.getAllByText("7")
    expect(valueElements.length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText("♥")).toBeInTheDocument()
  })

  it("displays correct suit symbols", () => {
    const suits = [
      { suit: "hearts", symbol: "♥" },
      { suit: "diamonds", symbol: "♦" },
      { suit: "clubs", symbol: "♣" },
      { suit: "spades", symbol: "♠" },
    ] as const

    suits.forEach(({ suit, symbol }) => {
      const card = createMockCard({ suit })
      const { unmount } = render(<CardComponent card={card} />)
      expect(screen.getByText(symbol)).toBeInTheDocument()
      unmount()
    })
  })

  it("applies red color for hearts and diamonds", () => {
    const heartCard = createMockCard({ suit: "hearts" })
    const { container, unmount } = render(<CardComponent card={heartCard} />)

    expect(container.firstChild).toHaveClass("text-red-600")
    unmount()

    const diamondCard = createMockCard({ suit: "diamonds" })
    const { container: container2 } = render(
      <CardComponent card={diamondCard} />
    )

    expect(container2.firstChild).toHaveClass("text-red-600")
  })

  it("applies black color for clubs and spades", () => {
    const clubCard = createMockCard({ suit: "clubs" })
    const { container, unmount } = render(<CardComponent card={clubCard} />)

    expect(container.firstChild).toHaveClass("text-gray-800")
    unmount()

    const spadeCard = createMockCard({ suit: "spades" })
    const { container: container2 } = render(<CardComponent card={spadeCard} />)

    expect(container2.firstChild).toHaveClass("text-gray-800")
  })

  it("applies selected styling when isSelected is true", () => {
    const card = createMockCard()
    const { container } = render(
      <CardComponent card={card} isSelected={true} />
    )

    expect(container.firstChild).toHaveClass("border-blue-500", "bg-blue-50")
  })

  it("applies valid styling when isValid is true and not selected", () => {
    const card = createMockCard()
    const { container } = render(<CardComponent card={card} isValid={true} />)

    expect(container.firstChild).toHaveClass("border-green-500", "bg-green-50")
  })

  it("prioritizes selected styling over valid styling", () => {
    const card = createMockCard()
    const { container } = render(
      <CardComponent card={card} isSelected={true} isValid={true} />
    )

    expect(container.firstChild).toHaveClass("border-blue-500", "bg-blue-50")
    expect(container.firstChild).not.toHaveClass(
      "border-green-500",
      "bg-green-50"
    )
  })

  it("adds interactive classes when canInteract is true", () => {
    const card = createMockCard()
    const { container } = render(
      <CardComponent card={card} canInteract={true} />
    )

    expect(container.firstChild).toHaveClass("cursor-pointer")
  })

  it("sets role and tabIndex when canInteract is true", () => {
    const card = createMockCard()
    render(<CardComponent card={card} canInteract={true} />)

    const cardElement = screen.getByRole("button")
    expect(cardElement).toHaveAttribute("tabIndex", "0")
  })

  it("does not set role and tabIndex when canInteract is false", () => {
    const card = createMockCard()
    const { container } = render(
      <CardComponent card={card} canInteract={false} />
    )

    expect(container.firstChild).not.toHaveAttribute("role")
    expect(container.firstChild).not.toHaveAttribute("tabIndex")
  })

  it("calls onClick when clicked and canInteract is true", () => {
    const card = createMockCard()
    render(
      <CardComponent card={card} canInteract={true} onClick={mockOnClick} />
    )

    const cardElement = screen.getByRole("button")
    fireEvent.click(cardElement)

    expect(mockOnClick).toHaveBeenCalledTimes(1)
  })

  it("does not call onClick when canInteract is false", () => {
    const card = createMockCard()
    const { container } = render(
      <CardComponent card={card} canInteract={false} onClick={mockOnClick} />
    )

    // When canInteract is false, onClick should not be attached
    const cardElement = container.firstChild as HTMLElement
    expect(cardElement).not.toHaveAttribute("role", "button")

    fireEvent.click(cardElement)

    expect(mockOnClick).not.toHaveBeenCalled()
  })

  describe("size variants", () => {
    const card = createMockCard()

    it("applies small size classes", () => {
      const { container } = render(<CardComponent card={card} size="small" />)
      expect(container.firstChild).toHaveClass("w-12", "h-16")
    })

    it("applies medium size classes (default)", () => {
      const { container } = render(<CardComponent card={card} size="medium" />)
      expect(container.firstChild).toHaveClass("w-15", "h-21")
    })

    it("applies large size classes", () => {
      const { container } = render(<CardComponent card={card} size="large" />)
      expect(container.firstChild).toHaveClass("w-20", "h-28")
    })

    it("defaults to medium size when no size specified", () => {
      const { container } = render(<CardComponent card={card} />)
      expect(container.firstChild).toHaveClass("w-15", "h-21")
    })
  })

  it("displays card points when available", () => {
    const card = createMockCard({ value: "7", points: 7 })
    render(<CardComponent card={card} />)

    // Should have both the value and points displayed
    const valueElements = screen.getAllByText("7")
    expect(valueElements.length).toBeGreaterThanOrEqual(2) // Value and points
  })

  it("handles face cards correctly", () => {
    const faceCards: CardValue[] = ["J", "Q", "K", "A"]

    faceCards.forEach((value) => {
      const card = createMockCard({ value })
      const { unmount } = render(<CardComponent card={card} />)
      expect(screen.getByText(value)).toBeInTheDocument()
      unmount()
    })
  })
})
