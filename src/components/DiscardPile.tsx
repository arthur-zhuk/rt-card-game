import React from "react"
import type { Card as CardType } from "../types/game"
import CardComponent from "./Card"

interface DiscardPileProps {
  discardPile: CardType[]
  deckSize: number
}

const DiscardPile: React.FC<DiscardPileProps> = ({ discardPile, deckSize }) => {
  const topCard = discardPile[discardPile.length - 1]

  return (
    <div className="flex gap-10 items-start bg-white/95 px-6 py-6 rounded-xl shadow-lg">
      <div className="text-center">
        <h3 className="mb-4 text-gray-800">Deck</h3>
        <div className="w-20 h-28 bg-slate-700 rounded-lg flex items-center justify-center text-white font-bold border-2 border-slate-800">
          <div className="text-center">
            <div className="text-lg">{deckSize}</div>
          </div>
        </div>
      </div>

      <div className="text-center">
        <h3 className="mb-4 text-gray-800">Discard Pile</h3>
        <div className="mb-2">
          {topCard ? (
            <CardComponent card={topCard} size="large" />
          ) : (
            <div className="w-20 h-28 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-xs text-gray-500 text-center">
              No cards played yet
            </div>
          )}
        </div>
        <div className="mt-2 text-xs text-gray-600">
          <p className="mb-1">Cards in pile: {discardPile.length}</p>
          {topCard && (
            <p>
              Play cards with value <strong>{topCard.value}</strong> or{" "}
              <strong>next in sequence</strong>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default DiscardPile
