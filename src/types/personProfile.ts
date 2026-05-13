export interface PersonProfile {
  person_id: string;
  person_name: string | null;
  area_id: string | null;
  area_name: string | null;
  national_id: string | null;
  gender: string | null;
  job_title: string | null;
  associated_worker_name: string | null;
  email: string | null;
  phone_number: string | null;
  job_classification_code: string | null;
}

export interface PersonProfileApiResponse {
  data: PersonProfile[];
  limit: number;
  offset: number;
  count: number;
}

export interface CollaboratorSearchResult extends PersonProfile {
  search_label: string;
  masked_national_id: string | null;
  match_rank: number;
}
