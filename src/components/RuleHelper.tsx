import React from "react"
import type { Card as CardType } from "../types/game"

interface RuleHelperProps {
  topDiscardCard: CardType | null
  validCards: CardType[]
  selectedCards: CardType[]
  isVisible: boolean
}

export const RuleHelper: React.FC<RuleHelperProps> = ({
  topDiscardCard,
  validCards,
  selectedCards,
  isVisible,
}) => {
  if (!isVisible || !topDiscardCard) return null

  const getValidMoveHint = () => {
    const topValue = topDiscardCard.value
    const nextValue = getNextValue(topValue)

    return {
      sameValue: topValue,
      nextValue: nextValue,
      hasValidCards: validCards.length > 0,
    }
  }

  const getNextValue = (value: string): string => {
    const valueMap: { [key: string]: string } = {
      A: "2",
      "2": "3",
      "3": "4",
      "4": "5",
      "5": "6",
      "6": "7",
      "7": "8",
      "8": "9",
      "9": "10",
      "10": "J",
      J: "Q",
      Q: "K",
      K: "A",
    }
    return valueMap[value] || "A"
  }

  const hint = getValidMoveHint()

  return (
    <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4 rounded-r-lg">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg
            className="h-5 w-5 text-blue-400"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-blue-800">
            Valid Moves on {topDiscardCard.value}
            {topDiscardCard.suit === "hearts"
              ? "♥"
              : topDiscardCard.suit === "diamonds"
              ? "♦"
              : topDiscardCard.suit === "clubs"
              ? "♣"
              : "♠"}
          </h3>
          <div className="mt-2 text-sm text-blue-700">
            <ul className="list-disc list-inside space-y-1">
              <li>
                Play another <strong>{hint.sameValue}</strong> (same value)
              </li>
              <li>
                Play a <strong>{hint.nextValue}</strong> (next in sequence)
              </li>
              {topDiscardCard.value === "K" && (
                <li>
                  Play an <strong>Ace</strong> (wraps around from King)
                </li>
              )}
            </ul>
          </div>

          {hint.hasValidCards ? (
            <div className="mt-3 text-sm">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                ✓ You have {validCards.length} valid card
                {validCards.length !== 1 ? "s" : ""}
              </span>
            </div>
          ) : (
            <div className="mt-3 text-sm">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                ⏭ No valid cards - advancing to next player
              </span>
            </div>
          )}

          {selectedCards.length > 0 && (
            <div className="mt-3 text-sm">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {selectedCards.length} card
                {selectedCards.length !== 1 ? "s" : ""} selected - Press SPACE
                to play
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
