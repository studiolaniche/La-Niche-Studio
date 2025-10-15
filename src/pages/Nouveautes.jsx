import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import useFilms from "../hooks/useFilms";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Breadcrumb from "../components/Breadcrumb";

export default function Nouveautes() {
  const { data: rawFilms = [], isLoading: loading } = useFilms();
  const [index, setIndex] = useState(0);
  const navigate = useNavigate();

  // 🎬 On filtre uniquement les films avec un STATUS (mise en avant)
  const films = useMemo(() => {
    return rawFilms
      .filter((f) => f.STATUS && f.STATUS.trim() !== "")
      .map((f) => {
        const miniature = f.MINIATURE
          ? f.MINIATURE.includes("/miniatures/")
            ? f.MINIATURE
            : `/miniatures/${f.MINIATURE}`
          : f.VIMEOID
          ? `https://vumbnail.com/${f.VIMEOID}.jpg`
          : "/miniatures/placeholder.jpg";

        return {
          id: f.ID,
          titre: f.TITRE,
          annee: f.ANNEE,
          real1: f["REALISATEUR 1"],
          real2: f["REALISATEUR 2"],
          miniature,
          synopsis: f.SYNOPSIS || "",
          vimeoId: f.VIMEOID,
          status: f.STATUS,
        };
      });
  }, [rawFilms]);

  // 🔄 Rotation automatique toutes les 8s
  useEffect(() => {
    if (films.length > 1) {
      const timer = setInterval(
        () => setIndex((i) => (i + 1) % films.length),
        8000
      );
      return () => clearInterval(timer);
    }
  }, [films.length]);

  if (loading) return <p className="p-8">Chargement…</p>;
  if (!films.length)
    return (
      <div className="p-8">
        <Breadcrumb
          items={[
            { label: "Accueil", href: "/" },
            { label: "Nouveautés" },
          ]}
        />
        <p>Aucun film à la une pour l’instant.</p>
      </div>
    );

  const film = films[index];
  const realisateurs = [film.real1, film.real2].filter(Boolean).join(" & ");

  return (
    <div className="relative w-full min-h-[calc(100vh-4rem)] overflow-hidden bg-black text-white">
      {/* 🧭 Fil d’Ariane */}
      <div className="absolute top-0 left-0 right-0 z-20 p-4 md:p-8">
        <Breadcrumb
          items={[
            { label: "Accueil", href: "/" },
            { label: "Nouveautés" },
          ]}
        />
      </div>

      {/* 🖼️ Image de fond */}
      {film.miniature ? (
        <img
          src={film.miniature}
          alt={film.titre}
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700 opacity-100"
          loading="lazy"
          decoding="async"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-white/5 text-white/70">
          ⚠️ Pas de miniature
        </div>
      )}

      <div className="absolute inset-0 bg-black/60" />

      {/* 📜 Contenu du film mis en avant */}
      <div className="absolute inset-0 flex flex-col justify-center items-center text-center px-6">
        {/* ✅ Pastille cliquable redirige vers le catalogue filtré */}
        {film.status && (
          <div
            onClick={() =>
              navigate(`/catalogue?status=${encodeURIComponent(film.status)}`)
            }
            className="mb-4 inline-block bg-white/20 px-4 py-1 rounded-full text-sm font-semibold uppercase tracking-wide cursor-pointer hover:bg-white/30 transition"
          >
            {film.status}
          </div>
        )}

        <h1 className="text-5xl md:text-6xl font-bold mb-4">{film.titre}</h1>
        <p className="text-lg opacity-80 mb-4">
          {realisateurs} {film.annee && ` — ${film.annee}`}
        </p>

        {film.synopsis && (
          <div className="max-w-3xl max-h-60 md:max-h-72 overflow-y-auto px-4 mb-6 text-base leading-relaxed opacity-90 whitespace-pre-line">
            {film.synopsis}
          </div>
        )}

        <a
          href={`/projet/${film.id}`}
          className="mt-4 px-6 py-3 bg-white text-black rounded hover:bg-white/90 transition"
        >
          Regarder
        </a>
      </div>

      {/* 🔁 Boutons navigation carrousel */}
      {films.length > 1 && (
        <>
          <button
            onClick={() => setIndex((i) => (i - 1 + films.length) % films.length)}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-black/40 hover:bg-black/60 rounded-full"
          >
            <ChevronLeft className="w-8 h-8 text-white" />
          </button>
          <button
            onClick={() => setIndex((i) => (i + 1) % films.length)}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-black/40 hover:bg-black/60 rounded-full"
          >
            <ChevronRight className="w-8 h-8 text-white" />
          </button>
        </>
      )}

      {/* 🔘 Indicateurs */}
      {films.length > 1 && (
        <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2">
          {films.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 w-8 rounded-full transition-all duration-300 ${
                i === index ? "bg-white scale-110" : "bg-white/30"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
