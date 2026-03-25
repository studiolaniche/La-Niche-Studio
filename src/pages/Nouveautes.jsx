import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import useFilms from "../hooks/useFilms";
import Breadcrumb from "../components/Breadcrumb";

const ROTATION_MS = 8000;
const FADE_MS = 900;

function getDirectors(film) {
  return [film["REALISATEUR 1"], film["REALISATEUR 2"]].filter(Boolean);
}

function getActors(film) {
  return Array.from({ length: 15 }, (_, i) => film[`ACTEUR${i + 1}`]).filter(
    Boolean
  );
}

export default function Nouveautes() {
  const { data: rawFilms = [], isLoading: loading } = useFilms();
  const navigate = useNavigate();

  const films = useMemo(() => {
    return rawFilms
      .filter((f) => f.STATUS && String(f.STATUS).trim() !== "")
      .map((f) => {
        const miniature = f.MINIATURE
          ? String(f.MINIATURE).includes("/miniatures/")
            ? f.MINIATURE
            : `/miniatures/${f.MINIATURE}`
          : f.VIMEOID
          ? `https://vumbnail.com/${f.VIMEOID}.jpg`
          : "/miniatures/placeholder.jpg";

        return {
          ...f,
          id: f.ID,
          titre: f.TITRE || "Sans titre",
          annee: f.ANNEE || "",
          miniature,
          synopsis: f.SYNOPSIS || "",
          status: String(f.STATUS).trim(),
          directors: getDirectors(f),
          actors: getActors(f),
          collectif: f.COLLECTIF || "",
        };
      });
  }, [rawFilms]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [previousIndex, setPreviousIndex] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const transitionTimeoutRef = useRef(null);

  useEffect(() => {
    if (films.length > 0 && currentIndex >= films.length) {
      setCurrentIndex(0);
      setPreviousIndex(null);
      setIsTransitioning(false);
    }
  }, [films.length, currentIndex]);

  useEffect(() => {
    return () => {
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }
    };
  }, []);

  const goToIndex = (nextIndex) => {
    if (!films.length) return;
    if (nextIndex === currentIndex) return;

    if (transitionTimeoutRef.current) {
      clearTimeout(transitionTimeoutRef.current);
    }

    setPreviousIndex(currentIndex);
    setCurrentIndex(nextIndex);
    setIsTransitioning(true);

    transitionTimeoutRef.current = setTimeout(() => {
      setPreviousIndex(null);
      setIsTransitioning(false);
    }, FADE_MS);
  };

  const goToPrev = () => {
    if (films.length <= 1) return;
    const nextIndex = (currentIndex - 1 + films.length) % films.length;
    goToIndex(nextIndex);
  };

  const goToNext = () => {
    if (films.length <= 1) return;
    const nextIndex = (currentIndex + 1) % films.length;
    goToIndex(nextIndex);
  };

  useEffect(() => {
    if (films.length <= 1) return;
    if (isTransitioning) return;

    const interval = setInterval(() => {
      setPreviousIndex(currentIndex);
      setCurrentIndex((prev) => (prev + 1) % films.length);
      setIsTransitioning(true);
    }, ROTATION_MS);

    return () => clearInterval(interval);
  }, [films.length, currentIndex, isTransitioning]);

  useEffect(() => {
    if (!isTransitioning) return;

    if (transitionTimeoutRef.current) {
      clearTimeout(transitionTimeoutRef.current);
    }

    transitionTimeoutRef.current = setTimeout(() => {
      setPreviousIndex(null);
      setIsTransitioning(false);
    }, FADE_MS);

    return () => {
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }
    };
  }, [isTransitioning]);

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-black text-white p-8">
        <Breadcrumb
          items={[
            { label: "Accueil", href: "/" },
            { label: "Nouveautés" },
          ]}
        />
        <p className="mt-6 text-white/70">Chargement…</p>
      </div>
    );
  }

  if (!films.length) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-black text-white p-8">
        <Breadcrumb
          items={[
            { label: "Accueil", href: "/" },
            { label: "Nouveautés" },
          ]}
        />
        <p className="mt-6 text-white/70">Aucun film à la une pour l’instant.</p>
      </div>
    );
  }

  const currentFilm = films[currentIndex];
  const previousFilm =
    previousIndex !== null && films[previousIndex] ? films[previousIndex] : null;

  const realisateurs = currentFilm.directors.join(" & ");

  return (
    <div className="relative min-h-[calc(100vh-4rem)] overflow-hidden bg-black text-white">
      <div className="absolute top-0 left-0 right-0 z-30 p-4 md:p-8">
        <Breadcrumb
          items={[
            { label: "Accueil", href: "/" },
            { label: "Nouveautés" },
          ]}
        />
      </div>

      {/* Background */}
      <div className="absolute inset-0">
        {previousFilm && (
          <img
            src={previousFilm.miniature}
            alt={previousFilm.titre}
            className="absolute inset-0 h-full w-full object-cover opacity-100"
            loading="lazy"
            decoding="async"
          />
        )}

        <img
          key={currentFilm.id}
          src={currentFilm.miniature}
          alt={currentFilm.titre}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity ease-out ${
            isTransitioning ? "opacity-0" : "opacity-100"
          }`}
          style={{ transitionDuration: `${FADE_MS}ms` }}
          loading="lazy"
          decoding="async"
        />

        <div className="absolute inset-0 bg-black/55" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/35" />
      </div>

      {/* Content */}
      <div className="relative z-20 flex min-h-[calc(100vh-4rem)] items-end md:items-center">
        <div className="w-full px-6 pb-16 pt-28 md:px-12 md:pb-20">
          <div className="mx-auto max-w-6xl">
            <div
              className={`max-w-4xl transition-all ease-out ${
                isTransitioning
                  ? "translate-y-2 opacity-0"
                  : "translate-y-0 opacity-100"
              }`}
              style={{ transitionDuration: `${Math.max(500, FADE_MS - 100)}ms` }}
            >
              {currentFilm.status && (
                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      `/catalogue?status=${encodeURIComponent(currentFilm.status)}`
                    )
                  }
                  className="mb-5 inline-flex items-center rounded-full border border-white/20 bg-white/12 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.18em] text-white backdrop-blur-sm transition hover:bg-white/20"
                >
                  {currentFilm.status}
                </button>
              )}

              <h1 className="text-4xl font-semibold leading-none md:text-6xl md:leading-none">
                {currentFilm.titre}
              </h1>

              {(realisateurs || currentFilm.annee) && (
                <p className="mt-4 text-sm text-white/75 md:text-base">
                  {realisateurs}
                  {realisateurs && currentFilm.annee ? " — " : ""}
                  {currentFilm.annee}
                </p>
              )}

              {currentFilm.synopsis && (
                <div className="mt-6 max-w-2xl text-sm leading-relaxed text-white/88 md:text-base">
                  <p className="whitespace-pre-line line-clamp-6 md:line-clamp-none">
                    {currentFilm.synopsis}
                  </p>
                </div>
              )}

              {/* Pastilles navigation */}
              <div className="mt-6 flex flex-col gap-4">
                {currentFilm.directors.length > 0 && (
                  <div>
                    <p className="mb-2 text-xs font-medium uppercase tracking-[0.16em] text-white/55">
                      Réalisateur·ice·s
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {currentFilm.directors.map((d, i) => (
                        <Link
                          key={`${d}-${i}`}
                          to={`/catalogue?realisateur=${encodeURIComponent(d)}`}
                          className="rounded-full bg-white/12 px-3 py-1.5 text-xs text-white transition hover:bg-white/22"
                        >
                          {d}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {currentFilm.actors.length > 0 && (
                  <div>
                    <p className="mb-2 text-xs font-medium uppercase tracking-[0.16em] text-white/55">
                      Acteurs
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {currentFilm.actors.slice(0, 8).map((a, i) => (
                        <Link
                          key={`${a}-${i}`}
                          to={`/catalogue?acteur=${encodeURIComponent(a)}`}
                          className="rounded-full bg-white/7 px-3 py-1.5 text-xs text-white transition hover:bg-white/15"
                        >
                          {a}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {currentFilm.collectif && (
                  <div>
                    <p className="mb-2 text-xs font-medium uppercase tracking-[0.16em] text-white/55">
                      Collectif
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Link
                        to={`/catalogue?collectif=${encodeURIComponent(
                          currentFilm.collectif
                        )}`}
                        className="rounded-full bg-fuchsia-600/80 px-3 py-1.5 text-xs text-white transition hover:bg-fuchsia-500"
                      >
                        {currentFilm.collectif}
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => navigate(`/projet/${currentFilm.id}`)}
                  className="rounded-full bg-white px-6 py-3 text-sm font-medium text-black transition hover:bg-white/90"
                >
                  Regarder
                </button>

                {films.length > 1 && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={goToPrev}
                      aria-label="Film précédent"
                      className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-black/25 backdrop-blur-sm transition hover:bg-black/45"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>

                    <button
                      type="button"
                      onClick={goToNext}
                      aria-label="Film suivant"
                      className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-black/25 backdrop-blur-sm transition hover:bg-black/45"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dots */}
      {films.length > 1 && (
        <div className="absolute bottom-6 left-0 right-0 z-30 px-6">
          <div className="mx-auto flex max-w-6xl items-center justify-center gap-2 md:justify-start">
            {films.map((item, i) => (
              <button
                key={item.id || i}
                type="button"
                onClick={() => goToIndex(i)}
                aria-label={`Aller au film ${i + 1}`}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === currentIndex
                    ? "w-10 bg-white"
                    : "w-6 bg-white/30 hover:bg-white/50"
                }`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}