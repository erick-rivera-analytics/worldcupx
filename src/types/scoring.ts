import type { RoundCode } from './prediction';
import type { Stage } from './tournament';

export type ScoreCategory =
  | 'group_match'
  | 'group_position'
  | 'knockout_advancement'
  | 'knockout_match'
  | 'champion_bonus'
  | 'third_place_bonus';

export interface ScoringRules {
  groupExactScore: number;
  groupOutcome: number;
  groupPositionExact: number;
  advancementByRound: Record<'R32' | 'R16' | 'QF' | 'SF', number>;
  knockoutExactScore: number;
  knockoutOutcome: number;
  championBonus: number;
  thirdPlaceBonus: number;
}

export interface ScoreDetail {
  ticketId: string;
  category: ScoreCategory;
  stage: Stage;
  roundCode?: RoundCode | null;
  matchId?: string | null;
  predictedTeamId?: string | null;
  actualTeamId?: string | null;
  points: number;
  reason: string;
  createdAt: string;
}

export interface TicketScoreSummary {
  ticketId: string;
  groupMatchPoints: number;
  groupPositionPoints: number;
  knockoutAdvancementPoints: number;
  knockoutMatchPoints: number;
  championBonus: number;
  thirdPlaceBonus: number;
  totalPoints: number;
  exactScoresCount: number;
  outcomeHitsCount: number;
  updatedAt: string;
  details: ScoreDetail[];
}
