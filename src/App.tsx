import GameBoard from "./components/GameBoard"

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500">
      {/* Main App Container */}
      <div className="min-h-screen flex flex-col">
        {/* Header */}
        <header className="bg-white/10 backdrop-blur-sm border-b border-white/20">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">🎴</span>
                </div>
                <h1 className="text-white font-bold text-xl">
                  Real-time Card Game
                </h1>
              </div>
              <div className="text-white/80 text-sm">
                Built with React & XState
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col">
          <div className="flex-1 container mx-auto px-4 py-6">
            <GameBoard />
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-white/5 backdrop-blur-sm border-t border-white/10">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="text-center text-white/60 text-sm">
              © 2024 Real-time Card Game • Professional React Implementation
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}

export default App
