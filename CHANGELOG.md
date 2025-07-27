# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-01-27

### Added

- Initial release of Real-time Card Game
- Complete state machine architecture using XState
- Turn-based multiplayer gameplay (2-4 players)
- 3-minute timer with automatic game ending
- Card matching rules (same value or ascending sequence)
- Real-time score tracking and updates
- Skip turn functionality when no valid moves
- Auto-play for single valid card scenarios
- Batch card selection with SPACE key
- Professional UI with Tailwind CSS
- Full TypeScript implementation
- Comprehensive game state management
- Winner determination based on lowest hand value
- Game over screen with final scores and statistics
- Restart functionality
- Responsive design for multiple screen sizes

### Technical Features

- React 19 with modern hooks
- XState 5 for state machine management
- TypeScript for type safety
- Vite for fast development and building
- ESLint for code quality
- Playwright for E2E testing
- Professional project structure and documentation

### Game Mechanics

- Scoring system: Ace=1, Numbers=face value, Jack=11, Queen=12, King=13
- Card validation with proper sequence checking
- Multi-card play validation
- Real-time timer countdown
- Turn-based player rotation
- Automatic game state transitions
- Comprehensive error handling and edge cases

## [1.1.0] - 2025-01-27

### Changed

- **BREAKING**: Removed manual skip turn functionality to align with original requirements
- Players with no valid moves now automatically advance to next player after 1.5 seconds
- Manual "Skip Turn" button removed from UI
- Updated messaging to show "advancing to next player" when no moves available
- Only allow manual game ending when NO players have valid moves (complete deadlock)
- Preserve 3-minute timer as primary game ending condition per original specification

### Improved

- Game behavior now strictly follows original requirements
- Turn-based alternating play maintained automatically
- Better user experience with clear auto-advancement messaging
- More accurate implementation of the specified game mechanics

## [Unreleased]

### Planned Features

- Multiplayer networking support
- Player avatars and customization
- Sound effects and animations
- Game replay functionality
- Tournament mode
- Mobile app version
