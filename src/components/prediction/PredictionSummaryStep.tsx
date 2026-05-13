import { CheckCircle2, Trophy } from 'lucide-react';
import type { FinalPredictionSummary, PredictionDraft } from '../../types/prediction';
import type { Team } from '../../types/tournament';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

function teamLabel(teams: Team[], teamId: string | null) {
  const team = teams.find((item) => item.id === teamId);
  return team ? `${team.flagEmoji} ${team.name}` : 'Pendiente';
}

export function PredictionSummaryStep({ ticketId, draft, teams, summary, disabled, onSubmit }: { ticketId: string; draft: PredictionDraft; teams: Team[]; summary: FinalPredictionSummary; disabled?: boolean; onSubmit: () => void }) {
  return (
    <div className="grid gap-4 lg:grid-cols-[.8fr_1.2fr]">
      <Card className="bg-gradient-to-br from-cup-gold/20 to-white/[0.06]">
        <Trophy className="mb-4 text-cup-gold" size={42} />
        <p className="text-xs font-black uppercase tracking-widest text-white/45">Ticket {ticketId}</p>
        <h2 className="mt-1 text-3xl font-black text-white">Campeón: {teamLabel(teams, summary.championTeamId)}</h2>
        <div className="mt-4 space-y-2 text-sm text-white/70">
          <p><b>Subcampeón:</b> {teamLabel(teams, summary.runnerUpTeamId)}</p>
          <p><b>Tercer lugar:</b> {teamLabel(teams, summary.thirdPlaceTeamId)}</p>
          <p><b>Cuarto lugar:</b> {teamLabel(teams, summary.fourthPlaceTeamId)}</p>
          <p><b>Estado:</b> {draft.status}</p>
        </div>
        <Button className="mt-5 w-full" disabled={disabled || !summary.championTeamId} onClick={onSubmit} icon={<CheckCircle2 size={17} />}>{draft.status === 'submitted' ? 'Reenviar predicción' : 'Enviar predicción'}</Button>
      </Card>
      <Card>
        <h3 className="text-xl font-black text-white">Predicción completa</h3>
        <div className="mt-4 grid gap-2 md:grid-cols-2">
          {draft.bracketMatches.filter((match) => match.advancingTeamId).map((match) => (
            <div key={match.id} className="rounded-2xl bg-white/10 p-3 text-sm text-white/75">
              <b>Partido {match.matchNo}</b><br />
              Pasa {teamLabel(teams, match.advancingTeamId)}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
