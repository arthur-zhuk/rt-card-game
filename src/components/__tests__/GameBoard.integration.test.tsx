import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '../../test/test-utils'
import GameBoard from '../GameBoard'

// Mock the machine to control state for testing
vi.mock('../../machines/cardGameMachine', () => ({
  cardGameMachine: {
    id: 'cardGame',
    initial: 'lobby',
    context: {
      players: [],
      currentPlayerIndex: 0,
      deck: [],
      discardPile: [],
      gameTimer: 180,
      selectedCards: [],
      gameId: 'test-game',
      roundStartTime: null,
      finalScores: [],
      winner: null,
      autoPlayNotifications: [],
      gameEndReason: null,
    },
  },
}))

// Mock useMachine hook
const mockSend = vi.fn()
const mockState = {
  value: 'lobby',
  context: {
    players: [],
    currentPlayerIndex: 0,
    deck: [],
    discardPile: [],
    gameTimer: 180,
    selectedCards: [],
    gameId: 'test-game',
    roundStartTime: null,
    finalScores: [],
    winner: null,
    autoPlayNotifications: [],
    gameEndReason: null,
  },
  matches: vi.fn((state: string) => mockState.value === state),
}

vi.mock('@xstate/react', () => ({
  useMachine: () => [mockState, mockSend],
}))

