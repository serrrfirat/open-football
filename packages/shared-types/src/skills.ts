// Player skills - aligned with Rust core simulation types

// Technical skills (all 0-20 scale, matching Rust)
export interface TechnicalSkills {
  corners: number;
  crossing: number;
  dribbling: number;
  finishing: number;
  firstTouch: number;
  freeKicks: number;
  heading: number;
  longShots: number;
  longThrows: number;
  marking: number;
  passing: number;
  penaltyTaking: number;
  tackling: number;
  technique: number;
}

// Mental skills (all 0-20 scale)
export interface MentalSkills {
  aggression: number;
  anticipation: number;
  bravery: number;
  composure: number;
  concentration: number;
  decisions: number;
  determination: number;
  flair: number;
  leadership: number;
  offTheBall: number;
  positioning: number;
  teamwork: number;
  vision: number;
  workRate: number;
}

// Physical skills (all 0-20 scale)
export interface PhysicalSkills {
  acceleration: number;
  agility: number;
  balance: number;
  jumping: number;
  naturalFitness: number;
  pace: number;
  stamina: number;
  strength: number;
  matchReadiness: number;
}

// Complete player skills
export interface PlayerSkills {
  technical: TechnicalSkills;
  mental: MentalSkills;
  physical: PhysicalSkills;
}

// Preferred foot
export type PreferredFoot = 'left' | 'right' | 'both';

// Contract types from Rust
export type ContractType =
  | 'part_time'
  | 'full_time'
  | 'amateur'
  | 'youth'
  | 'non_contract';

// Squad status from Rust
export type SquadStatus =
  | 'key_player'
  | 'first_team_regular'
  | 'rotation'
  | 'backup'
  | 'hot_prospect'
  | 'decent_youngster'
  | 'not_needed'
  | 'not_set';

// Transfer status from Rust
export type TransferStatus =
  | 'transfer_listed'
  | 'loan_listed'
  | 'transfer_and_loan_listed';

// Contract bonus types from Rust
export type ContractBonusType =
  | 'appearance_fee'
  | 'goal_fee'
  | 'clean_sheet_fee'
  | 'team_of_the_year'
  | 'top_goalscorer'
  | 'promotion_fee'
  | 'avoid_relegation_fee'
  | 'international_cap_fee'
  | 'unused_substitution_fee';

export interface ContractBonus {
  type: ContractBonusType;
  value: number;
}

// Contract clause types from Rust
export type ContractClauseType =
  | 'minimum_fee_release'
  | 'relegation_fee_release'
  | 'non_promotion_release'
  | 'yearly_wage_rise'
  | 'promotion_wage_increase'
  | 'relegation_wage_decrease'
  | 'sell_on_fee'
  | 'sell_on_fee_profit'
  | 'optional_extension_by_club';

export interface ContractClause {
  type: ContractClauseType;
  value: number;
}

// Detailed contract from Rust
export interface DetailedContract {
  shirtNumber?: number;
  salary: number;
  contractType: ContractType;
  squadStatus: SquadStatus;
  isTransferListed: boolean;
  transferStatus?: TransferStatus;
  startedAt?: string;   // ISO date
  expiresAt: string;    // ISO date
  bonuses: ContractBonus[];
  clauses: ContractClause[];
}

// Position group
export type PositionGroup =
  | 'goalkeeper'
  | 'defender'
  | 'midfielder'
  | 'forward';

// Detailed position with proficiency level
export interface PositionProficiency {
  position: DetailedPosition;
  level: number;  // 0-20
}

// Detailed positions matching Rust PlayerPositionType
export type DetailedPosition =
  | 'GK'   // Goalkeeper
  | 'SW'   // Sweeper
  | 'DL'   // Defender Left
  | 'DCL'  // Defender Center Left
  | 'DC'   // Defender Center
  | 'DCR'  // Defender Center Right
  | 'DR'   // Defender Right
  | 'DM'   // Defensive Midfielder
  | 'ML'   // Midfielder Left
  | 'MCL'  // Midfielder Center Left
  | 'MC'   // Midfielder Center
  | 'MCR'  // Midfielder Center Right
  | 'MR'   // Midfielder Right
  | 'AML'  // Attacking Midfielder Left
  | 'AMC'  // Attacking Midfielder Center
  | 'AMR'  // Attacking Midfielder Right
  | 'WL'   // Wingback Left
  | 'WR'   // Wingback Right
  | 'FL'   // Forward Left
  | 'FC'   // Forward Center
  | 'FR'   // Forward Right
  | 'ST';  // Striker

// Helper to get position group
export function getPositionGroup(position: DetailedPosition): PositionGroup {
  switch (position) {
    case 'GK':
      return 'goalkeeper';
    case 'SW':
    case 'DL':
    case 'DCL':
    case 'DC':
    case 'DCR':
    case 'DR':
    case 'DM':
      return 'defender';
    case 'ML':
    case 'MCL':
    case 'MC':
    case 'MCR':
    case 'MR':
    case 'AML':
    case 'AMC':
    case 'AMR':
    case 'WL':
    case 'WR':
      return 'midfielder';
    case 'FL':
    case 'FC':
    case 'FR':
    case 'ST':
      return 'forward';
  }
}

// Calculate skill averages
export function calculateTechnicalAverage(skills: TechnicalSkills): number {
  const values = Object.values(skills);
  return values.reduce((sum, val) => sum + val, 0) / values.length;
}

export function calculateMentalAverage(skills: MentalSkills): number {
  const values = Object.values(skills);
  return values.reduce((sum, val) => sum + val, 0) / values.length;
}

export function calculatePhysicalAverage(skills: PhysicalSkills): number {
  // Exclude matchReadiness from average (it's dynamic state, not skill)
  const { matchReadiness, ...skillValues } = skills;
  const values = Object.values(skillValues);
  return values.reduce((sum, val) => sum + val, 0) / values.length;
}

export function calculateOverallRating(skills: PlayerSkills): number {
  const technical = calculateTechnicalAverage(skills.technical);
  const mental = calculateMentalAverage(skills.mental);
  const physical = calculatePhysicalAverage(skills.physical);

  // Weighted average - technical skills matter most for overall rating
  return (technical * 0.4 + mental * 0.35 + physical * 0.25);
}
