import { useEffect, useState } from 'react';
import { fetchAllPersonProfiles } from '../services/personProfileService';
import type { PersonProfile } from '../types/personProfile';

export function usePersonProfiles() {
  const [profiles, setProfiles] = useState<PersonProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadProfiles() {
    setLoading(true);
    setError(null);
    try {
      setProfiles(await fetchAllPersonProfiles());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo consultar la base de colaboradores.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadProfiles();
  }, []);

  return { profiles, loading, error, reload: loadProfiles };
}