describe('GameBoard Integration', () => {
  beforeEach(() => {
    mockSend.mockClear()
    mockState.value = 'lobby'
    mockState.context = {
      players: [],
      currentPlayerIndex: 0,
      deck: [],
      discardPile: [],
      gameTimer: 180,
      selectedCards: [],
      gameId: 'test-game',
      roundStartTime: null,
      finalScores: [],
      winner: null,
      autoPlayNotifications: [],
      gameEndReason: null,
    }
  })

  it('renders lobby when in lobby state', () => {
    render(<GameBoard />)
    
    expect(screen.getByText(/Real-time Card Game/)).toBeInTheDocument()
    expect(screen.getByText(/Add players to start/)).toBeInTheDocument()
  })

  it('renders game interface when in playerTurn state', () => {
    mockState.value = 'playerTurn'
    mockState.context = {
      ...mockState.context,
      players: [
        {
          id: 'player-1',
          name: 'Alice',
          hand: [
            { id: 'card-1', value: '7', suit: 'hearts', points: 7 },
            { id: 'card-2', value: '8', suit: 'spades', points: 8 },
          ],
          isCurrentPlayer: true,
        },
        {
          id: 'player-2',
          name: 'Bob',
          hand: [
            { id: 'card-3', value: '9', suit: 'clubs', points: 9 },
          ],
          isCurrentPlayer: false,
        },
      ],
      discardPile: [
        { id: 'discard-1', value: '6', suit: 'diamonds', points: 6 },
      ],
      currentPlayerIndex: 0,
    }

    render(<GameBoard />)
    
    expect(screen.getByText('Alice')).toBeInTheDocument()
    expect(screen.getByText('Bob')).toBeInTheDocument()
    expect(screen.getByText('Time Remaining')).toBeInTheDocument()
    expect(screen.getByText('Discard Pile')).toBeInTheDocument()
  })

  it('shows game over screen when in gameOver state', () => {
    mockState.value = 'gameOver'
    mockState.context = {
      ...mockState.context,
      finalScores: [
        {
          playerId: 'player-1',
          playerName: 'Alice',
          finalScore: 15,
          handCards: [],
        },
        {
          playerId: 'player-2',
          playerName: 'Bob',
          finalScore: 20,
          handCards: [],
        },
      ],
      winner: {
        playerId: 'player-1',
        playerName: 'Alice',
        finalScore: 15,
        handCards: [],
      },
      gameEndReason: 'timer_expired',
    }

    render(<GameBoard />)
    
    expect(screen.getByText('Game Over!')).toBeInTheDocument()
    expect(screen.getByText(/Alice Wins!/)).toBeInTheDocument()
    expect(screen.getByText('Final Scores')).toBeInTheDocument()
  })

  it('handles card selection during player turn', () => {
    mockState.value = 'playerTurn'
    mockState.context = {
      ...mockState.context,
      players: [
        {
          id: 'player-1',
          name: 'Alice',
          hand: [
            { id: 'card-1', value: '7', suit: 'hearts', points: 7 },
          ],
          isCurrentPlayer: true,
        },
      ],
      discardPile: [
        { id: 'discard-1', value: '6', suit: 'diamonds', points: 6 },
      ],
    }

    render(<GameBoard />)
    
    const card = screen.getByRole('button')
    fireEvent.click(card)
    
    expect(mockSend).toHaveBeenCalledWith({
      type: 'CARD_SELECTED',
      cardId: 'card-1',
      playerId: 'player-1',
    })
  })

  it('shows action indicator for current game state', () => {
    mockState.value = 'playerTurn'
    mockState.context = {
      ...mockState.context,
      players: [
        {
          id: 'player-1',
          name: 'Alice',
          hand: [
            { id: 'card-1', value: '7', suit: 'hearts', points: 7 },
          ],
          isCurrentPlayer: true,
        },
      ],
      discardPile: [
        { id: 'discard-1', value: '6', suit: 'diamonds', points: 6 },
      ],
    }

    render(<GameBoard />)
    
    // Should show action indicator
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })

  it('displays timer correctly', () => {
    mockState.value = 'playerTurn'
    mockState.context = {
      ...mockState.context,
      gameTimer: 125, // 2:05
    }

    render(<GameBoard />)
    
    expect(screen.getByText('2:05')).toBeInTheDocument()
  })

  it('shows auto-play notifications when present', () => {
    mockState.value = 'playerTurn'
    mockState.context = {
      ...mockState.context,
      autoPlayNotifications: [
        {
          id: 'notification-1',
          playerId: 'player-1',
          playerName: 'Alice',
          card: { id: 'card-1', value: '7', suit: 'hearts', points: 7 },
          timestamp: new Date(),
          type: 'auto-play' as const,
        },
      ],
    }

    render(<GameBoard />)
    
    expect(screen.getByText('Auto-Played')).toBeInTheDocument()
    expect(screen.getByText(/Alice played 7♥/)).toBeInTheDocument()
  })

  it('handles keyboard events for card play', () => {
    mockState.value = 'playerTurn'
    mockState.context = {
      ...mockState.context,
      players: [
        {
          id: 'player-1',
          name: 'Alice',
          hand: [
            { id: 'card-1', value: '7', suit: 'hearts', points: 7 },
          ],
          isCurrentPlayer: true,
        },
      ],
      selectedCards: [
        { id: 'card-1', value: '7', suit: 'hearts', points: 7 },
      ],
    }

    render(<GameBoard />)
    
    // Simulate space key press
    fireEvent.keyDown(document, { key: ' ', code: 'Space' })
    
    expect(mockSend).toHaveBeenCalledWith({
      type: 'PLAY_CARDS',
      cards: mockState.context.selectedCards,
      playerId: 'player-1',
    })
  })

  it('prevents interactions when not current player', () => {
    mockState.value = 'playerTurn'
    mockState.context = {
      ...mockState.context,
      players: [
        {
          id: 'player-1',
          name: 'Alice',
          hand: [
            { id: 'card-1', value: '7', suit: 'hearts', points: 7 },
          ],
          isCurrentPlayer: false, // Not current player
        },
        {
          id: 'player-2',
          name: 'Bob',
          hand: [
            { id: 'card-2', value: '8', suit: 'spades', points: 8 },
          ],
          isCurrentPlayer: true,
        },
      ],
      currentPlayerIndex: 1,
    }

    render(<GameBoard />)
    
    // Try to click Alice's card (she's not current player)
    const aliceCards = screen.getAllByRole('button')
    const aliceCard = aliceCards.find(card => 
      card.closest('[class*="border-3"]') === null
    )
    
    if (aliceCard) {
      fireEvent.click(aliceCard)
      // Should not send card selection event
      expect(mockSend).not.toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'CARD_SELECTED',
          playerId: 'player-1',
        })
      )
    }
  })
})
