import type { Card as CardType, CardValue, Suit } from "../types/game"
import { v4 as uuidv4 } from "uuid"

export const getCardPoints = (value: CardValue): number => {
  switch (value) {
    case "A":
      return 1
    case "J":
      return 11
    case "Q":
      return 12
    case "K":
      return 13
    default:
      return parseInt(value)
  }
}

export const getCardNumericValue = (value: CardValue): number => {
  switch (value) {
    case "A":
      return 1
    case "J":
      return 11
    case "Q":
      return 12
    case "K":
      return 13
    default:
      return parseInt(value)
  }
}

export const createDeck = (): CardType[] => {
  const suits: Suit[] = ["hearts", "diamonds", "clubs", "spades"]
  const values: CardValue[] = [
    "A",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "10",
    "J",
    "Q",
    "K",
  ]

  const deck: CardType[] = []

  suits.forEach((suit) => {
    values.forEach((value) => {
      deck.push({
        id: uuidv4(),
        suit,
        value,
        points: getCardPoints(value),
      })
    })
  })

  return shuffleDeck(deck)
}

export const shuffleDeck = (deck: CardType[]): CardType[] => {
  const shuffled = [...deck]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

export const canPlayCard = (
  card: CardType,
  topDiscardCard: CardType
): boolean => {
  // Same value
  if (card.value === topDiscardCard.value) {
    return true
  }

  // Ascending sequence
  const cardValue = getCardNumericValue(card.value)
  const topValue = getCardNumericValue(topDiscardCard.value)

  // Handle Ace on King (1 on 13)
  if (cardValue === 1 && topValue === 13) {
    return true
  }

  // Regular ascending sequence
  if (cardValue === topValue + 1) {
    return true
  }

  return false
}

export const getValidCards = (
  hand: CardType[],
  topDiscardCard: CardType
): CardType[] => {
  return hand.filter((card) => canPlayCard(card, topDiscardCard))
}

export const calculateHandScore = (hand: CardType[]): number => {
  return hand.reduce((total, card) => total + card.points, 0)
}

// Validate if multiple cards can be played together
export const canPlayCards = (
  cards: CardType[],
  topDiscardCard: CardType
): boolean => {
  if (cards.length === 0) return false
  if (cards.length === 1) return canPlayCard(cards[0], topDiscardCard)

  // For multiple cards, check three scenarios:

  // 1. All cards are individually valid (e.g., 3s and 4s on a 3)
  const allIndividuallyValid = cards.every((card) =>
    canPlayCard(card, topDiscardCard)
  )

  if (allIndividuallyValid) {
    return true
  }

  // 2. All cards have the same value (e.g., multiple 5s on a 5)
  const firstCardValue = cards[0].value
  const allSameValue = cards.every((card) => card.value === firstCardValue)

  if (allSameValue) {
    // Check if the first card can be played (all others have same value)
    return canPlayCard(cards[0], topDiscardCard)
  }

  // 3. Cards sum to the discard pile value (e.g., 2+3=5 on a 5)
  const cardsSum = cards.reduce(
    (sum, card) => sum + getCardNumericValue(card.value),
    0
  )
  const topDiscardValue = getCardNumericValue(topDiscardCard.value)

  return cardsSum === topDiscardValue
}

export const dealCards = (
  deck: CardType[],
  numPlayers: number,
  cardsPerPlayer: number = 7
): { playerHands: CardType[][]; remainingDeck: CardType[] } => {
  const playerHands: CardType[][] = Array(numPlayers)
    .fill(null)
    .map(() => [])
  let deckIndex = 0

  // Deal cards round-robin style
  for (let cardNum = 0; cardNum < cardsPerPlayer; cardNum++) {
    for (let playerIndex = 0; playerIndex < numPlayers; playerIndex++) {
      if (deckIndex < deck.length) {
        playerHands[playerIndex].push(deck[deckIndex])
        deckIndex++
      }
    }
  }

  return {
    playerHands,
    remainingDeck: deck.slice(deckIndex),
  }
}
