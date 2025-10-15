import { useQuery } from "@tanstack/react-query";

/**
 * Télécharge et met en cache le fichier films.json
 * généré au moment du build.
 */
async function fetchFilms() {
  const res = await fetch("/films.json", { cache: "no-store" });
  if (!res.ok) {
    throw new Error("❌ Impossible de charger les données des films");
  }
  const data = await res.json();
  return data.films || [];
}

/**
 * Hook React pour accéder à tous les films.
 * - Données mises en cache automatiquement
 * - Pas de requêtes répétées
 * - Plus rapide que Google Sheets
 */
export default function useFilms() {
  return useQuery({
    queryKey: ["films"],
    queryFn: fetchFilms,
    staleTime: 1000 * 60 * 60 * 24, // 24h avant revalidation
    gcTime: 1000 * 60 * 60 * 24 * 7, // conserve 7 jours en cache
    refetchOnWindowFocus: false,
  });
}
