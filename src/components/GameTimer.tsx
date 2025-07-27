import React from "react"

interface GameTimerProps {
  timeRemaining: number
}

const GameTimer: React.FC<GameTimerProps> = ({ timeRemaining }) => {
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  const getTimerClasses = () => {
    const baseClasses = "text-center px-5 py-2.5 rounded-lg font-bold"
    if (timeRemaining <= 30)
      return `${baseClasses} bg-red-500 text-white animate-pulse`
    if (timeRemaining <= 60) return `${baseClasses} bg-orange-500 text-white`
    return `${baseClasses} bg-green-500 text-white`
  }

  return (
    <div className={getTimerClasses()}>
      <div className="text-xs opacity-90">Time Remaining</div>
      <div className="text-2xl font-bold">{formatTime(timeRemaining)}</div>
    </div>
  )
}

export default GameTimer
