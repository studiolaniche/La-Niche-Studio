import { useState, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import useSupabaseFilms from "../hooks/useSupabaseFilms";
import Breadcrumb from "../components/Breadcrumb";

function normalizeText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

function getStableColor(text) {
  if (!text) return "#666";

  let hash = 0;

  for (let i = 0; i < text.length; i++) {
    hash = text.charCodeAt(i) + ((hash << 5) - hash);
  }

  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 70%, 45%)`;
}

export default function Catalogue() {
  const { films: rawFilms = [], loading } = useSupabaseFilms();

  const [query, setQuery] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();

  const selectedStatus = searchParams.get("status") || "";
  const selectedDirector = searchParams.get("realisateur") || "";

  const films = useMemo(() => {
    return rawFilms
      .slice()
      .sort((a, b) => (Number(b.annee) || 0) - (Number(a.annee) || 0));
  }, [rawFilms]);

  const statuses = useMemo(() => {
    const unique = new Map();

    films.forEach((film) => {
      if (film.status) {
        unique.set(normalizeText(film.status), film.status);
      }
    });

    return Array.from(unique.values());
  }, [films]);

  const updateFilter = (key, value) => {
    const params = new URLSearchParams(searchParams);

    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    setSearchParams(params);
  };

  const clearAllFilters = () => {
    setSearchParams({});
    setQuery("");
  };

  const filtered = useMemo(() => {
    const q = normalizeText(query);
    const directorFilter = normalizeText(selectedDirector);
    const statusFilter = normalizeText(selectedStatus);

    return films.filter((film) => {
      const title = normalizeText(film.titre);
      const real1 = normalizeText(film.realisateur_1);
      const real2 = normalizeText(film.realisateur_2);
      const synopsis = normalizeText(film.synopsis);
      const year = String(film.annee || "");
      const status = normalizeText(film.status);

      const matchesQuery =
        !q ||
        title.includes(q) ||
        real1.includes(q) ||
        real2.includes(q) ||
        synopsis.includes(q) ||
        year.includes(q);

      const matchesStatus = statusFilter ? status === statusFilter : true;

      const matchesDirector = directorFilter
        ? real1 === directorFilter || real2 === directorFilter
        : true;

      return matchesQuery && matchesStatus && matchesDirector;
    });
  }, [films, query, selectedStatus, selectedDirector]);

  const handleStatusClick = (status) => {
    if (normalizeText(selectedStatus) === normalizeText(status)) {
      updateFilter("status", "");
    } else {
      updateFilter("status", status);
    }
  };

  const title = selectedDirector
    ? `Films liés à ${selectedDirector}`
    : selectedStatus
    ? `Catalogue — ${selectedStatus}`
    : "Catalogue complet";

  if (loading) {
    return <p className="px-6 py-10 opacity-70">Chargement…</p>;
  }

  return (
    <section className="w-full bg-black px-4 py-6 text-white md:px-8 md:py-10">
      <Breadcrumb
        items={[
          { label: "Accueil", href: "/" },
          { label: "Catalogue" },
        ]}
      />

      <div className="mb-6 md:mb-8">
        <p className="mb-2 text-xs uppercase tracking-[0.3em] text-white/45 md:hidden">
          Explorer
        </p>

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-4xl font-black leading-none tracking-tight md:text-3xl md:font-bold">
              {title}
            </h2>

            <p className="mt-3 text-sm text-white/55 md:hidden">
              {filtered.length} film{filtered.length > 1 ? "s" : ""} disponible
              {filtered.length > 1 ? "s" : ""}
            </p>
          </div>

          <div className="relative flex w-full items-center md:w-96">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher un film, un réalisateur, une année…"
              className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/40 md:rounded md:py-2"
            />

            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="absolute right-3 text-gray-300 hover:text-white"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      {statuses.length > 0 && (
        <div className="mb-6 flex gap-2 overflow-x-auto pb-2 md:flex-wrap md:overflow-visible">
          <button
            type="button"
            onClick={() => updateFilter("status", "")}
            className={`shrink-0 rounded-full border px-4 py-2 text-xs font-semibold transition ${
              !selectedStatus
                ? "border-white bg-white text-black"
                : "border-white/15 bg-white/5 text-white/75 hover:bg-white/10"
            }`}
          >
            Tous
          </button>

          {statuses.map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => handleStatusClick(status)}
              className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold text-white transition ${
                normalizeText(selectedStatus) === normalizeText(status)
                  ? "ring-2 ring-white"
                  : ""
              }`}
              style={{ backgroundColor: getStableColor(status) }}
            >
              {status}
            </button>
          ))}
        </div>
      )}

      {(selectedStatus || selectedDirector || query) && (
        <div className="mb-6 flex flex-wrap items-center gap-2 text-sm">
          <span className="opacity-60">Filtres :</span>

          {selectedStatus && (
            <button
              type="button"
              onClick={() => updateFilter("status", "")}
              className="rounded-full bg-white/20 px-3 py-1.5 transition hover:bg-white/30"
            >
              {selectedStatus} ✕
            </button>
          )}

          {selectedDirector && (
            <button
              type="button"
              onClick={() => updateFilter("realisateur", "")}
              className="rounded-full bg-white/20 px-3 py-1.5 transition hover:bg-white/30"
            >
              {selectedDirector} ✕
            </button>
          )}

          <button
            type="button"
            onClick={clearAllFilters}
            className="rounded-full border border-white/20 px-3 py-1.5 transition hover:bg-white/10"
          >
            Tout effacer
          </button>
        </div>
      )}

      {!filtered.length ? (
        <p className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 text-sm opacity-70">
          Aucun film ne correspond à votre recherche.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {filtered.map((film) => {
            const miniature =
              film.miniature_url ||
              (film.vimeo_id
                ? `https://vumbnail.com/${film.vimeo_id}.jpg`
                : "/miniatures/placeholder.jpg");

            return (
              <article
                key={film.id}
                className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] shadow-lg transition-transform duration-300 hover:scale-[1.02] md:rounded-lg md:bg-black/20"
              >
                {film.status && (
                  <button
                    type="button"
                    className={`absolute left-3 top-3 z-10 rounded-full px-3 py-1 text-xs font-bold text-white shadow-md transition hover:scale-105 ${
                      normalizeText(selectedStatus) === normalizeText(film.status)
                        ? "ring-2 ring-white ring-offset-2 ring-offset-black"
                        : ""
                    }`}
                    style={{
                      backgroundColor: getStableColor(film.status),
                    }}
                    onClick={() => handleStatusClick(film.status)}
                  >
                    {film.status}
                  </button>
                )}

                <Link to={`/projet/${film.slug || film.id}`}>
                  <div className="relative aspect-[4/3] w-full overflow-hidden md:aspect-video">
                    <img
                      src={miniature}
                      alt={film.titre}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                      decoding="async"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent md:hidden" />

                    <div className="absolute bottom-0 left-0 right-0 p-4 md:hidden">
                      <h3 className="text-xl font-black leading-tight text-white">
                        {film.titre}
                      </h3>

                      <p className="mt-1 text-sm text-white/75">
                        {film.realisateur_1}
                        {film.realisateur_2 ? ` & ${film.realisateur_2}` : ""}
                        {film.annee ? ` • ${film.annee}` : ""}
                      </p>
                    </div>
                  </div>

                  <div className="hidden bg-black p-3 text-white md:block">
                    <h3 className="truncate text-base font-semibold">
                      {film.titre}
                    </h3>

                    <p className="mt-1 text-xs opacity-80">
                      {film.realisateur_1}
                      {film.realisateur_2 ? ` & ${film.realisateur_2}` : ""}
                      {film.annee ? ` • ${film.annee}` : ""}
                    </p>
                  </div>
                </Link>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}