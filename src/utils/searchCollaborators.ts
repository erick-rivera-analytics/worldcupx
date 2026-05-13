import { maskCedula } from '../lib/format';
import type { CollaboratorSearchResult, PersonProfile } from '../types/personProfile';

const DEFAULT_LIMIT = 20;

export function normalizeSearchText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/[^a-z0-9\s]/g, '');
}

function onlyDigits(value: string): string {
  return value.replace(/\D/g, '');
}

function textIncludes(value: string | null | undefined, query: string): boolean {
  if (!value || !query) return false;
  return normalizeSearchText(value).includes(query);
}

function buildSearchLabel(profile: PersonProfile): string {
  return [profile.person_name, profile.national_id, profile.person_id, profile.area_name]
    .filter(Boolean)
    .join(' - ');
}

function rankProfile(profile: PersonProfile, normalizedQuery: string, digitsQuery: string): number | null {
  const nationalId = onlyDigits(profile.national_id ?? '');
  const personId = onlyDigits(profile.person_id ?? '');
  const personName = normalizeSearchText(profile.person_name ?? '');

  if (digitsQuery) {
    if (nationalId === digitsQuery) return 1;
    if (personId === digitsQuery) return 2;
    if (nationalId.startsWith(digitsQuery)) return 3;
    if (personId.startsWith(digitsQuery)) return 4;
    if (nationalId.includes(digitsQuery)) return 5;
    if (personId.includes(digitsQuery)) return 6;
  }

  if (normalizedQuery.length >= 2) {
    if (personName.includes(normalizedQuery)) return 7;
    if (textIncludes(profile.area_name, normalizedQuery)) return 8;
    if (textIncludes(profile.job_title, normalizedQuery)) return 9;
  }

  return null;
}

export function searchCollaborators(
  collaborators: PersonProfile[],
  query: string,
  options: { limit?: number } = {}
): CollaboratorSearchResult[] {
  const normalizedQuery = normalizeSearchText(query);
  const digitsQuery = onlyDigits(query);
  const isNumericQuery = digitsQuery.length > 0 && digitsQuery.length === query.replace(/\s+/g, '').length;

  if (!normalizedQuery && !digitsQuery) return [];
  if (!isNumericQuery && normalizedQuery.length < 2) return [];

  return collaborators
    .map((profile) => {
      const matchRank = rankProfile(profile, normalizedQuery, digitsQuery);
      if (matchRank === null) return null;
      return {
        ...profile,
        search_label: buildSearchLabel(profile),
        masked_national_id: profile.national_id ? maskCedula(onlyDigits(profile.national_id)) : null,
        match_rank: matchRank
      };
    })
    .filter((profile): profile is CollaboratorSearchResult => Boolean(profile))
    .sort((a, b) => a.match_rank - b.match_rank || (a.person_name ?? '').localeCompare(b.person_name ?? '', 'es'))
    .slice(0, options.limit ?? DEFAULT_LIMIT);
}
