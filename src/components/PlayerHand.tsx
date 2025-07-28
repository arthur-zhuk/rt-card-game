import React, { memo, useMemo, useCallback } from "react"
import type { Player, Card as CardType } from "../types/game"
import { getValidCards, calculateHandScore } from "../utils/cardUtils"
import CardComponent from "./Card"

interface PlayerHandProps {
  player: Player
  isCurrentPlayer: boolean
  selectedCards: CardType[]
  onCardSelect: (cardId: string) => void
  canInteract: boolean
  topDiscardCard?: CardType
}

const PlayerHand: React.FC<PlayerHandProps> = ({
  player,
  isCurrentPlayer,
  selectedCards,
  onCardSelect,
  canInteract,
  topDiscardCard,
}) => {
  const handScore = useMemo(
    () => calculateHandScore(player.hand),
    [player.hand]
  )

  const validCards = useMemo(() => {
    return topDiscardCard ? getValidCards(player.hand, topDiscardCard) : []
  }, [player.hand, topDiscardCard])

  const handleCardClick = useCallback(
    (cardId: string) => {
      if (canInteract) {
        onCardSelect(cardId)
      }
    },
    [canInteract, onCardSelect]
  )

  return (
    <div
      className={`bg-white/95 rounded-xl p-5 shadow-lg transition-all duration-300 ${
        isCurrentPlayer
          ? "border-3 border-green-500 shadow-xl shadow-green-500/30"
          : ""
      }`}
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-gray-800 m-0">{player.name}</h3>
        <div className="flex gap-4 text-sm text-gray-600">
          <span>Cards: {player.hand.length}</span>
          <span>Score: {handScore}</span>
          {isCurrentPlayer && (
            <span className="bg-green-500 text-white px-2 py-1 rounded text-xs font-bold">
              Your Turn
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 justify-start">
        {player.hand.map((card) => {
          const isSelected = selectedCards.some(
            (selectedCard) => selectedCard.id === card.id
          )
          const isValid = validCards.some(
            (validCard) => validCard.id === card.id
          )

          return (
            <CardComponent
              key={card.id}
              card={card}
              isSelected={isSelected}
              isValid={isValid}
              canInteract={canInteract}
              onClick={() => handleCardClick(card.id)}
            />
          )
        })}
      </div>
    </div>
  )
}

export default memo(PlayerHand)
