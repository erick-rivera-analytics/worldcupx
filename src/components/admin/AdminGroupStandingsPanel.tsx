import type { StandingRow, Team } from '../../types/tournament';
import { GroupStandingsPreview } from '../prediction/GroupStandingsPreview';
import { BestThirdsSummary } from '../prediction/BestThirdsSummary';

export function AdminGroupStandingsPanel({ standings, bestThirds, teams }: { standings: StandingRow[]; bestThirds: StandingRow[]; teams: Team[] }) {
  const groups = Array.from(new Set(standings.map((row) => row.groupCode))).sort();
  return (
    <div className="space-y-4">
      <BestThirdsSummary rows={bestThirds} teams={teams} />
      <div className="grid gap-3 lg:grid-cols-2">
        {groups.map((groupCode) => <GroupStandingsPreview key={groupCode} groupCode={groupCode} rows={standings.filter((row) => row.groupCode === groupCode)} teams={teams} />)}
      </div>
    </div>
  );
}
