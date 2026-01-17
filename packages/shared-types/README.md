# @open-football/shared-types

Shared TypeScript types for the AI Football Manager system. This package provides the contract between:

- **React Frontend** (`ui-react/`)
- **Bridge Server** (`bridge/`)
- **Claude Code Skill** (`.claude/skills/football-manager-ai/`)
- **Rust Backend** (`src/`)

## Installation

```bash
pnpm add @open-football/shared-types
```

## Usage

```typescript
import type {
  PlayerState,
  GameState,
  ObservationResponse,
  ActRequest,
  Character,
  Conversation,
} from '@open-football/shared-types';
```

## Type Modules

### `game-state.ts` - Core Game Types

Types representing the game simulation state.

| Type | Description |
|------|-------------|
| `GameDate` | In-game date representation |
| `Position` | Simplified player position (GK, CB, ST, etc.) |
| `Contract` | Player contract details |
| `MatchPerformance` | Recent match statistics |
| `PlayerState` | Complete player state for AI context |
| `PlayerConcern` | What a player is unhappy about |
| `TeamState` | Team state including finances, morale |
| `UpcomingMatch` | Scheduled match details |
| `GameState` | Complete game snapshot |

### `skills.ts` - Detailed Player Skills

Detailed skill types aligned with Rust simulation.

| Type | Description |
|------|-------------|
| `TechnicalSkills` | 14 technical attributes (dribbling, passing, etc.) |
| `MentalSkills` | 14 mental attributes (composure, leadership, etc.) |
| `PhysicalSkills` | 9 physical attributes (pace, stamina, etc.) |
| `PlayerSkills` | Combined technical, mental, physical |
| `DetailedPosition` | Full position list matching Rust (22 positions) |
| `PositionProficiency` | Position with proficiency level |
| `DetailedContract` | Full contract with bonuses and clauses |

### `characters.ts` - Character Definitions

Types for NPCs (players, staff, press, agents).

| Type | Description |
|------|-------------|
| `CharacterRole` | Type of character (player, staff, press, etc.) |
| `Personality` | 6-trait personality model |
| `CharacterArchetype` | Preset personality types |
| `Character` | Full character definition |

### `conversations.ts` - Conversation System

Types for the dialogue system.

| Type | Description |
|------|-------------|
| `Message` | Single message in conversation |
| `MessageEmotion` | Emotional tone of message |
| `ConversationType` | What triggered the conversation |
| `Conversation` | Full conversation with history |
| `ConversationOutcome` | Result of conversation |
| `ConversationContext` | Context provided to AI |

### `memory.ts` - Memory System

Types for character memory and knowledge.

| Type | Description |
|------|-------------|
| `Promise` | Promise made by manager or character |
| `PromiseCategory` | Type of promise |
| `PromiseStatus` | Whether promise was kept/broken |
| `KnowledgeFact` | Something a character knows |
| `KnowledgeSource` | How they learned it |
| `CharacterKnowledge` | Complete knowledge state |
| `KnowledgeSpreadEvent` | How knowledge spreads |

### `events.ts` - Event System

Types for game events and notifications.

| Type | Description |
|------|-------------|
| `GameEvent` | Event that can trigger conversations |
| `GameEventType` | Type of event (match_result, player_dropped, etc.) |
| `GameEventData` | Event-specific data |
| `Notification` | Inbox notification |
| `NotificationPriority` | Urgency level |

### `api.ts` - API Contracts

Request/response types for all endpoints.

**Agent Endpoints** (Claude Skill → Bridge):
- `ObservationResponse` - GET /api/agent/observe
- `ActRequest` - POST /api/agent/act
- `AgentNextResponse` - GET /api/agent/next
- `AgentMessageRequest` - POST /api/agent/messages

**Frontend Endpoints** (React → Bridge):
- `InboxResponse` - GET /api/inbox
- `ConversationResponse` - GET /api/conversation/:id
- `SendMessageRequest/Response` - POST /api/conversation/:id/send
- `GameStateResponse` - GET /api/game/state
- `StartConversationRequest/Response` - POST /api/conversation/start

**Streaming**:
- `StreamEvent` - SSE event types

**Internal**:
- `BridgeState` - Bridge server state

## Key Type Relationships

```
┌─────────────────┐     ┌──────────────────┐
│  ObservationRes │────>│    GameState     │
│    (API out)    │     │   + PlayerState  │
└─────────────────┘     │   + TeamState    │
        │               └──────────────────┘
        │
        v
┌─────────────────┐     ┌──────────────────┐
│ ConversationCtx │────>│    Character     │
│  (AI context)   │     │  + Personality   │
└─────────────────┘     └──────────────────┘
        │
        v
┌─────────────────┐     ┌──────────────────┐
│   ActRequest    │────>│ ConversationOut  │
│   (AI action)   │     │   + Promise      │
└─────────────────┘     └──────────────────┘
```

## Position Mapping

The package provides two levels of position detail:

**Simplified** (`Position`): For UI display
```typescript
'GK' | 'CB' | 'LB' | 'RB' | 'LWB' | 'RWB' |
'CDM' | 'CM' | 'CAM' | 'LM' | 'RM' |
'LW' | 'RW' | 'CF' | 'ST'
```

**Detailed** (`DetailedPosition`): Matching Rust simulation
```typescript
'GK' | 'SW' | 'DL' | 'DCL' | 'DC' | 'DCR' | 'DR' |
'DM' | 'ML' | 'MCL' | 'MC' | 'MCR' | 'MR' |
'AML' | 'AMC' | 'AMR' | 'WL' | 'WR' |
'FL' | 'FC' | 'FR' | 'ST'
```

## Development

```bash
# Build
pnpm run build

# Watch mode
pnpm run watch

# Type check
pnpm run typecheck
```

## Versioning

This package follows semver. Breaking changes to type definitions require a major version bump since all consuming packages depend on these types.
