import type { Match, ScorePrediction, StandingRow } from '../types/tournament';
import type { PredictedBracketMatch, ThirdPlaceSlot } from '../types/prediction';
import { isGroupStageComplete } from './standings';

export function validateGroupStep(matches: Match[], predictions: ScorePrediction[]): string[] {
  if (isGroupStageComplete(matches, predictions)) return [];
  return ['Completa todos los marcadores de fase de grupos antes de construir eliminatorias.'];
}

export function validateThirdPlaceAssignments(slots: ThirdPlaceSlot[], bestThirds: StandingRow[]): string[] {
  const errors: string[] = [];
  const validTeamIds = new Set(bestThirds.map((row) => row.teamId));
  const assigned = slots.map((slot) => slot.assignedTeamId).filter(Boolean) as string[];
  if (slots.some((slot) => !slot.assignedTeamId)) errors.push('Asigna un tercero clasificado a cada slot disponible.');
  if (new Set(assigned).size !== assigned.length) errors.push('No puedes repetir el mismo tercero en dos slots.');
  if (assigned.some((teamId) => !validTeamIds.has(teamId))) errors.push('Solo puedes usar equipos que estén entre los mejores terceros.');
  return errors;
}

export function validateKnockout(matches: PredictedBracketMatch[]): string[] {
  const missing = matches.filter((match) => match.homeTeamId && match.awayTeamId && (!match.advancingTeamId || match.homeScore === null || match.awayScore === null));
  if (missing.length) return ['Completa marcadores y clasificados en todas las eliminatorias disponibles.'];
  return [];
}
