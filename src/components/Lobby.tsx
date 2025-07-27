import React, { useState } from "react"
import type { Player } from "../types/game"
import { v4 as uuidv4 } from "uuid"

interface LobbyProps {
  players: Player[]
  onPlayerJoin: (playerId: string, playerName: string) => void
  onStartGame: () => void
}

const Lobby: React.FC<LobbyProps> = ({
  players,
  onPlayerJoin,
  onStartGame,
}) => {
  const [playerName, setPlayerName] = useState("")

  const handleJoinGame = (e: React.FormEvent) => {
    e.preventDefault()
    if (playerName.trim() && players.length < 4) {
      const playerId = uuidv4()
      onPlayerJoin(playerId, playerName.trim())
      setPlayerName("") // Clear the input for next player
    }
  }

  const canStartGame = players.length >= 2

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-5 text-center">
      <div className="mb-10">
        <h1 className="text-5xl text-white mb-2 drop-shadow-lg">
          Real-time Card Game
        </h1>
        <p className="text-xl text-white/90 drop-shadow-md">
          Compete with 2-4 players to achieve the lowest hand value when the
          3-minute timer expires!
        </p>
      </div>

      <div className="flex gap-10 max-w-6xl w-full">
        <div className="flex-1 bg-white/95 p-6 rounded-xl shadow-lg text-left">
          <h3 className="mb-4 text-gray-800">Game Rules</h3>
          <ul className="list-none p-0">
            <li className="mb-2 pl-5 relative before:content-['•'] before:text-green-500 before:font-bold before:absolute before:left-0">
              <strong>Objective:</strong> Get the lowest total hand value
            </li>
            <li className="mb-2 pl-5 relative before:content-['•'] before:text-green-500 before:font-bold before:absolute before:left-0">
              <strong>Time Limit:</strong> 3 minutes per round
            </li>
            <li className="mb-2 pl-5 relative before:content-['•'] before:text-green-500 before:font-bold before:absolute before:left-0">
              <strong>Card Values:</strong> Ace=1, 2-10=face value, J=11, Q=12,
              K=13
            </li>
            <li className="mb-2 pl-5 relative before:content-['•'] before:text-green-500 before:font-bold before:absolute before:left-0">
              <strong>Play Rules:</strong> Match value or play ascending
              sequence
            </li>
            <li className="mb-2 pl-5 relative before:content-['•'] before:text-green-500 before:font-bold before:absolute before:left-0">
              <strong>Controls:</strong> Click cards to select, SPACE to play
              batch
            </li>
          </ul>
        </div>

        <div className="flex-1 bg-white/95 p-6 rounded-xl shadow-lg">
          <h3 className="mb-4 text-gray-800">Players ({players.length}/4)</h3>
          <div className="flex flex-col gap-2 mb-5">
            {players.map((player) => (
              <div
                key={player.id}
                className="bg-gray-100 px-4 py-2 rounded border-l-4 border-green-500"
              >
                {player.name}
              </div>
            ))}
          </div>

          <div className="mt-5">
            <form
              onSubmit={handleJoinGame}
              className="flex flex-col gap-4 items-center"
            >
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder={
                  players.length >= 4 ? "Game Full" : "Enter player name"
                }
                maxLength={20}
                required
                disabled={players.length >= 4}
                className="px-4 py-3 border-2 border-gray-300 rounded-lg text-base w-64 text-center focus:outline-none focus:border-green-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
              <button
                type="submit"
                disabled={!playerName.trim() || players.length >= 4}
                className="bg-blue-500 text-white border-none px-6 py-3 rounded-lg text-base font-bold cursor-pointer transition-all duration-200 hover:bg-blue-600 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-500/30 disabled:bg-gray-300 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
              >
                {players.length >= 4 ? "Game Full" : "Add Player"}
              </button>
            </form>

            {canStartGame && (
              <div className="mt-4">
                <button
                  onClick={onStartGame}
                  className="bg-green-500 text-white border-none px-8 py-4 rounded-lg text-lg font-bold cursor-pointer transition-all duration-200 hover:bg-green-600 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-green-500/30"
                >
                  Start Game
                </button>
              </div>
            )}

            {!canStartGame && (
              <div className="text-center mt-4">
                <p className="mb-2 text-gray-700">
                  Need {2 - players.length} more player
                  {2 - players.length !== 1 ? "s" : ""} to start
                </p>
                <p className="text-sm text-gray-600">(2-4 players required)</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Lobby
