import { USE_MOCKS } from '../lib/constants';
import { maskCedula } from '../lib/format';
import { supabase } from '../lib/supabase';
import type { EmployeeSearchResult } from '../types/domain';
import type { PersonProfile } from '../types/personProfile';

export interface TicketSaleResult {
  ok: boolean;
  ticket_id: string;
  code: string;
  employee_name: string;
  cedula_masked: string;
}

function cleanNationalId(value: string | null | undefined): string {
  return (value ?? '').replace(/\D/g, '');
}

function requireText(value: string | null | undefined, label: string): string {
  const text = (value ?? '').trim();
  if (!text) throw new Error(`${label} es requerido para generar ticket.`);
  return text;
}

function randomMockCode(): string {
  return `WCX-${Math.random().toString(36).slice(2, 10).toUpperCase().padEnd(8, 'X')}`;
}

export function collaboratorToEmployeeSearchResult(collaborator: PersonProfile): EmployeeSearchResult {
  const nationalId = cleanNationalId(collaborator.national_id);
  return {
    cedula: nationalId,
    cedulaMasked: nationalId ? maskCedula(nationalId) : 'Sin cedula',
    personId: collaborator.person_id,
    personName: collaborator.person_name ?? 'Colaborador sin nombre',
    areaId: collaborator.area_id ?? 'SIN_AREA',
    areaName: collaborator.area_name ?? null,
    costArea: collaborator.area_name ?? collaborator.area_id ?? 'Pendiente',
    jobTitle: collaborator.job_title ?? 'Pendiente',
    jobClassificationCode: collaborator.job_classification_code ?? null,
    isActive: true,
    ticketsSold: 0,
    ticketsClaimed: 0,
    ticketsPending: 0,
    sourceProfile: collaborator
  };
}

export async function sellTicketForCollaborator(collaborator: PersonProfile): Promise<TicketSaleResult> {
  const personId = requireText(collaborator.person_id, 'person_id');
  const nationalId = requireText(cleanNationalId(collaborator.national_id), 'national_id');
  const personName = requireText(collaborator.person_name, 'person_name');

  if (USE_MOCKS || !supabase) {
    return {
      ok: true,
      ticket_id: `mock-${Date.now()}`,
      code: randomMockCode(),
      employee_name: personName,
      cedula_masked: maskCedula(nationalId)
    };
  }

  const { data, error } = await supabase.rpc('sell_ticket', {
    p_person_id: personId,
    p_national_id: nationalId,
    p_person_name: personName,
    p_area_id: collaborator.area_id,
    p_area_name: collaborator.area_name,
    p_job_title: collaborator.job_title,
    p_job_classification_code: collaborator.job_classification_code
  });

  if (error) throw new Error(error.message);
  const result = data as TicketSaleResult | null;
  if (!result?.ok || !result.code) throw new Error('No se pudo generar el ticket.');
  return result;
}
