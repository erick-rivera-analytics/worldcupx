import type { ThirdPlaceSlot } from '../../types/prediction';
import type { StandingRow, Team } from '../../types/tournament';
import { ThirdPlaceSlotAssignment } from '../prediction/ThirdPlaceSlotAssignment';

export function AdminThirdPlaceAssignmentPanel({ slots, bestThirds, teams, onAssign }: {
  slots: ThirdPlaceSlot[];
  bestThirds: StandingRow[];
  teams: Team[];
  onAssign: (slotId: string, teamId: string | null) => void;
}) {
  return <ThirdPlaceSlotAssignment slots={slots} bestThirds={bestThirds} teams={teams} onAssign={onAssign} />;
}
