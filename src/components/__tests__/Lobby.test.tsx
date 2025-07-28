import { describe, it, expect, vi } from "vitest"
import { render, screen, fireEvent } from "../../test/test-utils"
import Lobby from "../Lobby"
import { createMockPlayer } from "../../test/test-utils"

describe("Lobby", () => {
  const mockOnPlayerJoin = vi.fn()
  const mockOnStartGame = vi.fn()

  const defaultProps = {
    players: [],
    onPlayerJoin: mockOnPlayerJoin,
    onStartGame: mockOnStartGame,
  }

  beforeEach(() => {
    mockOnPlayerJoin.mockClear()
    mockOnStartGame.mockClear()
  })

  it("renders lobby title and description", () => {
    render(<Lobby {...defaultProps} />)

    expect(screen.getByText("Game Lobby")).toBeInTheDocument()
    expect(
      screen.getByText(/Welcome to the Real-time Card Game/)
    ).toBeInTheDocument()
  })

  it("renders player input form", () => {
    render(<Lobby {...defaultProps} />)

    expect(screen.getByPlaceholderText("Enter player name")).toBeInTheDocument()
    expect(screen.getByText("Add Player")).toBeInTheDocument()
  })

  it("calls onPlayerJoin when form is submitted with valid name", () => {
    render(<Lobby {...defaultProps} />)

    const input = screen.getByPlaceholderText("Enter player name")
    const button = screen.getByText("Add Player")

    fireEvent.change(input, { target: { value: "Alice" } })
    fireEvent.click(button)

    expect(mockOnPlayerJoin).toHaveBeenCalledWith(
      expect.any(String), // playerId (UUID)
      "Alice"
    )
  })

  it("clears input after adding player", () => {
    render(<Lobby {...defaultProps} />)

    const input = screen.getByPlaceholderText(
      "Enter player name"
    ) as HTMLInputElement
    const button = screen.getByText("Add Player")

    fireEvent.change(input, { target: { value: "Alice" } })
    fireEvent.click(button)

    expect(input.value).toBe("")
  })

  it("does not call onPlayerJoin with empty name", () => {
    render(<Lobby {...defaultProps} />)

    const button = screen.getByText("Add Player")
    fireEvent.click(button)

    expect(mockOnPlayerJoin).not.toHaveBeenCalled()
  })

  it("trims whitespace from player names", () => {
    render(<Lobby {...defaultProps} />)

    const input = screen.getByPlaceholderText("Enter player name")
    const button = screen.getByText("Add Player")

    fireEvent.change(input, { target: { value: "  Alice  " } })
    fireEvent.click(button)

    expect(mockOnPlayerJoin).toHaveBeenCalledWith(expect.any(String), "Alice")
  })

  it("handles form submission via Enter key", () => {
    render(<Lobby {...defaultProps} />)

    const input = screen.getByPlaceholderText("Enter player name")

    fireEvent.change(input, { target: { value: "Alice" } })
    fireEvent.keyDown(input, { key: "Enter", code: "Enter" })

    expect(mockOnPlayerJoin).toHaveBeenCalledWith(expect.any(String), "Alice")
  })

  it("displays current players list", () => {
    const players = [
      createMockPlayer({ id: "player-1", name: "Alice" }),
      createMockPlayer({ id: "player-2", name: "Bob" }),
    ]

    render(<Lobby {...defaultProps} players={players} />)

    expect(screen.getByText("Current Players (2)")).toBeInTheDocument()
    expect(screen.getByText("Alice")).toBeInTheDocument()
    expect(screen.getByText("Bob")).toBeInTheDocument()
  })

  it("shows empty state when no players", () => {
    render(<Lobby {...defaultProps} />)

    expect(screen.getByText("Players (0/4)")).toBeInTheDocument()
    expect(screen.getByText("No players yet")).toBeInTheDocument()
  })

  it("does not show start game button with less than 2 players", () => {
    const players = [createMockPlayer({ name: "Alice" })]

    render(<Lobby {...defaultProps} players={players} />)

    expect(screen.queryByText("🎮 Start Game")).not.toBeInTheDocument()
    expect(
      screen.getByText("Minimum 2 players required to start")
    ).toBeInTheDocument()
  })

  it("shows start game button with 2 or more players", () => {
    const players = [
      createMockPlayer({ id: "player-1", name: "Alice" }),
      createMockPlayer({ id: "player-2", name: "Bob" }),
    ]

    render(<Lobby {...defaultProps} players={players} />)

    const startButton = screen.getByText("🎮 Start Game")
    expect(startButton).toBeInTheDocument()
    expect(startButton).not.toBeDisabled()
  })

  it("calls onStartGame when start button is clicked", () => {
    const players = [
      createMockPlayer({ id: "player-1", name: "Alice" }),
      createMockPlayer({ id: "player-2", name: "Bob" }),
    ]

    render(<Lobby {...defaultProps} players={players} />)

    const startButton = screen.getByText("🎮 Start Game")
    fireEvent.click(startButton)

    expect(mockOnStartGame).toHaveBeenCalledTimes(1)
  })

  it("shows minimum players requirement message", () => {
    render(<Lobby {...defaultProps} />)

    expect(
      screen.getByText(/Minimum 2 players required to start/)
    ).toBeInTheDocument()
  })

  it("displays game rules", () => {
    render(<Lobby {...defaultProps} />)

    expect(screen.getByText("Game Rules")).toBeInTheDocument()
    expect(
      screen.getByText(/Get the lowest total hand value/)
    ).toBeInTheDocument()
    expect(screen.getByText(/3 minutes per round/)).toBeInTheDocument()
  })

  it("shows scoring information", () => {
    render(<Lobby {...defaultProps} />)

    expect(screen.getByText(/Card Values/)).toBeInTheDocument()
    expect(
      screen.getByText(/Ace=1, 2-10=face value, J=11, Q=12, K=13/)
    ).toBeInTheDocument()
  })

  it("prevents duplicate player names", () => {
    const players = [createMockPlayer({ name: "Alice" })]

    render(<Lobby {...defaultProps} players={players} />)

    const input = screen.getByPlaceholderText("Enter your name...")
    const button = screen.getByText("Add Player")

    fireEvent.change(input, { target: { value: "Alice" } })
    fireEvent.click(button)

    // Should not call onPlayerJoin for duplicate name
    expect(mockOnPlayerJoin).not.toHaveBeenCalled()
  })

  it("handles very long player names", () => {
    render(<Lobby {...defaultProps} />)

    const input = screen.getByPlaceholderText("Enter your name...")
    const button = screen.getByText("Add Player")

    const longName = "A".repeat(100)
    fireEvent.change(input, { target: { value: longName } })
    fireEvent.click(button)

    // Should truncate or handle long names appropriately
    expect(mockOnPlayerJoin).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(String)
    )
  })

  it("shows player count correctly", () => {
    const players = [
      createMockPlayer({ name: "Alice" }),
      createMockPlayer({ name: "Bob" }),
      createMockPlayer({ name: "Charlie" }),
    ]

    render(<Lobby {...defaultProps} players={players} />)

    expect(screen.getByText("Players (3/4)")).toBeInTheDocument()
  })
})
