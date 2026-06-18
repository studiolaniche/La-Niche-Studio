import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

export default function MonEspace() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [films, setFilms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUserAndFilms() {
      const { data: userData } = await supabase.auth.getUser();

      if (!userData.user) {
        navigate("/login");
        return;
      }

      setUser(userData.user);

      const { data: filmsData, error } = await supabase
        .from("films")
        .select("*")
        .eq("owner_id", userData.user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Erreur chargement films :", error);
      } else {
        setFilms(filmsData || []);
      }

      setLoading(false);
    }

    loadUserAndFilms();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  if (loading) {
    return (
      <main className="min-h-[calc(100vh-4rem)] bg-black px-6 py-24 text-white">
        Chargement...
      </main>
    );
  }

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-black px-6 py-24 text-white">
      <div className="mx-auto max-w-5xl">
        <div className="mb-10 flex items-start justify-between gap-6">
          <div>
            <p className="mb-2 text-sm uppercase tracking-[0.3em] text-white/40">
              Espace réalisateur
            </p>
            <h1 className="text-4xl font-bold">Mon espace</h1>
            <p className="mt-3 text-white/60">{user?.email}</p>
          </div>

          <button
            onClick={handleLogout}
            className="rounded-full border border-white/20 px-4 py-2 text-sm text-white transition hover:bg-white/10"
          >
            Déconnexion
          </button>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold">Mes films</h2>
              <p className="mt-1 text-sm text-white/50">
                Retrouvez ici les films associés à votre compte.
              </p>
            </div>

            <button className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-white/90">
              Ajouter un film
            </button>
          </div>

          {films.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/15 p-8 text-center text-white/50">
              Aucun film pour le moment.
            </div>
          ) : (
            <div className="space-y-4">
              {films.map((film) => (
                <div
                  key={film.id}
                  className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-black/40 p-4"
                >
                  <div>
                    <h3 className="font-semibold">{film.titre}</h3>
                    <p className="mt-1 text-sm text-white/50">
                      {film.validation_status} ·{" "}
                      {film.is_published ? "Publié" : "Non publié"}
                    </p>
                  </div>

                  <button className="rounded-full border border-white/20 px-4 py-2 text-sm transition hover:bg-white/10">
                    Modifier
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}