import { describe, it, expect, beforeEach } from 'vitest'
import { createActor } from 'xstate'
import { cardGameMachine } from '../cardGameMachine'
import { createCards } from '../../test/test-utils'

describe('cardGameMachine', () => {
  let actor: ReturnType<typeof createActor>

  beforeEach(() => {
    actor = createActor(cardGameMachine)
    actor.start()
  })

  afterEach(() => {
    actor.stop()
  })

  it('starts in lobby state', () => {
    expect(actor.getSnapshot().value).toBe('lobby')
  })

  it('allows players to join in lobby', () => {
    actor.send({
      type: 'PLAYER_JOIN',
      playerId: 'player-1',
      playerName: 'Alice',
    })

    const snapshot = actor.getSnapshot()
    expect(snapshot.context.players).toHaveLength(1)
    expect(snapshot.context.players[0].name).toBe('Alice')
    expect(snapshot.context.players[0].id).toBe('player-1')
  })

  it('prevents game start with less than 2 players', () => {
    actor.send({
      type: 'PLAYER_JOIN',
      playerId: 'player-1',
      playerName: 'Alice',
    })

    actor.send({ type: 'START_GAME' })

    expect(actor.getSnapshot().value).toBe('lobby')
  })

  it('allows game start with 2 or more players', () => {
    // Add two players
    actor.send({
      type: 'PLAYER_JOIN',
      playerId: 'player-1',
      playerName: 'Alice',
    })
    actor.send({
      type: 'PLAYER_JOIN',
      playerId: 'player-2',
      playerName: 'Bob',
    })

    actor.send({ type: 'START_GAME' })

    expect(actor.getSnapshot().value).toBe('gameStarting')
  })

  it('transitions to playerTurn after game starting', (done) => {
    // Add players and start game
    actor.send({
      type: 'PLAYER_JOIN',
      playerId: 'player-1',
      playerName: 'Alice',
    })
    actor.send({
      type: 'PLAYER_JOIN',
      playerId: 'player-2',
      playerName: 'Bob',
    })
    actor.send({ type: 'START_GAME' })

    // Wait for automatic transition
    setTimeout(() => {
      const snapshot = actor.getSnapshot()
      expect(snapshot.value).toBe('playerTurn')
      expect(snapshot.context.players[0].hand).toHaveLength(7)
      expect(snapshot.context.players[1].hand).toHaveLength(7)
      expect(snapshot.context.discardPile).toHaveLength(1)
      done()
    }, 1100) // Wait slightly longer than the 1000ms delay
  })

  it('handles card selection', () => {
    // Setup game state manually for testing
    const testSnapshot = actor.getSnapshot()
    testSnapshot.context.players = [
      {
        id: 'player-1',
        name: 'Alice',
        hand: createCards(['7', '8']),
        isCurrentPlayer: true,
      },
      {
        id: 'player-2',
        name: 'Bob',
        hand: createCards(['9', '10']),
        isCurrentPlayer: false,
      },
    ]
    testSnapshot.context.currentPlayerIndex = 0
    testSnapshot.context.discardPile = createCards(['6'])

    // Force state to playerTurn
    actor.send({ type: 'START_GAME' })
    
    // Simulate card selection
    actor.send({
      type: 'CARD_SELECTED',
      cardId: testSnapshot.context.players[0].hand[0].id,
      playerId: 'player-1',
    })

    const snapshot = actor.getSnapshot()
    expect(snapshot.context.selectedCards).toHaveLength(1)
  })

  it('handles card deselection', () => {
    // Setup similar to card selection test
    const testSnapshot = actor.getSnapshot()
    testSnapshot.context.players = [
      {
        id: 'player-1',
        name: 'Alice',
        hand: createCards(['7', '8']),
        isCurrentPlayer: true,
      },
    ]
    testSnapshot.context.selectedCards = [testSnapshot.context.players[0].hand[0]]

    actor.send({
      type: 'CARD_DESELECTED',
      cardId: testSnapshot.context.players[0].hand[0].id,
      playerId: 'player-1',
    })

    const snapshot = actor.getSnapshot()
    expect(snapshot.context.selectedCards).toHaveLength(0)
  })

  it('handles timer tick', () => {
    actor.send({
      type: 'TIMER_TICK',
      remainingTime: 120,
    })

    const snapshot = actor.getSnapshot()
    expect(snapshot.context.gameTimer).toBe(120)
  })

  it('ends game when timer expires', () => {
    // Force to playerTurn state first
    actor.send({
      type: 'PLAYER_JOIN',
      playerId: 'player-1',
      playerName: 'Alice',
    })
    actor.send({
      type: 'PLAYER_JOIN',
      playerId: 'player-2',
      playerName: 'Bob',
    })
    actor.send({ type: 'START_GAME' })

    // Send timer expiration
    actor.send({
      type: 'TIMER_TICK',
      remainingTime: 0,
    })

    const snapshot = actor.getSnapshot()
    expect(snapshot.value).toBe('gameEnding')
    expect(snapshot.context.gameEndReason).toBe('timer_expired')
  })

  it('handles manual game end', () => {
    // Setup game in progress
    actor.send({
      type: 'PLAYER_JOIN',
      playerId: 'player-1',
      playerName: 'Alice',
    })
    actor.send({
      type: 'PLAYER_JOIN',
      playerId: 'player-2',
      playerName: 'Bob',
    })
    actor.send({ type: 'START_GAME' })

    actor.send({ type: 'END_GAME' })

    const snapshot = actor.getSnapshot()
    expect(snapshot.value).toBe('gameEnding')
    expect(snapshot.context.gameEndReason).toBe('manual_end')
  })

  it('transitions to gameOver after gameEnding', (done) => {
    // Setup and end game
    actor.send({
      type: 'PLAYER_JOIN',
      playerId: 'player-1',
      playerName: 'Alice',
    })
    actor.send({
      type: 'PLAYER_JOIN',
      playerId: 'player-2',
      playerName: 'Bob',
    })
    actor.send({ type: 'START_GAME' })
    actor.send({ type: 'END_GAME' })

    // Wait for automatic transition
    setTimeout(() => {
      const snapshot = actor.getSnapshot()
      expect(snapshot.value).toBe('gameOver')
      expect(snapshot.context.finalScores).toHaveLength(2)
      expect(snapshot.context.winner).toBeDefined()
      done()
    }, 2100) // Wait slightly longer than the 2000ms delay
  })

  it('handles game restart', () => {
    // Get to gameOver state first
    actor.send({
      type: 'PLAYER_JOIN',
      playerId: 'player-1',
      playerName: 'Alice',
    })
    actor.send({
      type: 'PLAYER_JOIN',
      playerId: 'player-2',
      playerName: 'Bob',
    })
    actor.send({ type: 'START_GAME' })
    actor.send({ type: 'END_GAME' })

    // Wait for gameOver, then restart
    setTimeout(() => {
      actor.send({ type: 'RESTART_GAME' })

      const snapshot = actor.getSnapshot()
      expect(snapshot.value).toBe('lobby')
      expect(snapshot.context.players).toHaveLength(0)
      expect(snapshot.context.gameTimer).toBe(180)
      expect(snapshot.context.selectedCards).toHaveLength(0)
      expect(snapshot.context.gameEndReason).toBeNull()
    }, 2100)
  })

  it('initializes context correctly', () => {
    const snapshot = actor.getSnapshot()
    
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
  })

  it('prevents invalid transitions', () => {
    // Try to send playerTurn events while in lobby
    actor.send({
      type: 'CARD_SELECTED',
      cardId: 'invalid',
      playerId: 'invalid',
    })

    expect(actor.getSnapshot().value).toBe('lobby')
  })
})
