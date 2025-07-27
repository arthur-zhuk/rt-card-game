# Real-time Card Game

A professional implementation of a real-time multiplayer card game built with React, TypeScript, and XState. This project demonstrates advanced state machine architecture, real-time game mechanics, and modern frontend development practices.

## 🎯 Game Overview

**Objective**: Achieve the lowest total hand value when the 3-minute round timer expires.

### Game Mechanics

- **Turn-based Play**: Players alternate placing cards on a shared discard pile
- **Matching Rules**: Play cards with the same value OR in ascending sequence
- **Scoring**: Ace=1, Numbers=face value, Jack=11, Queen=12, King=13
- **Timer**: 3-minute rounds with automatic game ending
- **Winner**: Player with the lowest remaining hand value

### Controls

- **Single Card**: Auto-play when only one valid card exists
- **Multiple Cards**: Click to select/deselect, SPACE key to play batch
- **Skip Turn**: Available when no valid moves exist

## 🏗️ Architecture

This project implements a sophisticated state machine architecture using XState:

```
LOBBY → GAME_STARTING → PLAYER_TURN ↔ WAITING_FOR_TURN → GAME_ENDING → GAME_OVER
```

### Key Features

- **State Management**: XState for complex game state transitions
- **Real-time Updates**: Live timer, scores, and turn indicators
- **Type Safety**: Full TypeScript implementation
- **Responsive Design**: Tailwind CSS for modern UI
- **Component Architecture**: Modular, reusable React components

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd rt-card-game

# Install dependencies
npm install

# Start development server
npm run dev
```

### Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

## 🎮 How to Play

1. **Setup**: Add 2-4 players in the lobby
2. **Start**: Click "Start Game" to begin
3. **Play**:
   - Click cards to select them
   - Press SPACE or click "Play Selected Cards"
   - Follow matching rules (same value or ascending sequence)
4. **Win**: Have the lowest hand value when timer expires

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript
- **State Management**: XState 5
- **Styling**: Tailwind CSS 3
- **Build Tool**: Vite 7
- **Testing**: Playwright (E2E)
- **Linting**: ESLint with TypeScript rules

## 📁 Project Structure

```
src/
├── components/          # React components
│   ├── GameBoard.tsx   # Main game interface
│   ├── PlayerHand.tsx  # Player card display
│   ├── DiscardPile.tsx # Central discard pile
│   └── ...
├── machines/           # XState state machines
│   └── cardGameMachine.ts
├── types/              # TypeScript definitions
│   └── game.ts
├── utils/              # Utility functions
│   └── cardUtils.ts
└── ...
```

## 🎯 State Machine Design

The game implements a comprehensive state machine with:

- **6 States**: Lobby, Game Starting, Player Turn, Waiting for Turn, Game Ending, Game Over
- **10+ Events**: Player actions, timer updates, game transitions
- **Guards**: Validation logic for state transitions
- **Actions**: Side effects and state updates

## 🧪 Testing

The project includes comprehensive E2E testing with Playwright:

```bash
# Run tests (if configured)
npx playwright test
```

## 🚀 Deployment

```bash
# Build for production
npm run build

# The dist/ folder contains the production build
```

## 📝 License

This project is part of a frontend engineering challenge demonstrating advanced React and state management concepts.

---

**Built with ❤️ using modern web technologies**
