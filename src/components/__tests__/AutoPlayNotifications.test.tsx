import { describe, it, expect } from "vitest"
import { render, screen } from "../../test/test-utils"
import AutoPlayNotifications from "../AutoPlayNotifications"
import { createMockCard } from "../../test/test-utils"
import type { AutoPlayNotification } from "../../types/game"

describe("AutoPlayNotifications", () => {
  const createMockNotification = (
    overrides?: Partial<AutoPlayNotification>
  ): AutoPlayNotification => ({
    id: "notification-1",
    playerId: "player-1",
    playerName: "Alice",
    card: createMockCard({ value: "7", suit: "hearts" }),
    timestamp: new Date("2024-01-01T12:00:00Z"),
    type: "auto-play",
    ...overrides,
  })

  it("renders nothing when no notifications", () => {
    const { container } = render(<AutoPlayNotifications notifications={[]} />)

    expect(container.firstChild).toBeNull()
  })

  it("renders auto-play notification correctly", () => {
    const notification = createMockNotification({
      type: "auto-play",
      playerName: "Alice",
      card: createMockCard({ value: "7", suit: "hearts" }),
    })

    render(<AutoPlayNotifications notifications={[notification]} />)

    expect(screen.getByText("Auto-Played")).toBeInTheDocument()
    expect(screen.getByText("Alice")).toBeInTheDocument()
    expect(screen.getByText("played")).toBeInTheDocument()
    expect(screen.getByText("🤖")).toBeInTheDocument()
    // Check for the card value and suit in the bold span
    const cardText = screen.getByText((content, element) => {
      return !!(
        element?.classList.contains("font-bold") &&
        content.includes("7") &&
        content.includes("♥")
      )
    })
    expect(cardText).toBeInTheDocument()
  })

  it("renders auto-skip notification correctly", () => {
    const notification = createMockNotification({
      type: "auto-skip",
      playerName: "Bob",
      card: null,
    })

    render(<AutoPlayNotifications notifications={[notification]} />)

    expect(screen.getByText("Auto-Skipped")).toBeInTheDocument()
    expect(screen.getByText("Bob")).toBeInTheDocument()
    expect(screen.getByText("had no valid moves")).toBeInTheDocument()
    expect(screen.getByText("⏭️")).toBeInTheDocument()
  })

  it("displays correct suit symbols", () => {
    const suits = [
      { suit: "hearts", symbol: "♥" },
      { suit: "diamonds", symbol: "♦" },
      { suit: "clubs", symbol: "♣" },
      { suit: "spades", symbol: "♠" },
    ] as const

    suits.forEach(({ suit, symbol }) => {
      const notification = createMockNotification({
        card: createMockCard({ value: "7", suit }),
      })

      const { unmount } = render(
        <AutoPlayNotifications notifications={[notification]} />
      )
      expect(screen.getByText(new RegExp(`7${symbol}`))).toBeInTheDocument()
      unmount()
    })
  })

  it("formats timestamp correctly", () => {
    const notification = createMockNotification({
      timestamp: new Date("2024-01-01T15:30:45Z"),
    })

    render(<AutoPlayNotifications notifications={[notification]} />)

    // Should display time in HH:MM:SS format
    expect(screen.getByText(/\d{2}:\d{2}:\d{2}/)).toBeInTheDocument()
  })

  it("applies correct styling for auto-play notifications", () => {
    const notification = createMockNotification({ type: "auto-play" })
    const { container } = render(
      <AutoPlayNotifications notifications={[notification]} />
    )

    const notificationElement = container.querySelector(".bg-green-100")
    expect(notificationElement).toBeInTheDocument()
    expect(notificationElement).toHaveClass(
      "text-green-800",
      "border-green-200"
    )
  })

  it("applies correct styling for auto-skip notifications", () => {
    const notification = createMockNotification({ type: "auto-skip" })
    const { container } = render(
      <AutoPlayNotifications notifications={[notification]} />
    )

    const notificationElement = container.querySelector(".bg-orange-100")
    expect(notificationElement).toBeInTheDocument()
    expect(notificationElement).toHaveClass(
      "text-orange-800",
      "border-orange-200"
    )
  })

  it("renders multiple notifications", () => {
    const notifications = [
      createMockNotification({
        id: "1",
        playerName: "Alice",
        type: "auto-play",
      }),
      createMockNotification({ id: "2", playerName: "Bob", type: "auto-skip" }),
    ]

    render(<AutoPlayNotifications notifications={notifications} />)

    expect(screen.getByText("Alice")).toBeInTheDocument()
    expect(screen.getByText("played")).toBeInTheDocument()
    expect(screen.getByText("Bob")).toBeInTheDocument()
    expect(screen.getByText("had no valid moves")).toBeInTheDocument()
  })

  it("limits visible notifications to maxVisible prop", () => {
    const notifications = Array.from({ length: 10 }, (_, i) =>
      createMockNotification({
        id: `notification-${i}`,
        playerName: `Player ${i}`,
      })
    )

    render(
      <AutoPlayNotifications notifications={notifications} maxVisible={3} />
    )

    // Should only show the last 3 notifications (most recent)
    expect(screen.getByText(/Player 9/)).toBeInTheDocument()
    expect(screen.getByText(/Player 8/)).toBeInTheDocument()
    expect(screen.getByText(/Player 7/)).toBeInTheDocument()
    expect(screen.queryByText(/Player 6/)).not.toBeInTheDocument()
  })

  it("defaults to showing 5 notifications when maxVisible not specified", () => {
    const notifications = Array.from({ length: 10 }, (_, i) =>
      createMockNotification({
        id: `notification-${i}`,
        playerName: `Player ${i}`,
      })
    )

    render(<AutoPlayNotifications notifications={notifications} />)

    // Should show the last 5 notifications
    expect(screen.getByText(/Player 9/)).toBeInTheDocument()
    expect(screen.getByText(/Player 8/)).toBeInTheDocument()
    expect(screen.getByText(/Player 7/)).toBeInTheDocument()
    expect(screen.getByText(/Player 6/)).toBeInTheDocument()
    expect(screen.getByText(/Player 5/)).toBeInTheDocument()
    expect(screen.queryByText(/Player 4/)).not.toBeInTheDocument()
  })

  it("shows notifications in reverse chronological order (newest first)", () => {
    const notifications = [
      createMockNotification({
        id: "1",
        playerName: "Alice",
        timestamp: new Date("2024-01-01T12:00:00Z"),
      }),
      createMockNotification({
        id: "2",
        playerName: "Bob",
        timestamp: new Date("2024-01-01T12:01:00Z"),
      }),
    ]

    const { container } = render(
      <AutoPlayNotifications notifications={notifications} />
    )

    const notificationElements = container.querySelectorAll(
      '[class*="bg-green-100"], [class*="bg-orange-100"]'
    )
    expect(notificationElements).toHaveLength(2)

    // First notification should be Bob (newer)
    expect(notificationElements[0]).toHaveTextContent("Bob")
    // Second notification should be Alice (older)
    expect(notificationElements[1]).toHaveTextContent("Alice")
  })

  it("applies animation classes", () => {
    const notification = createMockNotification()
    const { container } = render(
      <AutoPlayNotifications notifications={[notification]} />
    )

    const notificationElement = container.querySelector(
      ".animate-slide-in-right"
    )
    expect(notificationElement).toBeInTheDocument()
  })

  it("positions notifications in top-right corner", () => {
    const notification = createMockNotification()
    const { container } = render(
      <AutoPlayNotifications notifications={[notification]} />
    )

    const containerElement = container.firstChild as HTMLElement
    expect(containerElement).toHaveClass("fixed", "top-4", "right-4", "z-50")
  })
})
