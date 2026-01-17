# Parallel Implementation Workstreams

This document defines independent workstreams that can be implemented in parallel by separate agents. Each stream has clear inputs, outputs, and interfaces.

---

## Stream Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        PARALLEL WORKSTREAMS                              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │   STREAM A   │  │   STREAM B   │  │   STREAM C   │  │   STREAM D   │ │
│  │   React UI   │  │ Bridge Server│  │  Rust API    │  │ Claude Skill │ │
│  │   🟡 ~70%    │  │   🟢 ~95%    │  │   🔴 ~10%    │  │   🟢 ~90%    │ │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘ │
│         │                 │                 │                 │          │
│         └─────────────────┴─────────────────┴─────────────────┘          │
│                                   │                                      │
│                         ┌─────────▼─────────┐                           │
│                         │    STREAM E       │                           │
│                         │  Shared Types     │                           │
│                         │  ✅ COMPLETE      │                           │
│                         └───────────────────┘                           │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Stream E: Shared Types ✅ COMPLETE

**Location**: `/packages/shared-types/`

**Status**: **COMPLETE** - All types defined, compiled, and documented.

**Description**: TypeScript types shared between frontend, bridge server, and skill. This is the contract that enables parallel development.

**Files Created**:
```
packages/shared-types/
├── package.json
├── tsconfig.json
├── README.md              # Full documentation
├── src/
│   ├── index.ts           # Barrel exports
│   ├── game-state.ts      # GameState, Player, Team, Match types
│   ├── characters.ts      # Character, Personality, Mood types
│   ├── conversations.ts   # Message, Conversation, ConversationOutcome
│   ├── memory.ts          # Promise, KnowledgeFact, CharacterKnowledge
│   ├── events.ts          # GameEvent, EventType, Notification
│   ├── api.ts             # Request/Response types for all endpoints
│   └── skills.ts          # NEW: Detailed skills aligned with Rust
```

**Key Types Defined**:
```typescript
// api.ts - The contract between all systems
export interface ObservationResponse {
  gameDate: GameDate;
  team: TeamState;
  players: PlayerState[];
  recentEvents: GameEvent[];
  activeConversation?: ConversationContext;
  pendingNotifications: Notification[];
  activePromises: Promise[];
  recentKnowledge: KnowledgeFact[];
}

export interface ActRequest {
  type: ActType;  // 'respond' | 'trigger_event' | 'update_memory' | 'end_conversation'
  payload: ActPayload;
}

// skills.ts - Detailed player attributes matching Rust
export interface PlayerSkills {
  technical: TechnicalSkills;  // 14 attributes
  mental: MentalSkills;        // 14 attributes
  physical: PhysicalSkills;    // 9 attributes
}

export type DetailedPosition =
  | 'GK' | 'SW' | 'DL' | 'DCL' | 'DC' | 'DCR' | 'DR'
  | 'DM' | 'ML' | 'MCL' | 'MC' | 'MCR' | 'MR'
  | 'AML' | 'AMC' | 'AMR' | 'WL' | 'WR'
  | 'FL' | 'FC' | 'FR' | 'ST';
```

**Completion Criteria**:
- [x] All types compile without errors
- [x] Types exported as npm package
- [x] README with type documentation

**Usage**:
```typescript
import type { ObservationResponse, ActRequest, Character } from '@open-football/shared-types';
```

**Blocks**: Streams A, B, D (they import these types) - **NOW UNBLOCKED**

---

## Stream A: React Frontend

**Location**: `/ui-react/`

**Description**: New React frontend with inbox, conversation UI, and game views.

**Dependencies**: Stream E (shared-types)

