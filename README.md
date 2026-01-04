# Real-time Card Game

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![XState](https://img.shields.io/badge/XState-000000?style=for-the-badge&logo=xstate&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)

A professional real-time multiplayer card game built with React, TypeScript, and XState. This project demonstrates advanced state machine architecture, real-time game mechanics, and modern frontend development practices.

## Game Overview

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

## Features

- **State Management**: XState for complex game state transitions
- **Real-time Updates**: Live timer, scores, and turn indicators
- **Type Safety**: Full TypeScript implementation
- **Responsive Design**: Tailwind CSS for modern UI
- **Component Architecture**: Modular, reusable React components
- **E2E Testing**: Playwright for comprehensive testing

## Tech Stack

- **Frontend**: React 19, TypeScript
- **State Management**: XState 5
- **Styling**: Tailwind CSS 3
- **Build Tool**: Vite 7
- **Testing**: Playwright (E2E), Vitest
- **Linting**: ESLint with TypeScript rules

## Installation

```bash
git clone https://github.com/arthur-zhuk/rt-card-game.git
cd rt-card-game
npm install
```

### Prerequisites

- Node.js 18+
- npm or yarn

## Usage

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

Open [http://localhost:5173](http://localhost:5173) to play the game.

## How to Play

1. **Setup**: Add 2-4 players in the lobby
2. **Start**: Click "Start Game" to begin
3. **Play**:
   - Click cards to select them
   - Press SPACE or click "Play Selected Cards"
   - Follow matching rules (same value or ascending sequence)
4. **Win**: Have the lowest hand value when timer expires

## Architecture

The game implements a comprehensive state machine with:

```
LOBBY → GAME_STARTING → PLAYER_TURN ↔ WAITING_FOR_TURN → GAME_ENDING → GAME_OVER
```

- **6 States**: Lobby, Game Starting, Player Turn, Waiting for Turn, Game Ending, Game Over
- **10+ Events**: Player actions, timer updates, game transitions
- **Guards**: Validation logic for state transitions
- **Actions**: Side effects and state updates

## Project Structure

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

## Testing

```bash
npm test              # Run unit tests
npm run test:e2e      # Run E2E tests with Playwright
npm run test:coverage # Run tests with coverage
```

## Development

```bash
npm run dev           # Start development server
npm run type-check    # Type check without building
npm run lint:fix      # Fix linting issues
```

## License

MIT
