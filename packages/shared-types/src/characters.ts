// Character roles in the game
export type CharacterRole =
  | 'player'
  | 'staff'
  | 'board'
  | 'press'
  | 'agent';

// Personality traits (all 0-100 scales)
export interface Personality {
  ambition: number;        // Career driven vs content
  loyalty: number;         // Club loyalty vs mercenary
  temperament: number;     // Calm (100) vs volatile (0)
  professionalism: number; // Professional vs unprofessional
  confidence: number;      // Self-belief level
  greed: number;           // Money motivated
}

// Character archetype for quick personality assignment
export type CharacterArchetype =
  | 'professional'   // High professionalism, medium ambition
  | 'mercenary'      // High greed, low loyalty
  | 'hothead'        // Low temperament, high confidence
  | 'leader'         // High loyalty, high professionalism
  | 'prospect'       // High ambition, medium confidence
  | 'veteran';       // Medium ambition, high loyalty

// Full character definition
export interface Character {
  id: string;
  name: string;
  role: CharacterRole;

  // Personality
  personality: Personality;
  archetype?: CharacterArchetype;

  // Dynamic state
  mood: number;              // Current happiness (0-100)
  trustInManager: number;    // Relationship with manager (0-100)

  // For players - link to game simulation
  playerId?: string;

  // For journalists
  journalistStyle?: 'tabloid' | 'analytical' | 'hostile' | 'friendly';
  publication?: string;

  // For agents
  agentClients?: string[];   // Player IDs they represent

  // For board members
  boardRole?: 'chairman' | 'director' | 'owner';
  boardPatience?: number;    // How patient with results (0-100)
}

// Generate personality from archetype
export function personalityFromArchetype(archetype: CharacterArchetype): Personality {
  const archetypes: Record<CharacterArchetype, Personality> = {
    professional: {
      ambition: 60,
      loyalty: 70,
      temperament: 80,
      professionalism: 90,
      confidence: 70,
      greed: 40,
    },
    mercenary: {
      ambition: 80,
      loyalty: 20,
      temperament: 50,
      professionalism: 60,
      confidence: 70,
      greed: 90,
    },
    hothead: {
      ambition: 70,
      loyalty: 50,
      temperament: 20,
      professionalism: 40,
      confidence: 85,
      greed: 50,
    },
    leader: {
      ambition: 60,
      loyalty: 90,
      temperament: 75,
      professionalism: 85,
      confidence: 80,
      greed: 30,
    },
    prospect: {
      ambition: 90,
      loyalty: 60,
      temperament: 60,
      professionalism: 70,
      confidence: 65,
      greed: 50,
    },
    veteran: {
      ambition: 40,
      loyalty: 85,
      temperament: 80,
      professionalism: 80,
      confidence: 70,
      greed: 40,
    },
  };

  return archetypes[archetype];
}
