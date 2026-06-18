import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function useSupabaseFilms() {
  const [films, setFilms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadFilms() {
      const { data, error } = await supabase
        .from("films")
        .select("*")
        .eq("is_published", true)
        .order("created_at", { ascending: false });

      if (error) {
        setError(error);
        setFilms([]);
      } else {
        setFilms(data || []);
      }

      setLoading(false);
    }

    loadFilms();
  }, []);

  return { films, loading, error };
}