import { useQuery } from "@tanstack/react-query";

const API_URL =
  "https://script.google.com/macros/s/AKfycbxGq4HWnCZ4rS0Rld4H1BbLCp16PRCctTDFdIppp-yQn294u3IKLaKG8h_jmNpQwWxLqg/exec";

async function fetchFilms() {
  const res = await fetch(API_URL, { cache: "no-store" });

  if (!res.ok) {
    throw new Error("Erreur chargement films");
  }

  const data = await res.json();
  return data.films || [];
}

export default function useFilms() {
  return useQuery({
    queryKey: ["films"],
    queryFn: fetchFilms,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    refetchOnWindowFocus: false,
    refetchInterval: false,
    refetchIntervalInBackground: false,
  });
}
