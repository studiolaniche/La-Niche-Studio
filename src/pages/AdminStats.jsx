import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

export default function AdminStats() {
  const navigate = useNavigate();

  const [views, setViews] = useState([]);
  const [films, setFilms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        navigate("/login");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (!profile || profile.role !== "admin") {
        navigate("/login");
        return;
      }

      const { data: filmsData } = await supabase
        .from("films")
        .select("id, titre, slug, miniature_url")
        .order("created_at", { ascending: false });

      const { data: viewsData, error } = await supabase
        .from("film_views")
        .select("*")
        .order("viewed_at", { ascending: false });

      if (error) {
        console.error("Erreur stats :", error);
      }

      setFilms(filmsData || []);
      setViews(viewsData || []);
      setLoading(false);
    }

    loadStats();
  }, [navigate]);

  const stats = useMemo(() => {
    return films.map((film) => {
      const filmViews = views.filter((view) => view.film_id === film.id);

      const uniqueSessions = new Set(
        filmViews.map((view) => view.session_id).filter(Boolean)
      );

      return {
        ...film,
        totalViews: filmViews.length,
        uniqueViews: uniqueSessions.size,
      };
    });
  }, [films, views]);

  const totalViews = views.length;

  const totalUniqueViews = useMemo(() => {
    return new Set(views.map((view) => view.session_id).filter(Boolean)).size;
  }, [views]);

  if (loading) {
    return (
      <main className="min-h-screen bg-black px-6 py-16 text-white">
        Chargement des statistiques...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black px-6 py-16 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-white/40">
              Administration
            </p>
            <h1 className="mt-2 text-4xl font-bold">Statistiques</h1>
          </div>

          <Link
            to="/admin"
            className="rounded-full border border-white/20 px-5 py-3 text-sm transition hover:bg-white/10"
          >
            ← Retour admin
          </Link>
        </div>

        <div className="mb-10 grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
            <p className="text-sm text-white/50">Vues totales</p>
            <p className="mt-3 text-4xl font-bold">{totalViews}</p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
            <p className="text-sm text-white/50">Sessions uniques</p>
            <p className="mt-3 text-4xl font-bold">{totalUniqueViews}</p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
            <p className="text-sm text-white/50">Films suivis</p>
            <p className="mt-3 text-4xl font-bold">{films.length}</p>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
          <h2 className="mb-6 text-2xl font-semibold">Vues par film</h2>

          {stats.length === 0 ? (
            <p className="text-white/50">Aucun film.</p>
          ) : (
            <div className="space-y-3">
              {stats
                .sort((a, b) => b.totalViews - a.totalViews)
                .map((film) => (
                  <div
                    key={film.id}
                    className="grid gap-4 rounded-2xl border border-white/10 bg-black/30 p-4 md:grid-cols-[1fr_auto_auto]"
                  >
                    <div>
                      <h3 className="font-semibold">{film.titre}</h3>
                      <p className="mt-1 text-xs text-white/40">
                        /projet/{film.slug}
                      </p>
                    </div>

                    <div className="text-sm text-white/70">
                      {film.totalViews} vues
                    </div>

                    <div className="text-sm text-white/70">
                      {film.uniqueViews} sessions uniques
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}