**Files to Create**:
```
ui-react/
├── package.json
├── vite.config.ts
├── tsconfig.json
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── routes/
│   │   ├── index.tsx           # Home/Dashboard
│   │   ├── inbox.tsx           # Event inbox
│   │   ├── conversation.tsx    # Chat interface
│   │   ├── squad.tsx           # Squad view
│   │   └── match.tsx           # Match view
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── Layout.tsx
│   │   ├── inbox/
│   │   │   ├── InboxList.tsx
│   │   │   ├── InboxItem.tsx
│   │   │   └── NotificationBadge.tsx
│   │   ├── conversation/
│   │   │   ├── ChatWindow.tsx
│   │   │   ├── MessageBubble.tsx
│   │   │   ├── CharacterAvatar.tsx
│   │   │   └── InputBar.tsx
│   │   └── game/
│   │       ├── PlayerCard.tsx
│   │       ├── TeamStats.tsx
│   │       └── MatchResult.tsx
│   ├── hooks/
│   │   ├── useConversation.ts
│   │   ├── useInbox.ts
│   │   └── useGameState.ts
│   ├── services/
│   │   ├── api.ts              # HTTP client
│   │   └── bridgeClient.ts     # Bridge server connection
│   └── stores/
│       ├── gameStore.ts        # Zustand store
│       └── conversationStore.ts
```

**Mock Data Strategy**:
- Create `/src/mocks/` with sample data matching shared types
- Use MSW (Mock Service Worker) to intercept API calls during development
- Frontend can be fully developed without backend

**Key Features to Build**:
1. Inbox with event list (polling `/api/agent/messages`)
2. Conversation chat UI with streaming support
3. Character portrait/avatar display
4. Basic squad view (can reuse data from existing Angular)

**Completion Criteria**:
- [ ] Can render inbox with mock events
- [ ] Can have mock conversation with fake responses
- [ ] Responsive layout works on desktop
- [ ] Connected to bridge server endpoints (even if they return mocks)

**Can Start**: After Stream E has basic types
**Independent From**: Streams B, C, D (uses mocks)

---

## Stream B: Node Bridge Server

**Location**: `/bridge/`

**Description**: TypeScript/Node server that bridges React frontend, Rust backend, and Claude agent.

**Dependencies**: Stream E (shared-types)

**Files to Create**:
```
bridge/
├── package.json
├── tsconfig.json
├── src/
│   ├── index.ts                # Server entry point
│   ├── server.ts               # Express/Fastify setup
│   ├── routes/
│   │   ├── agent.ts            # /api/agent/* endpoints
│   │   ├── conversation.ts     # /api/conversation/* endpoints
│   │   └── game.ts             # /api/game/* proxy to Rust
│   ├── services/
│   │   ├── bridgeState.ts      # In-memory state (like iso-city)
│   │   ├── messageQueue.ts     # Message queue for agent
│   │   ├── observationBuilder.ts # Build observation from Rust data
│   │   └── rustClient.ts       # HTTP client to Rust backend
│   ├── memory/
│   │   ├── promiseStore.ts     # Promise tracking
│   │   ├── knowledgeGraph.ts   # Character knowledge
│   │   └── conversationLog.ts  # Conversation history
│   ├── middleware/
│   │   ├── auth.ts             # Token validation
│   │   └── cors.ts
│   └── types/
│       └── internal.ts         # Bridge-specific types
```

**API Endpoints to Implement**:
```typescript
// Agent endpoints (called by Claude skill)
GET  /api/agent/observe          // Get current game state + character context
POST /api/agent/act              // Queue action (respond, trigger event)
GET  /api/agent/next             // Get next queued action to execute
POST /api/agent/messages         // Post message to chat

// Frontend endpoints
GET  /api/inbox                  // Get pending events/notifications
GET  /api/conversation/:id       // Get conversation history
POST /api/conversation/:id/send  // Send player message
GET  /api/game/state             // Proxy to Rust for game state

// Streaming
GET  /api/agent/stream           // SSE for real-time updates
```

**In-Memory State** (like iso-city):
```typescript
interface BridgeState {
  latestObservation: ObservationResponse | null;
  actionQueue: ActRequest[];
  messageHistory: Message[];
  activeConversations: Map<string, Conversation>;
  promiseStore: Promise[];
  knowledgeGraph: Map<string, KnowledgeFact[]>;
}
```

**Completion Criteria**:
- [x] Server starts and responds to health check
- [x] Agent endpoints work with mock data
- [x] Frontend endpoints work with mock data
- [x] Can proxy requests to Rust backend
- [x] In-memory state persists across requests
- [x] SSE streaming endpoint (`/api/agent/stream`)
- [x] ObservationBuilder service for combining Rust + Bridge data
- [x] RustClient enhanced with AI endpoint placeholders
- [x] Inbox endpoints with read/dismiss functionality
- [x] Event emitter pattern for real-time broadcasting
- [ ] End-to-end testing with live Rust backend

