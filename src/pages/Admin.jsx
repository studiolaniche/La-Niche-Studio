import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

export default function Admin() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [films, setFilms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAdmin() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          navigate("/login");
          return;
        }

        setUser(user);

        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (!profile || profile.role !== "admin") {
          navigate("/login");
          return;
        }

        const { data: filmsData, error } = await supabase
          .from("films")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) {
          console.error(error);
        }

        setFilms(filmsData || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadAdmin();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        Chargement...
      </main>
    );
  }

  const publishedFilms = films.filter(
    (film) => film.is_published
  ).length;

  const draftFilms = films.filter(
    (film) => !film.is_published
  ).length;

  return (
    <main className="min-h-screen bg-black text-white px-6 py-16">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-12 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-white/40">
              Administration
            </p>

            <h1 className="mt-2 text-4xl font-bold">
              La Baie Vitrée
            </h1>

            <p className="mt-2 text-white/50">
              {user?.email}
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="rounded-full border border-white/20 px-5 py-3 text-sm hover:bg-white/10 transition"
          >
            Déconnexion
          </button>
        </div>

        {/* Stats */}
        <div className="mb-10 grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
            <p className="text-sm text-white/50">
              Films au total
            </p>
            <p className="mt-3 text-4xl font-bold">
              {films.length}
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
            <p className="text-sm text-white/50">
              Films publiés
            </p>
            <p className="mt-3 text-4xl font-bold">
              {publishedFilms}
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
            <p className="text-sm text-white/50">
              Brouillons
            </p>
            <p className="mt-3 text-4xl font-bold">
              {draftFilms}
            </p>
          </div>
        </div>

        {/* Liste films */}
        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-semibold">
                Films
              </h2>

              <p className="mt-1 text-sm text-white/50">
                Catalogue Supabase
              </p>
            </div>

            <Link
              to="/admin/films/new"
              className="inline-flex items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-white/90"
            >
              + Ajouter un film
            </Link>
            <Link
  to="/admin/editos"
  className="rounded-full border border-white/20 px-5 py-3 text-sm hover:bg-white/10 transition"
>
  Éditos
</Link>
          <Link
  to="/admin/stats"
  
  className="rounded-full border border-white/20 px-5 py-3 text-sm hover:bg-white/10 transition"
  
>
  Statistiques
</Link>
          </div>

          {films.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/15 p-10 text-center text-white/50">
              Aucun film enregistré.
            </div>
          ) : (
            <div className="space-y-4">
              {films.map((film) => (
                <div
                  key={film.id}
                  className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-black/30 p-4 md:flex-row md:items-center"
                >
                  <div className="h-24 w-20 overflow-hidden rounded-xl bg-white/10">
                    {film.miniature_url && (
                      <img
                        src={film.miniature_url}
                        alt={film.titre}
                        className="h-full w-full object-cover"
                      />
                    )}
                  </div>

                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">
                      {film.titre}
                    </h3>

                    <p className="text-sm text-white/50">
                      {film.annee || "—"}
                      {film.realisateur_1
                        ? ` • ${film.realisateur_1}`
                        : ""}
                    </p>

                    <p className="mt-2 text-xs text-white/40">
                      {film.is_published
                        ? "Publié"
                        : "Brouillon"}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Link
  to={`/admin/films/${film.id}/edit`}
>
  Modifier
</Link>
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