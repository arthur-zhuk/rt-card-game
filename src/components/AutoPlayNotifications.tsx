import React from "react"
import type { AutoPlayNotification } from "../types/game"

interface AutoPlayNotificationsProps {
  notifications: AutoPlayNotification[]
  maxVisible?: number
}

const AutoPlayNotifications: React.FC<AutoPlayNotificationsProps> = ({
  notifications,
  maxVisible = 5,
}) => {
  // Show only the most recent notifications
  const recentNotifications = notifications.slice(-maxVisible).reverse()

  if (recentNotifications.length === 0) {
    return null
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {recentNotifications.map((notification) => (
        <div
          key={notification.id}
          className={`
            flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border-2 
            transform transition-all duration-500 ease-in-out
            ${
              notification.type === "auto-play"
                ? "bg-green-100 text-green-800 border-green-200"
                : "bg-orange-100 text-orange-800 border-orange-200"
            }
            animate-slide-in-right
          `}
        >
          <div className="text-xl">
            {notification.type === "auto-play" ? "🤖" : "⏭️"}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-sm">
              {notification.type === "auto-play" ? "Auto-Played" : "Auto-Skipped"}
            </div>
            <div className="text-sm">
              {notification.type === "auto-play" && notification.card ? (
                <>
                  <span className="font-medium">{notification.playerName}</span> played{" "}
                  <span className="font-bold">
                    {notification.card.value}
                    {notification.card.suit === "hearts" && "♥"}
                    {notification.card.suit === "diamonds" && "♦"}
                    {notification.card.suit === "clubs" && "♣"}
                    {notification.card.suit === "spades" && "♠"}
                  </span>
                </>
              ) : (
                <>
                  <span className="font-medium">{notification.playerName}</span> had no valid moves
                </>
              )}
            </div>
          </div>
          <div className="text-xs opacity-60">
            {new Date(notification.timestamp).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

export default AutoPlayNotifications
