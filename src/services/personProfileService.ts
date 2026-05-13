import { USE_MOCKS } from '../lib/constants';
import { supabase } from '../lib/supabase';
import type { PersonProfile, PersonProfileApiResponse } from '../types/personProfile';

const FUNCTION_NAME = 'pull-person-profile';
const DEFAULT_LIMIT = 1000;
const MAX_PAGES = 20;

const demoProfiles: PersonProfile[] = [
  {
    person_id: '1000',
    person_name: 'David Rivera',
    area_id: 'MH1',
    area_name: 'Monjashuaico 1',
    national_id: '0107428849',
    gender: 'MASCULINO',
    job_title: 'Analista de datos',
    associated_worker_name: 'Responsable Demo',
    email: null,
    phone_number: null,
    job_classification_code: 'ADMIN'
  },
  {
    person_id: '2888',
    person_name: 'Maria Jose Andrade',
    area_id: 'CAMPO',
    area_name: 'Cosecha',
    national_id: '0102030405',
    gender: 'FEMENINO',
    job_title: 'Trabajadora operativa floricola o del agro',
    associated_worker_name: 'Responsable Demo',
    email: null,
    phone_number: null,
    job_classification_code: 'AGRICOLA'
  }
];

export async function fetchPersonProfilesPage(params: { limit?: number; offset?: number } = {}): Promise<PersonProfileApiResponse> {
  const limit = params.limit ?? DEFAULT_LIMIT;
  const offset = params.offset ?? 0;

  if (USE_MOCKS || !supabase) {
    const data = demoProfiles.slice(offset, offset + limit);
    return { data, limit, offset, count: data.length };
  }

  const { data, error } = await supabase.functions.invoke<PersonProfileApiResponse>(FUNCTION_NAME, {
    body: { limit, offset }
  });

  if (error) {
    throw new Error(error.message || 'No se pudo consultar la base de colaboradores.');
  }

  if (!data || !Array.isArray(data.data)) {
    throw new Error('La Edge Function devolvio una respuesta invalida.');
  }

  return data;
}

export async function fetchAllPersonProfiles(): Promise<PersonProfile[]> {
  const all: PersonProfile[] = [];
  let offset = 0;

  for (let page = 0; page < MAX_PAGES; page += 1) {
    const response = await fetchPersonProfilesPage({ limit: DEFAULT_LIMIT, offset });
    all.push(...response.data);

    if (response.data.length < DEFAULT_LIMIT) break;
    offset += DEFAULT_LIMIT;
  }

  return all;
}
