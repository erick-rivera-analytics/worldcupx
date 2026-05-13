import type { PredictedBracketMatch } from '../types/prediction';
import type { ScoringRules } from '../types/scoring';
import type { Match, ScorePrediction } from '../types/tournament';

export interface MatchScoreResult {
  points: number;
  exact: boolean;
  result: boolean;
}

function outcome(home: number, away: number): 'H' | 'D' | 'A' {
  if (home > away) return 'H';
  if (home < away) return 'A';
  return 'D';
}

export const DEFAULT_SCORING_RULES: ScoringRules = {
  groupExactScore: 3,
  groupOutcome: 1,
  groupPositionExact: 1,
  advancementByRound: {
    R32: 1,
    R16: 2,
    QF: 3,
    SF: 4
  },
  knockoutExactScore: 3,
  knockoutOutcome: 1,
  championBonus: 10,
  thirdPlaceBonus: 5
};

export function scoreGroupMatch(actual: Match, prediction: ScorePrediction): MatchScoreResult {
  if (actual.homeScore === null || actual.homeScore === undefined || actual.awayScore === null || actual.awayScore === undefined) {
    return { points: 0, exact: false, result: false };
  }
  if (prediction.homeScore === null || prediction.homeScore === undefined || prediction.awayScore === null || prediction.awayScore === undefined) {
    return { points: 0, exact: false, result: false };
  }

  const exact = actual.homeScore === prediction.homeScore && actual.awayScore === prediction.awayScore;
  if (exact) return { points: DEFAULT_SCORING_RULES.groupExactScore, exact: true, result: true };

  const result = outcome(actual.homeScore, actual.awayScore) === outcome(prediction.homeScore, prediction.awayScore);
  return { points: result ? DEFAULT_SCORING_RULES.groupOutcome : 0, exact: false, result };
}

export function scoreKnockoutMatch(actual: PredictedBracketMatch, prediction: PredictedBracketMatch): MatchScoreResult {
  if (!samePair(actual, prediction)) return { points: 0, exact: false, result: false };
  if (actual.homeScore === null || actual.homeScore === undefined || actual.awayScore === null || actual.awayScore === undefined) {
    return { points: 0, exact: false, result: false };
  }
  if (prediction.homeScore === null || prediction.homeScore === undefined || prediction.awayScore === null || prediction.awayScore === undefined) {
    return { points: 0, exact: false, result: false };
  }

  const normalizedPrediction = normalizePredictionOrder(actual, prediction);
  const exact = actual.homeScore === normalizedPrediction.homeScore && actual.awayScore === normalizedPrediction.awayScore;
  if (exact) return { points: DEFAULT_SCORING_RULES.knockoutExactScore, exact: true, result: true };

  const result = outcome(actual.homeScore, actual.awayScore) === outcome(normalizedPrediction.homeScore, normalizedPrediction.awayScore);
  return { points: result ? DEFAULT_SCORING_RULES.knockoutOutcome : 0, exact: false, result };
}

function samePair(actual: PredictedBracketMatch, prediction: PredictedBracketMatch): boolean {
  if (!actual.homeTeamId || !actual.awayTeamId || !prediction.homeTeamId || !prediction.awayTeamId) return false;
  return new Set([actual.homeTeamId, actual.awayTeamId]).size === 2 &&
    actual.homeTeamId !== actual.awayTeamId &&
    [actual.homeTeamId, actual.awayTeamId].every((teamId) => teamId === prediction.homeTeamId || teamId === prediction.awayTeamId);
}

function normalizePredictionOrder(actual: PredictedBracketMatch, prediction: PredictedBracketMatch): { homeScore: number; awayScore: number } {
  const homeScore = prediction.homeScore ?? 0;
  const awayScore = prediction.awayScore ?? 0;
  if (actual.homeTeamId === prediction.homeTeamId) return { homeScore, awayScore };
  return { homeScore: awayScore, awayScore: homeScore };
}

export function calculateProgress(predictions: ScorePrediction[], totalMatches: number, completedExtras = 0): number {
  if (!totalMatches) return 0;
  const completed = predictions.filter((prediction) => prediction.homeScore !== null && prediction.awayScore !== null).length;
  return Math.min(100, Math.round(((completed + completedExtras) / totalMatches) * 100));
}
