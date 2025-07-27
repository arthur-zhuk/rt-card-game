# Real-time Card Game State Machine Architecture

## StateMachine

│
├── Config
│ └── Parallel: false
│
├── Context
│ ├── players: Player[]
│ ├── currentPlayerIndex: number
│ ├── deck: Card[]
│ ├── discardPile: Card[]
│ ├── gameTimer: number
│ ├── selectedCards: Card[]
│ ├── gameId: string
│ ├── roundStartTime: Date | null
│ ├── finalScores: PlayerScore[]
│ ├── winner: PlayerScore | null
│ ├── autoPlayNotifications: AutoPlayNotification[]
│ └── gameEndReason: GameEndReason
│
├── States
│ ├── LOBBY
│ │ ├── Description: Initial state where players join the game
│ │ └── Valid Events: PLAYER_JOIN(), START_GAME()
│ ├── GAME_STARTING
│ │ ├── Description: Transition state for dealing cards and setup
│ │ └── Valid Events: (automatic transition after 1000ms)
│ ├── PLAYER_TURN
│ │ ├── Description: Active player can select and play cards
│ │ └── Valid Events: CARD_SELECTED(), CARD_DESELECTED(), PLAY_CARDS(), AUTO_PLAY(), SKIP_TURN(), END_GAME(), TIMER_TICK()
│ ├── WAITING_FOR_TURN
│ │ ├── Description: Transition state to determine next player
│ │ └── Valid Events: TIMER_TICK(), (automatic transition after 500ms)
│ ├── GAME_ENDING
│ │ ├── Description: Calculate final scores and determine winner
│ │ └── Valid Events: (automatic transition after 2000ms)
│ └── GAME_OVER
│ ├── Description: Display final results and allow restart
│ └── Valid Events: RESTART_GAME(), LEAVE_GAME()
│
├── Events
│ ├── PLAYER_JOIN()
│ │ ├── Trigger: User clicks "Add Player" button
│ │ └── Data: { playerId: string, playerName: string }
│ ├── START_GAME()
│ │ ├── Trigger: User clicks "Start Game" button
│ │ └── Data: none
│ ├── CARD_SELECTED()
│ │ ├── Trigger: Player clicks on a card in their hand
│ │ └── Data: { cardId: string, playerId: string }
│ ├── CARD_DESELECTED()
│ │ ├── Trigger: Player clicks on already selected card
│ │ └── Data: { cardId: string, playerId: string }
│ ├── PLAY_CARDS()
│ │ ├── Trigger: Player clicks "Play" button or presses SPACE
│ │ └── Data: { cards: Card[], playerId: string }
│ ├── AUTO_PLAY()
│ │ ├── Trigger: System detects single valid card scenario
│ │ └── Data: { card: Card, playerId: string }
│ ├── SKIP_TURN()
│ │ ├── Trigger: System detects no valid moves scenario
│ │ └── Data: none
│ ├── TIMER_TICK()
│ │ ├── Trigger: Game timer decrements every second
│ │ └── Data: { remainingTime: number }
│ ├── END_GAME()
│ │ ├── Trigger: Player clicks "End Game" button
│ │ └── Data: none
│ ├── RESTART_GAME()
│ │ ├── Trigger: Player clicks "Restart" button on game over screen
│ │ └── Data: none
│ └── LEAVE_GAME()
│ ├── Trigger: Player clicks "Leave" button
│ └── Data: { playerId: string }
│
├── Guards
│ ├── hasMinimumPlayers()
│ │ └── Purpose: Ensures at least 2 players before starting; references context.players.length
│ ├── isCurrentPlayer()
│ │ └── Purpose: Validates player is current turn holder; references context.currentPlayerIndex and event.playerId
│ ├── canPlayCards()
│ │ └── Purpose: Validates card combination is legal; references context.discardPile and event.cards
│ ├── isTimerExpired()
│ │ └── Purpose: Checks if game timer reached zero; references event.remainingTime
│ ├── hasAnyValidMoves()
│ │ └── Purpose: Checks if any player has playable cards; references context.players and context.discardPile
│ ├── isPlayerHandEmpty()
│ │ └── Purpose: Detects win condition when player empties hand; references player.hand.length
│ └── isCardInHand()
│ └── Purpose: Validates card belongs to player; references context.players and event.cardId
│
├── Transitions
│ ├── LOBBY → GAME_STARTING
│ │ ├── Event: START_GAME()
│ │ ├── Guard: hasMinimumPlayers()
│ │ ├── Exit Action (LOBBY): none
│ │ ├── Entry Action (GAME_STARTING): initializeGame()
│ │ ├── Transition Action: none
│ │ └── Target: GAME_STARTING
│ ├── GAME_STARTING → PLAYER_TURN
│ │ ├── Event: (automatic after 1000ms)
│ │ ├── Guard: none
│ │ ├── Exit Action (GAME_STARTING): none
│ │ ├── Entry Action (PLAYER_TURN): clearSelectedCards()
│ │ ├── Transition Action: dealCardsAndSetupDiscard()
│ │ └── Target: PLAYER_TURN
│ ├── PLAYER_TURN → WAITING_FOR_TURN
│ │ ├── Event: PLAY_CARDS() | AUTO_PLAY() | SKIP_TURN()
│ │ ├── Guard: canPlayCards() (for PLAY_CARDS/AUTO_PLAY)
│ │ ├── Exit Action (PLAYER_TURN): none
│ │ ├── Entry Action (WAITING_FOR_TURN): advanceToNextPlayer()
│ │ ├── Transition Action: updateGameState()
│ │ └── Target: WAITING_FOR_TURN
│ ├── PLAYER_TURN → GAME_ENDING
│ │ ├── Event: TIMER_TICK() | END_GAME() | PLAY_CARDS() | AUTO_PLAY()
│ │ ├── Guard: isTimerExpired() | isPlayerHandEmpty()
│ │ ├── Exit Action (PLAYER_TURN): none
│ │ ├── Entry Action (GAME_ENDING): calculateFinalScores()
│ │ ├── Transition Action: setGameEndReason()
│ │ └── Target: GAME_ENDING
│ ├── WAITING_FOR_TURN → PLAYER_TURN
│ │ ├── Event: (automatic after 500ms)
│ │ ├── Guard: hasAnyValidMoves()
│ │ ├── Exit Action (WAITING_FOR_TURN): none
│ │ ├── Entry Action (PLAYER_TURN): clearSelectedCards()
│ │ ├── Transition Action: none
│ │ └── Target: PLAYER_TURN
│ ├── WAITING_FOR_TURN → GAME_ENDING
│ │ ├── Event: (automatic after 500ms) | TIMER_TICK()
│ │ ├── Guard: !hasAnyValidMoves() | isTimerExpired()
│ │ ├── Exit Action (WAITING_FOR_TURN): none
│ │ ├── Entry Action (GAME_ENDING): calculateFinalScores()
│ │ ├── Transition Action: setGameEndReason()
│ │ └── Target: GAME_ENDING
│ ├── GAME_ENDING → GAME_OVER
│ │ ├── Event: (automatic after 2000ms)
│ │ ├── Guard: none
│ │ ├── Exit Action (GAME_ENDING): none
│ │ ├── Entry Action (GAME_OVER): none
│ │ ├── Transition Action: none
│ │ └── Target: GAME_OVER
│ └── GAME_OVER → LOBBY
│ ├── Event: RESTART_GAME()
│ ├── Guard: none
│ ├── Exit Action (GAME_OVER): none
│ ├── Entry Action (LOBBY): none
│ ├── Transition Action: resetGameState()
│ └── Target: LOBBY
│
└── Actions
├── initializeGame()
│ ├── Type: ENTRY (GAME_STARTING)
│ └── Side Effect: Create deck, set timer to 180s, record start time
├── clearSelectedCards()
│ ├── Type: ENTRY (PLAYER_TURN)
│ └── Side Effect: Reset selectedCards array to empty
├── dealCardsAndSetupDiscard()
│ ├── Type: TRANSITION (GAME_STARTING → PLAYER_TURN)
│ └── Side Effect: Deal 7 cards to each player, place first card on discard pile
├── advanceToNextPlayer()
│ ├── Type: ENTRY (WAITING_FOR_TURN)
│ └── Side Effect: Find next player with valid moves, update currentPlayerIndex
├── updateGameState()
│ ├── Type: TRANSITION (PLAYER_TURN → WAITING_FOR_TURN)
│ └── Side Effect: Update discard pile, remove cards from hand, add notifications
├── calculateFinalScores()
│ ├── Type: ENTRY (GAME_ENDING)
│ └── Side Effect: Calculate hand values, determine winner, populate finalScores
├── setGameEndReason()
│ ├── Type: TRANSITION (→ GAME_ENDING)
│ └── Side Effect: Set gameEndReason based on trigger (timer_expired, no_valid_moves, manual_end, player_won)
└── resetGameState()
├── Type: TRANSITION (GAME_OVER → LOBBY)
└── Side Effect: Reset all context to initial values, generate new gameId

