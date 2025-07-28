import React from "react"
import type { Card as CardType } from "../types/game"

interface CardProps {
  card: CardType
  isSelected?: boolean
  isValid?: boolean
  canInteract?: boolean
  onClick?: () => void
  size?: "small" | "medium" | "large"
}

const CardComponent: React.FC<CardProps> = ({
  card,
  isSelected = false,
  isValid = false,
  canInteract = false,
  onClick,
  size = "medium",
}) => {
  const getSuitSymbol = (suit: string) => {
    switch (suit) {
      case "hearts":
        return "♥"
      case "diamonds":
        return "♦"
      case "clubs":
        return "♣"
      case "spades":
        return "♠"
      default:
        return ""
    }
  }

  const getSuitColor = (suit: string) => {
    return suit === "hearts" || suit === "diamonds"
      ? "text-red-600"
      : "text-gray-800"
  }

  const getSizeClasses = () => {
    switch (size) {
      case "small":
        return "w-12 h-16"
      case "large":
        return "w-20 h-28"
      default:
        return "w-15 h-21"
    }
  }

  const getTextSizeClasses = () => {
    switch (size) {
      case "small":
        return {
          value: "text-sm",
          suit: "text-base",
          points: "text-xs",
        }
      case "large":
        return {
          value: "text-xl",
          suit: "text-2xl",
          points: "text-sm",
        }
      default:
        return {
          value: "text-lg",
          suit: "text-xl",
          points: "text-xs",
        }
    }
  }

  const getCardClasses = () => {
    const baseClasses = `${getSizeClasses()} bg-white border-2 rounded-lg flex flex-col items-center justify-center font-bold transition-all duration-200 relative ${getSuitColor(
      card.suit
    )}`

    let classes = baseClasses + " border-gray-300"

    if (canInteract) {
      classes += " cursor-pointer hover:-translate-y-1 hover:shadow-lg"
    }

    if (isSelected) {
      classes +=
        " border-blue-500 bg-blue-50 -translate-y-2 shadow-lg shadow-blue-500/40"
    } else if (isValid) {
      classes += " border-green-500 bg-green-50"
    }

    return classes
  }

  return (
    <div
      className={getCardClasses()}
      onClick={canInteract ? onClick : undefined}
      role={canInteract ? "button" : undefined}
      tabIndex={canInteract ? 0 : undefined}
    >
      <div className="flex flex-col items-center gap-0.5">
        <div className={`${getTextSizeClasses().value} font-bold`}>
          {card.value}
        </div>
        <div className={getTextSizeClasses().suit}>
          {getSuitSymbol(card.suit)}
        </div>
        <div className={`${getTextSizeClasses().points} opacity-70`}>
          {card.points}
        </div>
      </div>
    </div>
  )
}

export default CardComponent
