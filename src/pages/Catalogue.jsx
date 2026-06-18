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
    <section className="w-full px-4 py-10 md:px-8">
      <Breadcrumb
        items={[
          { label: "Accueil", href: "/" },
          { label: "Catalogue" },
        ]}
      />

      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h2 className="text-3xl font-bold">{title}</h2>

        <div className="relative flex w-full items-center md:w-96">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher un film, un réalisateur, une année…"
            className="w-full rounded bg-white/10 px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/40"
          />

          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute right-2 text-gray-300 hover:text-white"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {(selectedStatus || selectedDirector) && (
        <div className="mb-6 flex flex-wrap items-center gap-2 text-sm">
          <span className="opacity-70">Filtres actifs :</span>

          {selectedStatus && (
            <button
              type="button"
              onClick={() => updateFilter("status", "")}
              className="rounded-full bg-white/20 px-3 py-1 transition hover:bg-white/30"
            >
              Statut : {selectedStatus} ✕
            </button>
          )}

          {selectedDirector && (
            <button
              type="button"
              onClick={() => updateFilter("realisateur", "")}
              className="rounded-full bg-white/20 px-3 py-1 transition hover:bg-white/30"
            >
              Réalisateur·ice : {selectedDirector} ✕
            </button>
          )}

          <button
            type="button"
            onClick={clearAllFilters}
            className="rounded-full border border-white/20 px-3 py-1 transition hover:bg-white/10"
          >
            Tout effacer
          </button>
        </div>
      )}

      {!filtered.length ? (
        <p className="opacity-70">Aucun film ne correspond à votre recherche.</p>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {filtered.map((film) => {
            const miniature =
              film.miniature_url ||
              (film.vimeo_id
                ? `https://vumbnail.com/${film.vimeo_id}.jpg`
                : "/miniatures/placeholder.jpg");

            return (
              <div
                key={film.id}
                className="group relative block overflow-hidden rounded-lg bg-black/20 shadow-lg transition-transform duration-300 hover:scale-[1.02]"
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
                  <div className="relative aspect-video w-full overflow-hidden">
                    <img
                      src={miniature}
                      alt={film.titre}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                      decoding="async"
                    />
                  </div>

                  <div className="bg-black p-3 text-white">
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
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}