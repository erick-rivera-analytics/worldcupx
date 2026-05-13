import { useMemo } from 'react';
import type { PersonProfile } from '../types/personProfile';
import { searchCollaborators } from '../utils/searchCollaborators';

export function useCollaboratorSearch(profiles: PersonProfile[], query: string, limit = 20) {
  return useMemo(() => searchCollaborators(profiles, query, { limit }), [profiles, query, limit]);
}
