import type { Match, ScorePrediction, Team } from '../../types/tournament';
import { Input } from '../ui/Input';

export function GroupMatchCard({ match, teams, prediction, disabled, onChange }: {
  match: Match;
  teams: Team[];
  prediction?: ScorePrediction;
  disabled?: boolean;
  onChange: (home: number | null, away: number | null) => void;
}) {
  const home = teams.find((team) => team.id === match.homeTeamId);
  const away = teams.find((team) => team.id === match.awayTeamId);
  const homeValue = prediction?.homeScore ?? '';
  const awayValue = prediction?.awayScore ?? '';

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.07] p-4 transition hover:bg-white/[0.10]">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-xs font-bold text-white/45">
        <span>Partido {match.matchNo} · Grupo {match.groupCode}</span>
        <span>{match.venue}</span>
      </div>
      <div className="grid grid-cols-[1fr_72px_24px_72px_1fr] items-center gap-2">
        <div className="min-w-0 text-right font-black text-white"><span className="mr-2 text-xl">{home?.flagEmoji}</span>{home?.name}</div>
        <Input aria-label="Goles local" type="number" inputMode="numeric" min={0} max={30} disabled={disabled} value={homeValue} onChange={(event) => onChange(event.target.value === '' ? null : Number(event.target.value), prediction?.awayScore ?? null)} className="text-center text-2xl font-black" />
        <span className="text-center text-white/35">-</span>
        <Input aria-label="Goles visitante" type="number" inputMode="numeric" min={0} max={30} disabled={disabled} value={awayValue} onChange={(event) => onChange(prediction?.homeScore ?? null, event.target.value === '' ? null : Number(event.target.value))} className="text-center text-2xl font-black" />
        <div className="min-w-0 font-black text-white"><span className="mr-2 text-xl">{away?.flagEmoji}</span>{away?.name}</div>
      </div>
    </div>
  );
}
