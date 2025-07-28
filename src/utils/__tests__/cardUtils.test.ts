import { describe, it, expect } from 'vitest'
import {
  createDeck,
  dealCards,
  getCardNumericValue,
  canPlayCard,
  canPlayCards,
  getValidCards,
  calculateHandScore,
} from '../cardUtils'
import { createMockCard, createCards } from '../../test/test-utils'

describe('cardUtils', () => {
  describe('createDeck', () => {
    it('creates a standard 52-card deck', () => {
      const deck = createDeck()
      expect(deck).toHaveLength(52)
    })

    it('contains all suits and values', () => {
      const deck = createDeck()
      const suits = ['hearts', 'diamonds', 'clubs', 'spades']
      const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']
      
      suits.forEach(suit => {
        values.forEach(value => {
          expect(deck.some(card => card.suit === suit && card.value === value)).toBe(true)
        })
      })
    })

    it('shuffles the deck randomly', () => {
      const deck1 = createDeck()
      const deck2 = createDeck()
      // Very unlikely to be identical if properly shuffled
      expect(deck1).not.toEqual(deck2)
    })
  })

  describe('dealCards', () => {
    it('deals 7 cards to each player', () => {
      const deck = createDeck()
      const { playerHands, remainingDeck } = dealCards(deck, 2)
      
      expect(playerHands).toHaveLength(2)
      expect(playerHands[0]).toHaveLength(7)
      expect(playerHands[1]).toHaveLength(7)
      expect(remainingDeck).toHaveLength(52 - 14)
    })

    it('handles different numbers of players', () => {
      const deck = createDeck()
      const { playerHands, remainingDeck } = dealCards(deck, 4)
      
      expect(playerHands).toHaveLength(4)
      playerHands.forEach(hand => {
        expect(hand).toHaveLength(7)
      })
      expect(remainingDeck).toHaveLength(52 - 28)
    })
  })

  describe('getCardNumericValue', () => {
    it('returns correct values for number cards', () => {
      expect(getCardNumericValue('2')).toBe(2)
      expect(getCardNumericValue('5')).toBe(5)
      expect(getCardNumericValue('10')).toBe(10)
    })

    it('returns correct values for face cards', () => {
      expect(getCardNumericValue('A')).toBe(1)
      expect(getCardNumericValue('J')).toBe(11)
      expect(getCardNumericValue('Q')).toBe(12)
      expect(getCardNumericValue('K')).toBe(13)
    })
  })

  describe('canPlayCard', () => {
    const discardCard = createMockCard({ value: '7', suit: 'hearts' })

    it('allows same value cards', () => {
      const card = createMockCard({ value: '7', suit: 'spades' })
      expect(canPlayCard(card, discardCard)).toBe(true)
    })

    it('allows ascending sequence', () => {
      const card = createMockCard({ value: '8', suit: 'clubs' })
      expect(canPlayCard(card, discardCard)).toBe(true)
    })

    it('handles Ace after King', () => {
      const kingDiscard = createMockCard({ value: 'K', suit: 'hearts' })
      const aceCard = createMockCard({ value: 'A', suit: 'spades' })
      expect(canPlayCard(aceCard, kingDiscard)).toBe(true)
    })

    it('rejects invalid cards', () => {
      const card = createMockCard({ value: '5', suit: 'clubs' })
      expect(canPlayCard(card, discardCard)).toBe(false)
    })
  })

  describe('canPlayCards', () => {
    const discardCard = createMockCard({ value: '7', suit: 'hearts' })

    it('allows single valid card', () => {
      const cards = [createMockCard({ value: '7', suit: 'spades' })]
      expect(canPlayCards(cards, discardCard)).toBe(true)
    })

    it('allows multiple individually valid cards', () => {
      const cards = [
        createMockCard({ value: '7', suit: 'spades' }),
        createMockCard({ value: '8', suit: 'clubs' }),
      ]
      expect(canPlayCards(cards, discardCard)).toBe(true)
    })

    it('allows multiple same value cards', () => {
      const cards = [
        createMockCard({ value: '7', suit: 'spades' }),
        createMockCard({ value: '7', suit: 'clubs' }),
      ]
      expect(canPlayCards(cards, discardCard)).toBe(true)
    })

    it('allows cards that sum to discard value', () => {
      const fiveDiscard = createMockCard({ value: '5', suit: 'hearts' })
      const cards = [
        createMockCard({ value: '2', suit: 'spades' }),
        createMockCard({ value: '3', suit: 'clubs' }),
      ]
      expect(canPlayCards(cards, fiveDiscard)).toBe(true)
    })

    it('rejects empty array', () => {
      expect(canPlayCards([], discardCard)).toBe(false)
    })

    it('rejects invalid combinations', () => {
      const cards = [
        createMockCard({ value: '2', suit: 'spades' }),
        createMockCard({ value: '4', suit: 'clubs' }),
      ]
      expect(canPlayCards(cards, discardCard)).toBe(false)
    })
  })

  describe('getValidCards', () => {
    const hand = createCards(['7', '8', '5', 'Q', 'A'])
    const discardCard = createMockCard({ value: '7', suit: 'hearts' })

    it('returns valid cards from hand', () => {
      const validCards = getValidCards(hand, discardCard)
      expect(validCards).toHaveLength(2) // 7 and 8
      expect(validCards.some(card => card.value === '7')).toBe(true)
      expect(validCards.some(card => card.value === '8')).toBe(true)
    })

    it('returns empty array when no valid cards', () => {
      const invalidHand = createCards(['2', '3', '4'])
      const validCards = getValidCards(invalidHand, discardCard)
      expect(validCards).toHaveLength(0)
    })
  })

  describe('calculateHandScore', () => {
    it('calculates correct score for mixed hand', () => {
      const hand = createCards(['A', '5', 'J', 'Q', 'K'])
      const score = calculateHandScore(hand)
      expect(score).toBe(1 + 5 + 11 + 12 + 13) // 42
    })

    it('handles empty hand', () => {
      expect(calculateHandScore([])).toBe(0)
    })

    it('calculates score for all face cards', () => {
      const hand = createCards(['A', 'J', 'Q', 'K'])
      const score = calculateHandScore(hand)
      expect(score).toBe(1 + 11 + 12 + 13) // 37
    })
  })
})
