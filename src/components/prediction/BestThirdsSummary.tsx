import type { StandingRow, Team } from '../../types/tournament';
import { Badge } from '../ui/Badge';

export function BestThirdsSummary({ rows, teams }: { rows: StandingRow[]; teams: Team[] }) {
  return (
    <div className="rounded-2xl border border-cup-blue/25 bg-cup-blue/10 p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="font-black text-white">Mejores terceros</h3>
        <Badge tone="blue">{rows.length}/8</Badge>
      </div>
      <div className="flex flex-wrap gap-2">
        {rows.map((row) => {
          const team = teams.find((item) => item.id === row.teamId);
          return <Badge key={row.teamId} tone="blue">{team?.flagEmoji} {team?.name} · {row.points} pts · DG {row.goalDifference}</Badge>;
        })}
      </div>
    </div>
  );
}
