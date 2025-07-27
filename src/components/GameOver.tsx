import React from "react"
import type { PlayerScore, GameEndReason } from "../types/game"
import CardComponent from "./Card"

interface GameOverProps {
  finalScores: PlayerScore[]
  winner: PlayerScore | null
  gameEndReason: GameEndReason
  onRestart: () => void
  onLeave: (playerId: string) => void
}

const GameOver: React.FC<GameOverProps> = ({
  finalScores,
  winner,
  gameEndReason,
  onRestart,
}) => {
  const sortedScores = [...finalScores].sort(
    (a, b) => a.finalScore - b.finalScore
  )

  // Get game end reason message
  const getEndReasonMessage = () => {
    switch (gameEndReason) {
      case "timer_expired":
        return {
          message: "Game ended when the 3-minute timer expired",
          icon: "⏰",
          color: "bg-orange-100 text-orange-800 border-orange-200",
        }
      case "no_valid_moves":
        return {
          message: "Game ended because no players had valid moves",
          icon: "🚫",
          color: "bg-red-100 text-red-800 border-red-200",
        }
      case "manual_end":
        return {
          message: "Game was manually ended by a player",
          icon: "🛑",
          color: "bg-gray-100 text-gray-800 border-gray-200",
        }
      case "player_won":
        return {
          message: `${
            winner?.playerName || "A player"
          } won by emptying their hand!`,
          icon: "🎉",
          color: "bg-green-100 text-green-800 border-green-200",
        }
      default:
        return {
          message: "Game completed",
          icon: "🏁",
          color: "bg-blue-100 text-blue-800 border-blue-200",
        }
    }
  }

  const endReason = getEndReasonMessage()

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-5 text-center">
      <div className="mb-10">
        <h1 className="text-5xl text-white mb-5 drop-shadow-lg">Game Over!</h1>

        {/* Game End Reason */}
        <div
          className={`px-4 py-3 rounded-lg border-2 mb-5 ${endReason.color}`}
        >
          <div className="flex items-center justify-center gap-2">
            <span className="text-xl">{endReason.icon}</span>
            <span className="font-medium">{endReason.message}</span>
          </div>
        </div>

        {winner && (
          <div className="bg-white/95 px-6 py-6 rounded-xl shadow-lg mb-5">
            <h2 className="text-green-500 mb-2">
              🎉 {winner.playerName} Wins! 🎉
            </h2>
            <p className="text-gray-800 text-xl">
              Final Score: {winner.finalScore} points
            </p>
          </div>
        )}
      </div>

      <div className="bg-white/95 px-6 py-6 rounded-xl shadow-lg mb-8 max-w-4xl w-full">
        <h3 className="text-gray-800 mb-5">Final Scores</h3>
        <div className="flex flex-col gap-4">
          {sortedScores.map((score, index) => (
            <div
              key={score.playerId}
              className={`grid grid-cols-1 gap-2 items-center px-4 py-4 rounded-lg border-l-4 ${
                index === 0
                  ? "bg-green-50 border-green-500"
                  : "bg-gray-50 border-gray-300"
              } md:grid-cols-4 md:gap-4 md:text-center`}
            >
              <div
                className={`font-bold text-lg ${
                  index === 0 ? "text-green-500" : "text-gray-600"
                }`}
              >
                #{index + 1}
              </div>
              <div className="font-bold text-left md:text-center">
                {score.playerName}
              </div>
              <div className="font-bold text-gray-800">
                {score.finalScore} points
              </div>
              <div className="flex gap-1 flex-wrap justify-start md:justify-center">
                {score.handCards.map((card) => (
                  <CardComponent key={card.id} card={card} size="small" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-8">
        <button
          onClick={onRestart}
          className="bg-green-500 text-white border-none px-8 py-4 rounded-lg text-lg font-bold cursor-pointer transition-all duration-200 hover:bg-green-600 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-green-500/30"
        >
          Play Again
        </button>
      </div>

      <div className="bg-white/95 px-5 py-5 rounded-xl shadow-lg max-w-md w-full">
        <h4 className="text-gray-800 mb-4">Game Statistics</h4>
        <div className="flex flex-col gap-2">
          <div className="flex justify-between py-2 border-b border-gray-200 last:border-b-0">
            <span className="text-gray-600">Total Players:</span>
            <span className="font-bold text-gray-800">
              {finalScores.length}
            </span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-200 last:border-b-0">
            <span className="text-gray-600">Winning Score:</span>
            <span className="font-bold text-gray-800">
              {winner?.finalScore} points
            </span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-200 last:border-b-0">
            <span className="text-gray-600">Average Score:</span>
            <span className="font-bold text-gray-800">
              {Math.round(
                finalScores.reduce((sum, score) => sum + score.finalScore, 0) /
                  finalScores.length
              )}{" "}
              points
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default GameOver
