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
    <div className="flex flex-col items-center justify-center flex-1 p-6 text-center">
      {/* Welcome Section */}
      <div className="mb-8 bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
            <span className="text-2xl">🎮</span>
          </div>
          <h2 className="text-3xl text-white font-bold">Game Lobby</h2>
        </div>
        <p className="text-lg text-white/90 max-w-2xl">
          Welcome to the Real-time Card Game! Add 2-4 players to start competing
          for the lowest hand value. The game runs for exactly 3 minutes - may
          the best strategist win!
        </p>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl w-full">
        {/* Game Rules Card */}
        <div className="bg-white/95 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-white/20 text-left">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-bold">📋</span>
            </div>
            <h3 className="text-xl font-bold text-gray-800">Game Rules</h3>
          </div>
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

        {/* Players Card */}
        <div className="bg-white/95 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-white/20">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-bold">👥</span>
            </div>
            <h3 className="text-xl font-bold text-gray-800">
              Players ({players.length}/4)
            </h3>
          </div>
          {/* Players List */}
          <div className="space-y-3 mb-8">
            {players.length === 0 ? (
              <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                <div className="text-3xl mb-2">🎭</div>
                <p className="font-medium">No players yet</p>
                <p className="text-sm">Add some players to get started!</p>
              </div>
            ) : (
              players.map((player, index) => (
                <div
                  key={player.id}
                  className="flex items-center gap-3 bg-gradient-to-r from-green-50 to-blue-50 px-4 py-3 rounded-xl border-l-4 border-green-500 shadow-sm"
                >
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {index + 1}
                  </div>
                  <span className="font-medium text-gray-800">
                    {player.name}
                  </span>
                  <div className="ml-auto text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                    Ready
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Add Player Form */}
          <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
            <form
              onSubmit={handleJoinGame}
              className="flex flex-col gap-4 items-center"
            >
              <div className="w-full max-w-sm">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Player Name
                </label>
                <input
                  type="text"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder={
                    players.length >= 4 ? "Game Full" : "Enter your name..."
                  }
                  maxLength={20}
                  required
                  disabled={players.length >= 4}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl text-base text-center focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:bg-gray-100 disabled:cursor-not-allowed transition-all duration-200"
                />
              </div>
              <button
                type="submit"
                disabled={!playerName.trim() || players.length >= 4}
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white border-none px-8 py-3 rounded-xl text-base font-bold cursor-pointer transition-all duration-200 hover:from-blue-600 hover:to-purple-700 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-500/30 disabled:bg-gray-300 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none disabled:from-gray-300 disabled:to-gray-300"
              >
                {players.length >= 4 ? "Lobby Full" : "Add Player"}
              </button>
            </form>
          </div>

          {/* Start Game Section */}
          <div className="mt-8 text-center">
            {canStartGame ? (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border-2 border-green-200">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">🚀</span>
                  </div>
                  <h4 className="text-lg font-bold text-green-800">
                    Ready to Start!
                  </h4>
                </div>
                <p className="text-green-700 mb-4">
                  All players are ready. Click below to begin the 3-minute
                  challenge!
                </p>
                <button
                  onClick={onStartGame}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 text-white border-none px-10 py-4 rounded-xl text-lg font-bold cursor-pointer transition-all duration-200 hover:from-green-600 hover:to-emerald-700 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-green-500/30 transform"
                >
                  🎮 Start Game
                </button>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-2xl p-6 border-2 border-dashed border-gray-200">
                <div className="text-gray-400 text-4xl mb-3">⏳</div>
                <p className="text-gray-600 font-medium">
                  Minimum 2 players required to start
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Add {Math.max(0, 2 - players.length)} more player
                  {Math.max(0, 2 - players.length) !== 1 ? "s" : ""} to begin
                </p>
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
