import { useState, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import useFilms from "../hooks/useFilms";
import Breadcrumb from "../components/Breadcrumb";

export default function Catalogue() {
  const { data: rawFilms = [], isLoading: loading } = useFilms();
  const [query, setQuery] = useState("");

  // ✅ Lire les paramètres d’URL (ex: ?status=Coup%20de%20coeur)
  const [searchParams] = useSearchParams();
  const initialStatus = searchParams.get("status");
  const [selectedStatus, setSelectedStatus] = useState(initialStatus);

  // ✅ Tri par année décroissante
  const films = useMemo(
    () =>
      rawFilms
        .slice()
        .sort((a, b) => (parseInt(b.ANNEE) || 0) - (parseInt(a.ANNEE) || 0)),
    [rawFilms]
  );

  // 🎨 Générer une couleur stable pour chaque texte (hash couleur)
  const getStableColor = (text) => {
    if (!text) return "#666";
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      hash = text.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = Math.abs(hash) % 360;
    return `hsl(${hue}, 70%, 45%)`;
  };

  // 🔍 Filtrage combiné : recherche + pastille
  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return films.filter((f) => {
      const matchesQuery =
        f.TITRE?.toLowerCase().includes(q) ||
        f["REALISATEUR 1"]?.toLowerCase().includes(q) ||
        f["REALISATEUR 2"]?.toLowerCase().includes(q) ||
        f.SYNOPSIS?.toLowerCase().includes(q) ||
        f.DESCRIPTION?.toLowerCase().includes(q) ||
        (f.ANNEE && f.ANNEE.toString().includes(q));

      const matchesStatus = selectedStatus
        ? f.STATUS?.toLowerCase() === selectedStatus.toLowerCase()
        : true;

      return matchesQuery && matchesStatus;
    });
  }, [films, query, selectedStatus]);

  if (loading) return <p className="px-6 opacity-70">Chargement…</p>;
  if (!filtered.length)
    return (
      <div className="px-6">
        <Breadcrumb
          items={[
            { label: "Accueil", href: "/" },
            { label: "Catalogue" },
          ]}
        />
        <p className="opacity-70">Aucun film ne correspond à votre recherche.</p>
      </div>
    );

  // 🏷️ Clique sur une pastille = filtrage automatique
  const handleStatusClick = (status) => {
    if (selectedStatus?.toLowerCase() === status?.toLowerCase()) {
      setSelectedStatus(null); // désactive le filtre
    } else {
      setSelectedStatus(status);
    }
  };

  return (
    <section className="w-full px-4 md:px-8 py-10">
      {/* 🧭 Fil d’Ariane */}
      <Breadcrumb
        items={[
          { label: "Accueil", href: "/" },
          { label: "Catalogue" },
        ]}
      />

      {/* ---- HEADER + BARRE DE RECHERCHE ---- */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
        <h2 className="text-3xl font-bold">Catalogue complet</h2>

        <div className="flex items-center w-full md:w-96 relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher un film, un réalisateur, une année…"
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

      {/* ---- FILTRE ACTIF ---- */}
      {selectedStatus && (
        <div className="mb-4 flex items-center gap-2 text-sm">
          <span className="opacity-70">Filtré par :</span>
          <span
            className="px-3 py-1 rounded-full cursor-pointer bg-white/20 hover:bg-white/30 transition"
            onClick={() => setSelectedStatus(null)}
          >
            {selectedStatus} ✕
          </span>
        </div>
      )}

      {/* ---- MOSAÏQUE ---- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {filtered.map((film) => {
          // ✅ Corriger le chemin miniature automatiquement
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
              {/* 🏷️ Pastille dynamique cliquable */}
              {film.STATUS && (
                <div
                  className={`absolute top-3 left-3 text-xs font-bold px-3 py-1 rounded-full z-10 shadow-md cursor-pointer transition hover:scale-105 ${
                    selectedStatus?.toLowerCase() === film.STATUS?.toLowerCase()
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
                </div>
              )}

              {/* 🖼️ Miniature */}
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

                {/* 📜 Infos */}
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
    </section>
  );
}
