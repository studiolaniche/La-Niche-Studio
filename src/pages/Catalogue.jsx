import { useState, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import useFilms from "../hooks/useFilms";
import Breadcrumb from "../components/Breadcrumb";

function normalizeText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

export default function Catalogue() {
  const { data: rawFilms = [], isLoading: loading } = useFilms();
  const [query, setQuery] = useState("");

  const [searchParams, setSearchParams] = useSearchParams();

  const selectedStatus = searchParams.get("status") || "";
  const selectedDirector = searchParams.get("realisateur") || "";
  const selectedActor = searchParams.get("acteur") || "";

  const films = useMemo(
    () =>
      rawFilms
        .slice()
        .sort((a, b) => (parseInt(b.ANNEE) || 0) - (parseInt(a.ANNEE) || 0)),
    [rawFilms]
  );

  const getStableColor = (text) => {
    if (!text) return "#666";
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      hash = text.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = Math.abs(hash) % 360;
    return `hsl(${hue}, 70%, 45%)`;
  };

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
    const actorFilter = normalizeText(selectedActor);
    const statusFilter = normalizeText(selectedStatus);

    return films.filter((f) => {
      const title = normalizeText(f.TITRE);
      const real1 = normalizeText(f["REALISATEUR 1"]);
      const real2 = normalizeText(f["REALISATEUR 2"]);
      const synopsis = normalizeText(f.SYNOPSIS);
      const description = normalizeText(f.DESCRIPTION);
      const year = String(f.ANNEE || "");
      const status = normalizeText(f.STATUS);

      const actorValues = Array.from({ length: 15 }, (_, i) =>
        normalizeText(f[`ACTEUR${i + 1}`])
      ).filter(Boolean);

      const matchesQuery =
        !q ||
        title.includes(q) ||
        real1.includes(q) ||
        real2.includes(q) ||
        synopsis.includes(q) ||
        description.includes(q) ||
        year.includes(q) ||
        actorValues.some((actor) => actor.includes(q));

      const matchesStatus = statusFilter ? status === statusFilter : true;

      const matchesDirector = directorFilter
        ? real1 === directorFilter || real2 === directorFilter
        : true;

      const matchesActor = actorFilter
        ? actorValues.some((actor) => actor === actorFilter)
        : true;

      return matchesQuery && matchesStatus && matchesDirector && matchesActor;
    });
  }, [films, query, selectedStatus, selectedDirector, selectedActor]);

  const handleStatusClick = (status) => {
    if (normalizeText(selectedStatus) === normalizeText(status)) {
      updateFilter("status", "");
    } else {
      updateFilter("status", status);
    }
  };

  const title = selectedDirector
    ? `Films liés à ${selectedDirector}`
    : selectedActor
    ? `Films avec ${selectedActor}`
    : selectedStatus
    ? `Catalogue — ${selectedStatus}`
    : "Catalogue complet";

  if (loading) return <p className="px-6 opacity-70">Chargement…</p>;

  return (
    <section className="w-full px-4 md:px-8 py-10">
      <Breadcrumb
        items={[
          { label: "Accueil", href: "/" },
          { label: "Catalogue" },
        ]}
      />

      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
        <h2 className="text-3xl font-bold">{title}</h2>

        <div className="flex items-center w-full md:w-96 relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher un film, un réalisateur, un acteur, une année…"
            className="w-full px-4 py-2 rounded bg-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/40"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-2 text-gray-300 hover:text-white"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {(selectedStatus || selectedDirector || selectedActor) && (
        <div className="mb-6 flex flex-wrap items-center gap-2 text-sm">
          <span className="opacity-70">Filtres actifs :</span>

          {selectedStatus && (
            <button
              onClick={() => updateFilter("status", "")}
              className="px-3 py-1 rounded-full bg-white/20 hover:bg-white/30 transition"
            >
              Statut : {selectedStatus} ✕
            </button>
          )}

          {selectedDirector && (
            <button
              onClick={() => updateFilter("realisateur", "")}
              className="px-3 py-1 rounded-full bg-white/20 hover:bg-white/30 transition"
            >
              Réalisateur·ice : {selectedDirector} ✕
            </button>
          )}

          {selectedActor && (
            <button
              onClick={() => updateFilter("acteur", "")}
              className="px-3 py-1 rounded-full bg-white/20 hover:bg-white/30 transition"
            >
              Acteur : {selectedActor} ✕
            </button>
          )}

          <button
            onClick={clearAllFilters}
            className="px-3 py-1 rounded-full border border-white/20 hover:bg-white/10 transition"
          >
            Tout effacer
          </button>
        </div>
      )}

      {!filtered.length ? (
        <p className="opacity-70">Aucun film ne correspond à votre recherche.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filtered.map((film) => {
            const miniature = film.MINIATURE
              ? film.MINIATURE.includes("/miniatures/")
                ? film.MINIATURE
                : `/miniatures/${film.MINIATURE}`
              : film.VIMEOID
              ? `https://vumbnail.com/${film.VIMEOID}.jpg`
              : "/miniatures/placeholder.jpg";

            return (
              <div
                key={film.ID}
                className="group block bg-black/20 rounded-lg overflow-hidden hover:scale-[1.02] transition-transform duration-300 shadow-lg relative"
              >
                {film.STATUS && (
                  <button
                    type="button"
                    className={`absolute top-3 left-3 text-xs font-bold px-3 py-1 rounded-full z-10 shadow-md cursor-pointer transition hover:scale-105 ${
                      normalizeText(selectedStatus) === normalizeText(film.STATUS)
                        ? "ring-2 ring-white ring-offset-2 ring-offset-black"
                        : ""
                    }`}
                    style={{
                      backgroundColor: getStableColor(film.STATUS),
                      color: "white",
                    }}
                    onClick={() => handleStatusClick(film.STATUS)}
                  >
                    {film.STATUS}
                  </button>
                )}

                <Link to={`/projet/${film.ID}`}>
                  <div className="aspect-video w-full overflow-hidden relative">
                    <img
                      src={miniature}
                      alt={film.TITRE}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                      decoding="async"
                    />
                  </div>

                  <div className="p-3 bg-black text-white">
                    <h3 className="text-base font-semibold truncate">
                      {film.TITRE}
                    </h3>
                    <p className="text-xs opacity-80 mt-1">
                      {film["REALISATEUR 1"]}
                      {film["REALISATEUR 2"] ? ` & ${film["REALISATEUR 2"]}` : ""}
                      {film.ANNEE ? ` • ${film.ANNEE}` : ""}
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