**Recent Updates**:
- Added SSE streaming at `/api/agent/stream` with heartbeat
- Created `observationBuilder.ts` to build ObservationResponse from Rust data + BridgeState
- Enhanced `rustClient.ts` with AI-specific endpoints (getPlayerState, getTeamAIState, getSquadState, getRecentEvents)
- Added proper inbox endpoints: GET `/api/inbox`, POST `/api/inbox/:id/read`, POST `/api/inbox/:id/dismiss`
- Added dev-only seed endpoint: POST `/api/notifications/seed`
- Integrated event emitter in BridgeState for SSE broadcasting
- All TypeScript compiles without errors

**Can Start**: After Stream E has basic types
**Independent From**: Streams A, C, D (they connect via HTTP)

---

## Stream C: Rust API Extensions

**Location**: Existing `/src/server/` and `/src/core/`

**Description**: Extend open-football Rust backend with new endpoints for AI integration.

**Dependencies**: None (existing codebase)

**Files to Modify/Create**:
```
src/server/src/
├── routes.rs                    # Add new routes
├── handlers/
│   ├── mod.rs
│   ├── player_state.rs          # NEW: Player mood, form, contract
│   ├── team_state.rs            # NEW: Squad, finances, board
│   └── match_events.rs          # NEW: Recent match events
```

**New Endpoints to Add**:
```rust
// Player state for AI context
GET /api/players/{player_id}/state
Response: {
  id, name, age, position,
  mood: 0-100,
  form: 0-100,
  contract: { salary, expires_at },
  recent_matches: [{ date, started, minutes, goals, rating }],
  concerns: ["playing_time", "contract"]
}

// Team state for AI context
GET /api/teams/{team_slug}/ai-state
Response: {
  name, league_position,
  recent_form: "WWLDW",
  finances: { balance, wage_bill },
  board_confidence: 0-100,
  upcoming_matches: [...]
}

// Squad with all player states
GET /api/teams/{team_slug}/squad-state
Response: {
  players: [PlayerState],
  team_morale: 0-100,
  relationships: [{ player_a, player_b, type: "friend" | "rival" }]
}

// Event hooks (for AI triggers)
GET /api/events/recent?since={timestamp}
Response: {
  events: [
    { type: "match_result", data: {...} },
    { type: "player_dropped", data: { player_id, match_id } },
    { type: "contract_expiring", data: { player_id, months_left } }
  ]
}
```

**Mood/State System** (new in core):
```rust
// src/core/src/club/player/mood.rs
pub struct PlayerMood {
    pub happiness: u8,        // 0-100
    pub trust_in_manager: u8, // 0-100
    pub concerns: Vec<Concern>,
}

pub enum Concern {
    PlayingTime,
    Contract,
    TeamPerformance,
    PersonalForm,
}
```

**Completion Criteria**:
- [ ] New endpoints return valid JSON
- [ ] Player mood calculated from game state
- [ ] Events endpoint returns recent happenings
- [ ] Existing functionality not broken

**Can Start**: Immediately
**Independent From**: Streams A, B, D (they consume via HTTP)

---

## Stream D: Claude Code Skill

**Location**: `/.claude/skills/football-manager-ai/`

**Description**: Claude Code skill that powers the AI brain, roleplay characters, and generate events.

**Dependencies**: Stream E (to understand API types)

**Files to Create**:
```
.claude/skills/football-manager-ai/
├── SKILL.md                     # Main skill instructions
├── prompts/
│   ├── system.md               # Base system prompt
│   ├── characters/
│   │   ├── player-unhappy.md   # Unhappy player template
│   │   ├── player-contract.md  # Contract negotiation
│   │   ├── journalist.md       # Press conference
│   │   └── agent.md            # Transfer agent
│   └── scenarios/
│       ├── dropped-player.md
│       ├── broken-promise.md
│       └── press-conference.md
├── examples/
│   ├── unhappy-player-conversation.md
│   └── press-conference-example.md
└── loop.sh                      # Optional: persistent loop script
```