## Implementation Notes

### Auto-Play Logic

- **Single Valid Card**: Instantly plays the only available card without user interaction
- **No Valid Cards**: Instantly skips turn when player has no playable cards
- **Multiple Valid Cards**: Requires manual selection and play action

### Card Validation Rules

- **Same Value**: 7 on 7, Queen on Queen
- **Ascending Sequence**: 8 on 7, Jack on 10, Ace on King (wraps around)
- **Multiple Card Combinations**:
  - All same value (multiple 7s on a 7)
  - All individually valid (7s and 8s on a 7)
  - Sum equals discard value (2+3=5 on a 5)

### Timer Management

- **3-minute countdown** from game start
- **Automatic game ending** when timer expires
- **Real-time updates** every second via TIMER_TICK events

### Notification System

- **Auto-play notifications** show what cards were played automatically
- **Floating UI elements** with slide-in animations
- **Automatic cleanup** keeps only last 10 notifications

### Game End Scenarios

1. **Timer Expired**: 3-minute limit reached
2. **No Valid Moves**: All players stuck with unplayable cards
3. **Manual End**: Player triggers end game button
4. **Player Won**: Someone empties their hand completely

### Scoring System

- **Ace**: 1 point
- **Number cards (2-10)**: Face value
- **Jack**: 11 points
- **Queen**: 12 points
- **King**: 13 points
- **Objective**: Lowest total hand value wins
