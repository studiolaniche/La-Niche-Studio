import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

function normalizeText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("fr-FR");
}

function formatTime(value) {
  if (!value) return "—";
  return new Date(value).toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function Admin() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [films, setFilms] = useState([]);
  const [editos, setEditos] = useState([]);
  const [views, setViews] = useState([]);
  const [windows, setWindows] = useState([]);
  const [loading, setLoading] = useState(true);

  const [query, setQuery] = useState("");
  const [publishFilter, setPublishFilter] = useState("all");
  const [yearFilter, setYearFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortMode, setSortMode] = useState("created_desc");

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
          .select("role")
          .eq("id", user.id)
          .single();

        if (!profile || profile.role !== "admin") {
          navigate("/login");
          return;
        }

        const [
          filmsResult,
          editosResult,
          viewsResult,
          windowsResult,
        ] = await Promise.all([
          supabase.from("films").select("*").order("created_at", { ascending: false }),
          supabase.from("editos").select("*").order("created_at", { ascending: false }),
          supabase.from("film_views").select("*").order("viewed_at", { ascending: false }),
          supabase.from("film_windows").select("*").order("created_at", { ascending: false }),
        ]);

        if (filmsResult.error) console.error("Erreur films :", filmsResult.error);
        if (editosResult.error) console.error("Erreur éditos :", editosResult.error);
        if (viewsResult.error) console.error("Erreur vues :", viewsResult.error);
        if (windowsResult.error) console.error("Erreur fenêtres :", windowsResult.error);

        setFilms(filmsResult.data || []);
        setEditos(editosResult.data || []);
        setViews(viewsResult.data || []);
        setWindows(windowsResult.data || []);
      } catch (error) {
        console.error("Erreur admin :", error);
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

  const publishedFilms = films.filter((film) => film.is_published).length;
  const draftFilms = films.filter((film) => !film.is_published).length;
  const publishedEditos = editos.filter((edito) => edito.is_published).length;

  const viewsByFilm = useMemo(() => {
    const map = new Map();

    for (const view of views) {
      map.set(view.film_id, (map.get(view.film_id) || 0) + 1);
    }

    return map;
  }, [views]);

  const windowsByFilm = useMemo(() => {
    const map = new Map();

    for (const item of windows) {
      map.set(item.film_id, (map.get(item.film_id) || 0) + 1);
    }

    return map;
  }, [windows]);

  const editosByFilm = useMemo(() => {
    const map = new Map();

    for (const edito of editos) {
      if (!edito.film_id) continue;
      map.set(edito.film_id, (map.get(edito.film_id) || 0) + 1);
    }

    return map;
  }, [editos]);

  const topWindowFilms = useMemo(() => {
    return films
      .map((film) => ({
        ...film,
        windows_count: windowsByFilm.get(film.id) || 0,
      }))
      .sort((a, b) => b.windows_count - a.windows_count)
      .slice(0, 5);
  }, [films, windowsByFilm]);

  const topAttachmentFilms = useMemo(() => {
    return films
      .map((film) => {
        const viewsCount = viewsByFilm.get(film.id) || 0;
        const windowsCount = windowsByFilm.get(film.id) || 0;

        return {
          ...film,
          views_count: viewsCount,
          windows_count: windowsCount,
          attachment_rate:
            viewsCount > 0 ? Math.round((windowsCount / viewsCount) * 100) : 0,
        };
      })
      .filter((film) => film.views_count > 0 || film.windows_count > 0)
      .sort((a, b) => b.attachment_rate - a.attachment_rate)
      .slice(0, 5);
  }, [films, viewsByFilm, windowsByFilm]);

  const topViewedFilms = useMemo(() => {
    return films
      .map((film) => ({
        ...film,
        views_count: viewsByFilm.get(film.id) || 0,
      }))
      .sort((a, b) => b.views_count - a.views_count)
      .slice(0, 5);
  }, [films, viewsByFilm]);

  const forgottenFilms = useMemo(() => {
    return films
      .map((film) => {
        const viewsCount = viewsByFilm.get(film.id) || 0;
        const windowsCount = windowsByFilm.get(film.id) || 0;

        return {
          ...film,
          views_count: viewsCount,
          windows_count: windowsCount,
        };
      })
      .filter((film) => film.views_count >= 1 && film.windows_count === 0)
      .sort((a, b) => b.views_count - a.views_count)
      .slice(0, 5);
  }, [films, viewsByFilm, windowsByFilm]);

  const editorialFilms = useMemo(() => {
    return films
      .map((film) => ({
        ...film,
        editos_count: editosByFilm.get(film.id) || 0,
        windows_count: windowsByFilm.get(film.id) || 0,
      }))
      .filter((film) => film.editos_count > 0)
      .sort((a, b) => b.editos_count - a.editos_count)
      .slice(0, 5);
  }, [films, editosByFilm, windowsByFilm]);

  const recentWindows = useMemo(() => {
    return windows.slice(0, 6).map((item) => {
      const film = films.find((film) => film.id === item.film_id);

      return {
        ...item,
        film,
      };
    });
  }, [windows, films]);

  const years = useMemo(() => {
    return [...new Set(films.map((film) => film.annee).filter(Boolean))]
      .map(String)
      .sort((a, b) => Number(b) - Number(a));
  }, [films]);

  const statuses = useMemo(() => {
    return [...new Set(films.map((film) => film.status).filter(Boolean))]
      .map(String)
      .sort((a, b) => a.localeCompare(b));
  }, [films]);

  const filteredFilms = useMemo(() => {
    const q = normalizeText(query);

    let result = films.filter((film) => {
      const title = normalizeText(film.titre);
      const director = normalizeText(
        [film.realisateur_1, film.realisateur_2].filter(Boolean).join(" ")
      );
      const genre = normalizeText(film.genre);
      const status = String(film.status || "");
      const year = String(film.annee || "");

      const matchesQuery =
        !q ||
        title.includes(q) ||
        director.includes(q) ||
        genre.includes(q) ||
        normalizeText(status).includes(q) ||
        year.includes(q);

      const matchesPublish =
        publishFilter === "all"
          ? true
          : publishFilter === "published"
          ? film.is_published
          : !film.is_published;

      const matchesYear = yearFilter === "all" ? true : year === yearFilter;
      const matchesStatus = statusFilter === "all" ? true : status === statusFilter;

      return matchesQuery && matchesPublish && matchesYear && matchesStatus;
    });

    result = result.slice().sort((a, b) => {
      if (sortMode === "created_asc") {
        return new Date(a.created_at || 0) - new Date(b.created_at || 0);
      }

      if (sortMode === "updated_desc") {
        return new Date(b.updated_at || 0) - new Date(a.updated_at || 0);
      }

      if (sortMode === "updated_asc") {
        return new Date(a.updated_at || 0) - new Date(b.updated_at || 0);
      }

      if (sortMode === "title_asc") {
        return String(a.titre || "").localeCompare(String(b.titre || ""));
      }

      if (sortMode === "year_desc") {
        return (Number(b.annee) || 0) - (Number(a.annee) || 0);
      }

      return new Date(b.created_at || 0) - new Date(a.created_at || 0);
    });

    return result;
  }, [films, query, publishFilter, yearFilter, statusFilter, sortMode]);

  const resetFilters = () => {
    setQuery("");
    setPublishFilter("all");
    setYearFilter("all");
    setStatusFilter("all");
    setSortMode("created_desc");
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black text-white">
        Chargement...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black px-6 py-16 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-white/40">
              Administration
            </p>
            <h1 className="mt-2 text-4xl font-bold">La Baie Vitrée</h1>
            <p className="mt-2 text-white/50">{user?.email}</p>
          </div>

          <button
            onClick={handleLogout}
            className="rounded-full border border-white/20 px-5 py-3 text-sm transition hover:bg-white/10"
          >
            Déconnexion
          </button>
        </div>

        <div className="mb-8 flex flex-wrap gap-3">
          <Link
            to="/admin/films/new"
            className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-white/90"
          >
            + Ajouter un film
          </Link>

          <Link
            to="/admin/editos"
            className="rounded-full border border-white/20 px-5 py-3 text-sm transition hover:bg-white/10"
          >
            Éditos
          </Link>

          <Link
            to="/admin/stats"
            className="rounded-full border border-white/20 px-5 py-3 text-sm transition hover:bg-white/10"
          >
            Statistiques
          </Link>
        </div>

        <div className="mb-10 grid gap-4 md:grid-cols-4">
          <StatCard label="Films" value={films.length} />
          <StatCard label="Fenêtres ouvertes" value={windows.length} />
          <StatCard label="Vues totales" value={views.length} />
          <StatCard label="Éditos" value={editos.length} />
        </div>

        <div className="mb-10 grid gap-6 xl:grid-cols-3">
          <DashboardCard title="🏆 Films les plus présents dans les fenêtres">
            <MiniRanking
              items={topWindowFilms}
              empty="Aucune fenêtre pour le moment."
              renderValue={(film) => `${film.windows_count} 🪟`}
            />
          </DashboardCard>

          <DashboardCard title="❤️ Indice d’attachement">
            <MiniRanking
              items={topAttachmentFilms}
              empty="Pas encore assez de données."
              renderValue={(film) => `${film.attachment_rate}%`}
              renderMeta={(film) =>
                `${film.windows_count} fenêtres · ${film.views_count} vues`
              }
            />
          </DashboardCard>

          <DashboardCard title="🪟 Dernières fenêtres ouvertes">
            {recentWindows.length === 0 ? (
              <p className="text-sm text-white/50">Aucune fenêtre récente.</p>
            ) : (
              <div className="space-y-3">
                {recentWindows.map((item) => (
                  <div key={item.id} className="rounded-2xl bg-black/30 p-4">
                    <p className="font-medium">
                      {item.film?.titre || "Film inconnu"}
                    </p>
                    <p className="mt-1 text-xs text-white/40">
                      {formatDate(item.created_at)} · {formatTime(item.created_at)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </DashboardCard>
        </div>

        <div className="mb-10 grid gap-6 xl:grid-cols-3">
          <DashboardCard title="👀 Films les plus vus">
            <MiniRanking
              items={topViewedFilms}
              empty="Aucune vue pour le moment."
              renderValue={(film) => `${film.views_count} vues`}
            />
          </DashboardCard>

          <DashboardCard title="💔 Films vus mais sans fenêtre">
            <MiniRanking
              items={forgottenFilms}
              empty="Aucun film oublié pour le moment."
              renderValue={(film) => `${film.views_count} vues`}
              renderMeta={() => "0 fenêtre ouverte"}
            />
          </DashboardCard>

          <DashboardCard title="📰 Films qui font parler d’eux">
            <MiniRanking
              items={editorialFilms}
              empty="Aucun édito associé à un film."
              renderValue={(film) => `${film.editos_count} édito${film.editos_count > 1 ? "s" : ""}`}
              renderMeta={(film) => `${film.windows_count} fenêtres ouvertes`}
            />
          </DashboardCard>
        </div>

        <div className="mb-10 grid gap-4 md:grid-cols-3">
          <StatCard label="Films publiés" value={publishedFilms} />
          <StatCard label="Brouillons films" value={draftFilms} />
          <StatCard label="Éditos publiés" value={publishedEditos} />
        </div>

        <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
          <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-2xl font-semibold">
                Gestionnaire de contenus
              </h2>
              <p className="mt-1 text-sm text-white/50">
                Recherche, filtres et tri des films.
              </p>
            </div>

            <Link
              to="/admin/films/new"
              className="inline-flex items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-white/90"
            >
              + Ajouter un film
            </Link>
          </div>

          <div className="mb-6 grid gap-3 lg:grid-cols-[1.5fr_1fr_1fr_1fr_1fr_auto]">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Rechercher un titre, réalisateur, genre..."
              className="rounded-xl border border-white/10 bg-black px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-white/40"
            />

            <select
              value={publishFilter}
              onChange={(event) => setPublishFilter(event.target.value)}
              className="rounded-xl border border-white/10 bg-black px-4 py-3 text-sm text-white outline-none transition focus:border-white/40"
            >
              <option value="all">Tous</option>
              <option value="published">Publiés</option>
              <option value="draft">Brouillons</option>
            </select>

            <select
              value={yearFilter}
              onChange={(event) => setYearFilter(event.target.value)}
              className="rounded-xl border border-white/10 bg-black px-4 py-3 text-sm text-white outline-none transition focus:border-white/40"
            >
              <option value="all">Toutes les années</option>
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="rounded-xl border border-white/10 bg-black px-4 py-3 text-sm text-white outline-none transition focus:border-white/40"
            >
              <option value="all">Tous les statuts</option>
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>

            <select
              value={sortMode}
              onChange={(event) => setSortMode(event.target.value)}
              className="rounded-xl border border-white/10 bg-black px-4 py-3 text-sm text-white outline-none transition focus:border-white/40"
            >
              <option value="created_desc">Ajout récent</option>
              <option value="created_asc">Ajout ancien</option>
              <option value="updated_desc">Modification récente</option>
              <option value="updated_asc">Modification ancienne</option>
              <option value="title_asc">Titre A → Z</option>
              <option value="year_desc">Année récente</option>
            </select>

            <button
              type="button"
              onClick={resetFilters}
              className="rounded-xl border border-white/20 px-4 py-3 text-sm transition hover:bg-white/10"
            >
              Reset
            </button>
          </div>

          <div className="mb-4 text-sm text-white/45">
            {filteredFilms.length} film{filteredFilms.length > 1 ? "s" : ""} affiché
            {filteredFilms.length > 1 ? "s" : ""}
          </div>

          {filteredFilms.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/15 p-10 text-center text-white/50">
              Aucun film ne correspond aux filtres.
            </div>
          ) : (
            <div className="space-y-4">
              {filteredFilms.map((film) => (
                <FilmRow
                  key={film.id}
                  film={film}
                  viewsCount={viewsByFilm.get(film.id) || 0}
                  windowsCount={windowsByFilm.get(film.id) || 0}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
      <p className="text-sm text-white/50">{label}</p>
      <p className="mt-3 text-4xl font-bold">{value}</p>
    </div>
  );
}

function DashboardCard({ title, children }) {
  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
      <h2 className="mb-6 text-xl font-semibold">{title}</h2>
      {children}
    </section>
  );
}

function MiniRanking({ items, empty, renderValue, renderMeta }) {
  if (!items.length) {
    return <p className="text-sm text-white/50">{empty}</p>;
  }

  return (
    <div className="space-y-3">
      {items.map((film, index) => (
        <div
          key={film.id}
          className="flex items-center justify-between gap-4 rounded-2xl bg-black/30 p-4"
        >
          <div>
            <p className="font-semibold">
              <span className="mr-2 text-white/35">#{index + 1}</span>
              {film.titre || "Sans titre"}
            </p>

            {renderMeta && (
              <p className="mt-1 text-xs text-white/40">{renderMeta(film)}</p>
            )}
          </div>

          <p className="shrink-0 text-sm text-white/70">{renderValue(film)}</p>
        </div>
      ))}
    </div>
  );
}

function FilmRow({ film, viewsCount, windowsCount }) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-black/30 p-4 md:flex-row md:items-center">
      <div className="h-24 w-20 shrink-0 overflow-hidden rounded-xl bg-white/10">
        {film.miniature_url ? (
          <img
            src={film.miniature_url}
            alt={film.titre}
            className="h-full w-full object-cover"
          />
        ) : null}
      </div>

      <div className="flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-lg font-semibold">
            {film.titre || "Sans titre"}
          </h3>

          <span
            className={`rounded-full px-2 py-1 text-xs ${
              film.is_published
                ? "bg-emerald-500/15 text-emerald-200"
                : "bg-yellow-500/15 text-yellow-200"
            }`}
          >
            {film.is_published ? "Publié" : "Brouillon"}
          </span>

          {film.status && (
            <span className="rounded-full bg-white/10 px-2 py-1 text-xs text-white/70">
              {film.status}
            </span>
          )}
        </div>

        <p className="mt-1 text-sm text-white/50">
          {film.annee || "—"}
          {film.realisateur_1 ? ` • ${film.realisateur_1}` : ""}
          {film.genre ? ` • ${film.genre}` : ""}
        </p>

        <p className="mt-2 text-xs text-white/35">
          Ajouté : {formatDate(film.created_at)}
          {" · "}
          Modifié : {formatDate(film.updated_at)}
          {" · "}
          {viewsCount} vues
          {" · "}
          {windowsCount} fenêtres
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Link
          to={`/projet/${film.slug || film.id}`}
          className="rounded-full border border-white/20 px-4 py-2 text-sm transition hover:bg-white/10"
        >
          Voir
        </Link>

        <Link
          to={`/admin/films/${film.id}/edit`}
          className="rounded-full border border-white/20 px-4 py-2 text-sm transition hover:bg-white/10"
        >
          Modifier
        </Link>
      </div>
    </div>
  );
}