**SKILL.md Structure**:
```markdown
# Football Manager AI

You are the AI brain for a football management game. You roleplay
all NPCs and generate dramatic events.

## Connection
- Bridge server: http://localhost:3001
- Token: Use environment variable AGENT_BRIDGE_TOKEN

## Main Loop
1. Poll GET /api/agent/observe for game state
2. Check if any character should initiate contact
3. If yes, POST /api/agent/act with trigger_event
4. When in conversation, respond in character

## Character Roleplay Rules
- ALWAYS stay in character
- Reference specific past events from memory
- React based on personality scores
- Never break the fourth wall
- End conversations with clear outcomes

## Observation Format
[Document the ObservationResponse structure]

## Action Format
[Document the ActRequest structure]

## Character Templates
See /prompts/characters/ for personality templates
```

**Prompt Engineering Focus**:
1. Character voice consistency (each player sounds different)
2. Memory retrieval (referencing past promises)
3. Emotional calibration (temperament affects responses)
4. Outcome extraction (did player agree? what was decided?)

**Completion Criteria**:
- [ ] Skill can connect to bridge server
- [ ] Can roleplay one character convincingly
- [ ] Responses reference context from observation
- [ ] Clear action format for bridge server

**Can Start**: After Stream E types defined
**Independent From**: Streams A, B, C (communicates via HTTP)

---

## Integration Points

### Shared Contracts (All Streams Must Agree)

**1. Observation Format** (C → B → D):
- Rust provides raw game data
- Bridge transforms to ObservationResponse
- Skill consumes for context

**2. Action Format** (D → B → A):
- Skill sends ActRequest
- Bridge queues and executes
- Frontend polls for updates

**3. Conversation Flow** (A ↔ B ↔ D):
- Frontend sends player message
- Bridge forwards to skill context
- Skill responds in character
- Bridge stores and returns to frontend

### Mock Strategy for Parallel Development

**Stream A (React)**:
- MSW intercepts all `/api/*` calls
- Returns mock data matching types

**Stream B (Bridge)**:
- Mock Rust responses until C is ready
- Mock skill responses until D is ready

**Stream D (Skill)**:
- Use curl/httpie to test against bridge
- Create test harness with sample observations

---

## Recommended Execution Order

```
Week 1:
├── Stream E: Shared Types ✅ COMPLETE
│   └── Types defined, compiled, documented
│
├── All other streams can now start in parallel:
│
├── Stream A: React Frontend (1 agent)
│   └── Import types from @open-football/shared-types
│
├── Stream B: Bridge Server (1 agent)
│   └── Import types from @open-football/shared-types
│
├── Stream C: Rust Extensions (1 agent)
│   └── No TypeScript dependency, can work independently
│
├── Stream D: Claude Skill (1 agent)
│   └── Reference types documentation in README.md

Week 2-3:
└── Integration: Wire everything together
```

---

## Agent Assignment Suggestions

| Stream | Complexity | Estimated Effort | Status |
|--------|------------|------------------|--------|
| E: Types | Low | 2-3 hours | ✅ **COMPLETE** |
| A: React | Medium | 2-3 days | 🟡 ~70% - Has routes, inbox, layout. Missing: API hooks, stores, full conversation UI |
| B: Bridge | Medium | 2-3 days | 🟢 ~95% - Has SSE streaming, observationBuilder, RustClient, inbox endpoints. Missing: E2E testing |
| C: Rust | Medium | 1-2 days | 🔴 ~10% - Existing routes only. Missing: AI endpoints (mood, ai-state, squad-state) |
| D: Skill | High | 2-3 days | 🟢 ~90% - Has SKILL.md, prompts, examples. Missing: Test with live bridge |

---

## Testing Integration

Once all streams have basic implementation:

1. Start Rust backend: `cargo run`
2. Start Bridge server: `cd bridge && npm run dev`
3. Start React frontend: `cd ui-react && npm run dev`
4. Activate skill: Open Claude Code, run skill
5. Trigger test event manually
6. Verify end-to-end flow

---

## File Locations Summary

```
/kolkata
├── packages/
│   └── shared-types/          # Stream E
├── ui-react/                   # Stream A
├── bridge/                     # Stream B
├── src/                        # Stream C (existing Rust)
│   ├── server/
│   └── core/
└── .claude/
    └── skills/
        └── football-manager-ai/  # Stream D
```
