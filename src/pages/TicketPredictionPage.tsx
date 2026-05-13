import { PredictionWizard } from '../components/prediction/PredictionWizard';

export function TicketPredictionPage({ ticketId }: { ticketId: string }) {
  return <PredictionWizard ticketId={ticketId} />;
}
