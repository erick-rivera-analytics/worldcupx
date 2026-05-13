import type { Match, ScorePrediction, Team } from '../../types/tournament';
import { Input } from '../ui/Input';

export function AdminGroupResultsPanel({ matches, teams, results, onChange }: {
  matches: Match[];
  teams: Team[];
  results: ScorePrediction[];
  onChange: (matchId: string, homeScore: number | null, awayScore: number | null) => void;
}) {
  return (
    <div className="space-y-3">
      {matches.map((match) => {
        const home = teams.find((team) => team.id === match.homeTeamId);
        const away = teams.find((team) => team.id === match.awayTeamId);
        const result = results.find((item) => item.matchId === match.id);
        return (
          <div key={match.id} className="rounded-2xl border border-white/10 bg-white/[0.06] p-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-xs font-bold text-white/45">
              <span>Partido {match.matchNo} · Grupo {match.groupCode}</span>
              <span>{match.venue}</span>
            </div>
            <div className="grid grid-cols-[1fr_80px_24px_80px_1fr] items-center gap-2">
              <div className="text-right font-black text-white">{home?.flagEmoji} {home?.name}</div>
              <Input type="number" min={0} max={30} value={result?.homeScore ?? ''} onChange={(event) => onChange(match.id, event.target.value === '' ? null : Number(event.target.value), result?.awayScore ?? null)} className="text-center text-xl font-black" />
              <span className="text-center text-white/35">-</span>
              <Input type="number" min={0} max={30} value={result?.awayScore ?? ''} onChange={(event) => onChange(match.id, result?.homeScore ?? null, event.target.value === '' ? null : Number(event.target.value))} className="text-center text-xl font-black" />
              <div className="font-black text-white">{away?.flagEmoji} {away?.name}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
