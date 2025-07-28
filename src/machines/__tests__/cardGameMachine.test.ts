import { describe, it, expect, beforeEach, afterEach } from "vitest"
import { createActor } from "xstate"
import { cardGameMachine } from "../cardGameMachine"

describe("cardGameMachine", () => {
  let actor: ReturnType<typeof createActor>

  beforeEach(() => {
    actor = createActor(cardGameMachine)
    actor.start()
  })

  afterEach(() => {
    actor.stop()
  })

  it("starts in lobby state", () => {
    expect(actor.getSnapshot().value).toBe("lobby")
  })

  it("allows players to join in lobby", () => {
    actor.send({
      type: "PLAYER_JOIN",
      playerId: "player-1",
      playerName: "Alice",
    })

    const snapshot = actor.getSnapshot()
    expect(snapshot.context.players).toHaveLength(1)
    expect(snapshot.context.players[0].name).toBe("Alice")
    expect(snapshot.context.players[0].id).toBe("player-1")
  })

  it("prevents game start with less than 2 players", () => {
    actor.send({
      type: "PLAYER_JOIN",
      playerId: "player-1",
      playerName: "Alice",
    })

    actor.send({ type: "START_GAME" })

    expect(actor.getSnapshot().value).toBe("lobby")
  })

  it("allows game start with 2 or more players", () => {
    // Add two players
    actor.send({
      type: "PLAYER_JOIN",
      playerId: "player-1",
      playerName: "Alice",
    })
    actor.send({
      type: "PLAYER_JOIN",
      playerId: "player-2",
      playerName: "Bob",
    })

    actor.send({ type: "START_GAME" })

    expect(actor.getSnapshot().value).toBe("gameStarting")
  })

  it("transitions to playerTurn after game starting", async () => {
    // Add players and start game
    actor.send({
      type: "PLAYER_JOIN",
      playerId: "player-1",
      playerName: "Alice",
    })
    actor.send({
      type: "PLAYER_JOIN",
      playerId: "player-2",
      playerName: "Bob",
    })
    actor.send({ type: "START_GAME" })

    // Wait for automatic transition
    await new Promise<void>((resolve) => {
      setTimeout(() => {
        const snapshot = actor.getSnapshot()
        expect(snapshot.value).toBe("playerTurn")
        expect(snapshot.context.players[0].hand).toHaveLength(7)
        expect(snapshot.context.players[1].hand).toHaveLength(7)
        expect(snapshot.context.discardPile).toHaveLength(1)
        resolve()
      }, 1100) // Wait slightly longer than the 1000ms delay
    })
  })

  it("handles card selection", async () => {
    // Add players and start game
    actor.send({
      type: "PLAYER_JOIN",
      playerId: "player-1",
      playerName: "Alice",
    })
    actor.send({ type: "PLAYER_JOIN", playerId: "player-2", playerName: "Bob" })
    actor.send({ type: "START_GAME" })

    // Wait for game to start and transition to playerTurn
    await new Promise<void>((resolve) => {
      setTimeout(() => {
        const snapshot = actor.getSnapshot()
        expect(snapshot.value).toBe("playerTurn")

        const currentPlayer = snapshot.context.players[0]
        const cardToSelect = currentPlayer.hand[0]

        // Simulate card selection
        actor.send({
          type: "CARD_SELECTED",
          cardId: cardToSelect.id,
          playerId: currentPlayer.id,
        })

        const updatedSnapshot = actor.getSnapshot()
        expect(updatedSnapshot.context.selectedCards).toHaveLength(1)
        resolve()
      }, 1100) // Wait for gameStarting transition
    })
  })

  it("handles card deselection", async () => {
    // Add players and start game
    actor.send({
      type: "PLAYER_JOIN",
      playerId: "player-1",
      playerName: "Alice",
    })
    actor.send({ type: "PLAYER_JOIN", playerId: "player-2", playerName: "Bob" })
    actor.send({ type: "START_GAME" })

    // Wait for game to start and transition to playerTurn
    await new Promise<void>((resolve) => {
      setTimeout(() => {
        const snapshot = actor.getSnapshot()
        expect(snapshot.value).toBe("playerTurn")

        const currentPlayer = snapshot.context.players[0]
        const cardToSelect = currentPlayer.hand[0]

        // First select a card
        actor.send({
          type: "CARD_SELECTED",
          cardId: cardToSelect.id,
          playerId: currentPlayer.id,
        })

        // Verify card is selected
        let updatedSnapshot = actor.getSnapshot()
        expect(updatedSnapshot.context.selectedCards).toHaveLength(1)

        // Now deselect the card
        actor.send({
          type: "CARD_DESELECTED",
          cardId: cardToSelect.id,
          playerId: currentPlayer.id,
        })

        updatedSnapshot = actor.getSnapshot()
        expect(updatedSnapshot.context.selectedCards).toHaveLength(0)
        resolve()
      }, 1100) // Wait for gameStarting transition
    })
  })

  it("handles timer tick", async () => {
    // Add players and start game to get to playerTurn state
    actor.send({
      type: "PLAYER_JOIN",
      playerId: "player-1",
      playerName: "Alice",
    })
    actor.send({ type: "PLAYER_JOIN", playerId: "player-2", playerName: "Bob" })
    actor.send({ type: "START_GAME" })

    // Wait for game to start and transition to playerTurn
    await new Promise<void>((resolve) => {
      setTimeout(() => {
        const snapshot = actor.getSnapshot()
        expect(snapshot.value).toBe("playerTurn")

        // Now send timer tick
        actor.send({
          type: "TIMER_TICK",
          remainingTime: 120,
        })

        const updatedSnapshot = actor.getSnapshot()
        expect(updatedSnapshot.context.gameTimer).toBe(120)
        resolve()
      }, 1100) // Wait for gameStarting transition
    })
  })

  it("ends game when timer expires", async () => {
    // Add players and start game to get to playerTurn state
    actor.send({
      type: "PLAYER_JOIN",
      playerId: "player-1",
      playerName: "Alice",
    })
    actor.send({ type: "PLAYER_JOIN", playerId: "player-2", playerName: "Bob" })
    actor.send({ type: "START_GAME" })

    // Wait for game to start and transition to playerTurn
    await new Promise<void>((resolve) => {
      setTimeout(() => {
        const snapshot = actor.getSnapshot()
        expect(snapshot.value).toBe("playerTurn")

        // Send timer expiration
        actor.send({
          type: "TIMER_TICK",
          remainingTime: 0,
        })

        const updatedSnapshot = actor.getSnapshot()
        expect(updatedSnapshot.value).toBe("gameEnding")
        expect(updatedSnapshot.context.gameEndReason).toBe("timer_expired")
        resolve()
      }, 1100) // Wait for gameStarting transition
    })
  })

  it("handles manual game end", async () => {
    // Add players and start game to get to playerTurn state
    actor.send({
      type: "PLAYER_JOIN",
      playerId: "player-1",
      playerName: "Alice",
    })
    actor.send({ type: "PLAYER_JOIN", playerId: "player-2", playerName: "Bob" })
    actor.send({ type: "START_GAME" })

    // Wait for game to start and transition to playerTurn
    await new Promise<void>((resolve) => {
      setTimeout(() => {
        const snapshot = actor.getSnapshot()
        expect(snapshot.value).toBe("playerTurn")

        // End game manually
        actor.send({ type: "END_GAME" })

        const updatedSnapshot = actor.getSnapshot()
        expect(updatedSnapshot.value).toBe("gameEnding")
        expect(updatedSnapshot.context.gameEndReason).toBe("manual_end")
        resolve()
      }, 1100) // Wait for gameStarting transition
    })
  })

  it("transitions to gameOver after gameEnding", async () => {
    // Setup and end game
    actor.send({
      type: "PLAYER_JOIN",
      playerId: "player-1",
      playerName: "Alice",
    })
    actor.send({
      type: "PLAYER_JOIN",
      playerId: "player-2",
      playerName: "Bob",
    })
    actor.send({ type: "START_GAME" })
    actor.send({ type: "END_GAME" })

    // Wait for automatic transition
    await new Promise<void>((resolve) => {
      setTimeout(() => {
        const snapshot = actor.getSnapshot()
        expect(snapshot.value).toBe("gameOver")
        expect(snapshot.context.finalScores).toHaveLength(2)
        expect(snapshot.context.winner).toBeDefined()
        resolve()
      }, 2100) // Wait slightly longer than the 2000ms delay
    })
  })

  it("handles game restart", () => {
    // Get to gameOver state first
    actor.send({
      type: "PLAYER_JOIN",
      playerId: "player-1",
      playerName: "Alice",
    })
    actor.send({
      type: "PLAYER_JOIN",
      playerId: "player-2",
      playerName: "Bob",
    })
    actor.send({ type: "START_GAME" })
    actor.send({ type: "END_GAME" })

    // Wait for gameOver, then restart
    setTimeout(() => {
      actor.send({ type: "RESTART_GAME" })

      const snapshot = actor.getSnapshot()
      expect(snapshot.value).toBe("lobby")
      expect(snapshot.context.players).toHaveLength(0)
      expect(snapshot.context.gameTimer).toBe(180)
      expect(snapshot.context.selectedCards).toHaveLength(0)
      expect(snapshot.context.gameEndReason).toBeNull()
    }, 2100)
  })

  it("initializes context correctly", () => {
    // Create a fresh actor to test initial state
    const freshActor = createActor(cardGameMachine)
    freshActor.start()

    const snapshot = freshActor.getSnapshot()

    expect(snapshot.context.players).toEqual([])
    expect(snapshot.context.currentPlayerIndex).toBe(0)
    expect(snapshot.context.deck).toEqual([])
    expect(snapshot.context.discardPile).toEqual([])
    expect(snapshot.context.gameTimer).toBe(180)
    expect(snapshot.context.selectedCards).toEqual([])
    expect(snapshot.context.gameId).toBeDefined()
    expect(snapshot.context.roundStartTime).toBeNull()
    expect(snapshot.context.finalScores).toEqual([])
    expect(snapshot.context.winner).toBeNull()
    expect(snapshot.context.autoPlayNotifications).toEqual([])
    expect(snapshot.context.gameEndReason).toBeNull()

    freshActor.stop()
  })

  it("prevents invalid transitions", () => {
    // Try to send playerTurn events while in lobby
    actor.send({
      type: "CARD_SELECTED",
      cardId: "invalid",
      playerId: "invalid",
    })

    expect(actor.getSnapshot().value).toBe("lobby")
  })
})
