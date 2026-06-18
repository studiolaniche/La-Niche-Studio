import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

const COLORS = ["#FF0054", "#0096FF", "#00C49A", "#FFB800", "#C83CB9"];
const ROTATION_MS = 28000;
const FALLBACK_THUMB = "/miniatures/placeholder.jpg";

function getStableColor(text) {
  if (!text) return "#666";
  let hash = 0;

  for (let i = 0; i < text.length; i++) {
    hash = text.charCodeAt(i) + ((hash << 5) - hash);
  }

  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 70%, 45%)`;
}

function seededRandom(seed) {
  const x = Math.sin(seed * 9999.91) * 10000;
  return x - Math.floor(x);
}

function getStableDelay(slotIndex, max = 1600) {
  return Math.floor(seededRandom(slotIndex * 137.7) * max);
}

function isSameMedia(a, b) {
  if (!a || !b) return false;
  return a.id === b.id && a.type === b.type && a.src === b.src;
}

function preloadImage(src) {
  return new Promise((resolve) => {
    if (!src) return resolve(false);

    const img = new Image();
    img.src = src;

    if (img.complete) return resolve(true);

    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
  });
}

async function preloadMany(sources = []) {
  const unique = [...new Set(sources.filter(Boolean))];
  if (!unique.length) return;
  await Promise.all(unique.map((src) => preloadImage(src)));
}

function BubbleHintPopup() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const alreadySeen = sessionStorage.getItem("bubbleHintSeen");

    if (!alreadySeen) {
      const timer = setTimeout(() => {
        setVisible(true);
      }, 1600);

      return () => clearTimeout(timer);
    }
  }, []);

  const close = () => {
    sessionStorage.setItem("bubbleHintSeen", "true");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-[330px] rounded-2xl border border-white/15 bg-black/80 p-4 text-white shadow-2xl backdrop-blur-md">
      <button
        type="button"
        onClick={close}
        className="absolute right-3 top-2 text-xl leading-none text-white/50 transition hover:text-white"
        aria-label="Fermer"
      >
        ×
      </button>

      <p className="pr-6 text-sm font-semibold leading-snug">
        Astuce : tout est cliquable !
      </p>

      <p className="mt-2 text-xs leading-relaxed text-white/70">
        Cliquez sur les pastilles pour naviguer de film en film.
      </p>

      <button
        type="button"
        onClick={close}
        className="mt-4 rounded-full bg-white px-4 py-2 text-xs font-semibold text-black transition hover:bg-white/90"
      >
        Compris
      </button>
    </div>
  );
}

function SmoothColorTile({
  children,
  color,
  tick,
  slotIndex,
  className = "",
  innerClassName = "",
}) {
  const [baseColor, setBaseColor] = useState(color);
  const [overlayColor, setOverlayColor] = useState(null);
  const [showOverlay, setShowOverlay] = useState(false);

  useEffect(() => {
    if (baseColor === color) return;

    let cancelled = false;
    const delay = getStableDelay(slotIndex, 1400);

    const startTimer = setTimeout(() => {
      if (cancelled) return;

      setOverlayColor(color);

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (!cancelled) setShowOverlay(true);
        });
      });
    }, delay);

    return () => {
      cancelled = true;
      clearTimeout(startTimer);
    };
  }, [color, baseColor, tick, slotIndex]);

  useEffect(() => {
    if (!showOverlay || !overlayColor) return;

    const endTimer = setTimeout(() => {
      setBaseColor(overlayColor);
      setOverlayColor(null);
      setShowOverlay(false);
    }, 2600);

    return () => clearTimeout(endTimer);
  }, [showOverlay, overlayColor]);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(135deg, ${baseColor} 0%, ${baseColor}dd 45%, ${baseColor}bb 100%)`,
        }}
      />

      {overlayColor && (
        <div
          className="absolute inset-0 transition-opacity duration-[2600ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
          style={{
            background: `linear-gradient(135deg, ${overlayColor} 0%, ${overlayColor}dd 45%, ${overlayColor}bb 100%)`,
            opacity: showOverlay ? 1 : 0,
          }}
        />
      )}

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.14),transparent_38%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.08),transparent_36%)]" />

      <div className={`relative z-10 h-full ${innerClassName}`}>{children}</div>
    </div>
  );
}

function RotatingMediaTile({
  item,
  tick,
  slotIndex,
  isActive,
  setActiveTile,
  navigate,
}) {
  const [currentItem, setCurrentItem] = useState(item);
  const [nextItem, setNextItem] = useState(null);
  const [showNext, setShowNext] = useState(false);

  const transitionTokenRef = useRef(0);

  useEffect(() => {
    setCurrentItem(item);
  }, []);

  useEffect(() => {
    if (!item) return;

    if (!currentItem) {
      setCurrentItem(item);
      return;
    }

    if (isSameMedia(currentItem, item)) return;

    let cancelled = false;
    const token = Date.now() + slotIndex + tick;
    transitionTokenRef.current = token;

    const delay = getStableDelay(slotIndex, 1800);
    let localTimer = null;

    async function run() {
      await preloadImage(item.src);

      if (cancelled || transitionTokenRef.current !== token) return;

      localTimer = setTimeout(() => {
        if (cancelled || transitionTokenRef.current !== token) return;

        setNextItem(item);

        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            if (!cancelled && transitionTokenRef.current === token) {
              setShowNext(true);
            }
          });
        });
      }, delay);
    }

    run();

    return () => {
      cancelled = true;
      if (localTimer) clearTimeout(localTimer);
    };
  }, [item, currentItem, tick, slotIndex]);

  useEffect(() => {
    if (!showNext || !nextItem) return;

    const finalizeTimer = setTimeout(() => {
      setCurrentItem(nextItem);
      setNextItem(null);
      setShowNext(false);
    }, 1500);

    return () => clearTimeout(finalizeTimer);
  }, [showNext, nextItem]);

  const displayedItem = nextItem || currentItem;

  if (!displayedItem) return <div className="bg-black/20" />;

  const handleOpen = () => {
    if (displayedItem.type === "film") {
      navigate(`/projet/${displayedItem.slug || displayedItem.id}`);
      return;
    }

    if (displayedItem.url && displayedItem.url !== "#") {
      if (displayedItem.url.startsWith("/")) {
        navigate(displayedItem.url);
      } else {
        window.location.href = displayedItem.url;
      }
    }
  };

  const handleClick = () => {
    if (!isActive) {
      setActiveTile(slotIndex);
      return;
    }

    handleOpen();
  };

  const statusLabel =
    displayedItem.status || (displayedItem.type === "film" ? "FILM" : "ÉDITO");

  return (
    <button
      type="button"
      onClick={handleClick}
      onMouseEnter={() => setActiveTile(slotIndex)}
      onMouseLeave={() => setActiveTile(null)}
      className={[
        "relative overflow-hidden bg-black/40 text-left",
        "shadow-[inset_0_0_0_1px_rgba(255,255,255,0.10)]",
        "focus:outline-none focus:ring-2 focus:ring-white/30",
        "cine-grain",
        isActive ? "ring-2 ring-white/15" : "",
      ].join(" ")}
    >
      <div className="absolute inset-0 overflow-hidden">
        {currentItem && (
          <img
            src={currentItem.src}
            alt={currentItem.titre || "Projet"}
            loading="lazy"
            decoding="async"
            onError={(e) => {
              e.currentTarget.src = FALLBACK_THUMB;
            }}
            className={[
              "absolute inset-0 h-full w-full object-cover",
              "transition-[opacity,transform] duration-[1500ms] ease-[cubic-bezier(0.22,1,0.36,1)]",
              "will-change-[opacity,transform] [transform:translateZ(0)]",
              showNext ? "opacity-0 scale-[1.02]" : "opacity-95 scale-100",
            ].join(" ")}
          />
        )}

        {nextItem && (
          <img
            src={nextItem.src}
            alt={nextItem.titre || "Projet"}
            loading="eager"
            decoding="async"
            onError={(e) => {
              e.currentTarget.src = FALLBACK_THUMB;
            }}
            className={[
              "absolute inset-0 h-full w-full object-cover",
              "transition-[opacity,transform] duration-[1500ms] ease-[cubic-bezier(0.22,1,0.36,1)]",
              "will-change-[opacity,transform] [transform:translateZ(0)]",
              showNext ? "opacity-95 scale-100" : "opacity-0 scale-[1.04]",
            ].join(" ")}
          />
        )}
      </div>

      <div
        className={[
          "absolute inset-0 z-10 bg-gradient-to-t from-black/75 via-black/25 to-black/5",
          "transition-opacity duration-500",
          isActive ? "opacity-100" : "opacity-70 hover:opacity-100",
        ].join(" ")}
      />

      {statusLabel && (
        <div
          className="absolute left-3 top-3 z-30 rounded-full border border-white/10 px-3 py-1 text-xs font-bold text-white shadow-md"
          style={{ backgroundColor: getStableColor(statusLabel) }}
        >
          {statusLabel}
        </div>
      )}

      <div
        className={[
          "absolute inset-0 z-20 flex flex-col justify-end p-4 md:p-5",
          "transition-opacity duration-300",
          isActive ? "opacity-100" : "opacity-0 hover:opacity-100",
        ].join(" ")}
      >
        {displayedItem.titre && (
          <h3 className="text-lg font-bold leading-tight text-white md:text-xl">
            {displayedItem.titre}
          </h3>
        )}

        {displayedItem.type === "film" ? (
          <p className="mt-1 text-sm text-gray-200">
            {displayedItem.annee || ""}
            {displayedItem.annee && displayedItem.real ? " — " : ""}
            {displayedItem.real || ""}
          </p>
        ) : displayedItem.texte ? (
          <p className="mt-1 line-clamp-3 text-sm text-gray-200">
            {displayedItem.texte}
          </p>
        ) : null}

        <div className="mt-3 flex items-center gap-2">
          <span className="text-xs text-white/70">
            {isActive ? "Re-tap pour ouvrir" : "Tap pour aperçu"}
          </span>

          {isActive && (
            <span className="ml-auto rounded border border-white/20 bg-white/10 px-2 py-1 text-xs">
              Ouvrir →
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

function LoadingLanding() {
  return (
    <div className="relative min-h-[calc(100vh-4rem)] w-full bg-black">
      <div className="grid h-[calc(100vh-4rem)] w-full grid-cols-1 grid-rows-3 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 12 }).map((_, index) => (
          <div
            key={index}
            className="relative overflow-hidden border border-white/5 bg-white/[0.04]"
          >
            <div className="absolute inset-0 animate-pulse bg-[linear-gradient(110deg,transparent,rgba(255,255,255,0.06),transparent)]" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Accueil() {
  const navigate = useNavigate();

  const [films, setFilms] = useState([]);
  const [filmsLoading, setFilmsLoading] = useState(true);

  const [editos, setEditos] = useState([]);
  const [editosLoading, setEditosLoading] = useState(true);

  const [initialReady, setInitialReady] = useState(false);
  const [tick, setTick] = useState(0);
  const [activeTile, setActiveTile] = useState(null);

  useEffect(() => {
    async function fetchFilms() {
      try {
        setFilmsLoading(true);

        const { data, error } = await supabase
          .from("films")
          .select("*")
          .eq("is_published", true)
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Erreur Supabase films :", error);
          setFilms([]);
          return;
        }

        setFilms(data || []);
      } catch (error) {
        console.error("Erreur chargement films :", error);
        setFilms([]);
      } finally {
        setFilmsLoading(false);
      }
    }

    fetchFilms();
  }, []);

  useEffect(() => {
    async function fetchEditos() {
      try {
        setEditosLoading(true);

        const { data, error } = await supabase
          .from("editos")
          .select("*")
          .eq("is_published", true)
          .order("poids", { ascending: false })
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Erreur Supabase éditos :", error);
          setEditos([]);
          return;
        }

        setEditos(data || []);
      } catch (error) {
        console.error("Erreur chargement éditos :", error);
        setEditos([]);
      } finally {
        setEditosLoading(false);
      }
    }

    fetchEditos();
  }, []);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        setActiveTile(null);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const formattedFilms = useMemo(() => {
    return films.map((film) => ({
      id: film.id,
      slug: film.slug,
      titre: film.titre || "",
      annee: film.annee || "",
      real: [film.realisateur_1, film.realisateur_2].filter(Boolean).join(" & "),
      src:
        film.miniature_url ||
        (film.vimeo_id
          ? `https://vumbnail.com/${film.vimeo_id}.jpg`
          : FALLBACK_THUMB),
      type: "film",
      priorite: 0,
      status: film.status || "FILM",
    }));
  }, [films]);

  const formattedEditos = useMemo(() => {
    return editos.map((edito) => ({
      id: edito.id,
      titre: edito.titre || "",
      texte: edito.texte || "",
      src: edito.image_url || FALLBACK_THUMB,
      url: edito.url || "#",
      type: "edito",
      priorite: Number(edito.poids) || 0,
      status: edito.status || "ÉDITO",
    }));
  }, [editos]);

  const allContent = useMemo(() => {
    return [...formattedFilms, ...formattedEditos].sort(
      (a, b) => (b.priorite || 0) - (a.priorite || 0)
    );
  }, [formattedFilms, formattedEditos]);

  const baseGridItems = useMemo(() => {
    return Array.from({ length: 12 }).map((_, index) => {
      if (index === 0) return { type: "text", content: "LA" };

      if (index === 2) {
        return {
          type: "subtitle",
          content: "La plateforme grenobloise du court-métrage indépendant !",
        };
      }

      if (index === 5) return { type: "text", content: "BAIE" };
      if (index === 10) return { type: "text", content: "VITRÉE" };

      const item = allContent.length ? allContent[index % allContent.length] : null;
      return item || { type: "empty" };
    });
  }, [allContent]);

  useEffect(() => {
    let cancelled = false;

    async function prepareInitialRender() {
      const dataReady = !filmsLoading && !editosLoading && allContent.length > 0;

      if (!dataReady) return;

      const initialSources = baseGridItems
        .filter((item) => item.type === "film" || item.type === "edito")
        .map((item) => item.src)
        .filter(Boolean);

      await preloadMany(initialSources);

      if (!cancelled) {
        setInitialReady(true);
      }
    }

    prepareInitialRender();

    return () => {
      cancelled = true;
    };
  }, [filmsLoading, editosLoading, allContent.length, baseGridItems]);

  useEffect(() => {
    if (!initialReady) return;

    const interval = setInterval(() => {
      setTick((value) => value + 1);
    }, ROTATION_MS);

    return () => clearInterval(interval);
  }, [initialReady]);

  const colorIndex = tick % COLORS.length;
  const offset = allContent.length ? tick % allContent.length : 0;

  const gridItems = useMemo(() => {
    return Array.from({ length: 12 }).map((_, index) => {
      if (index === 0) return { type: "text", content: "LA" };

      if (index === 2) {
        return {
          type: "subtitle",
          content: "La plateforme grenobloise du court-métrage indépendant !",
        };
      }

      if (index === 5) return { type: "text", content: "BAIE" };
      if (index === 10) return { type: "text", content: "VITRÉE" };

      const item = allContent.length
        ? allContent[(offset + index) % allContent.length]
        : null;

      return item || { type: "empty" };
    });
  }, [allContent, offset]);

  useEffect(() => {
    if (!initialReady) return;

    const upcomingSources = gridItems
      .filter((item) => item.type === "film" || item.type === "edito")
      .map((item) => item.src)
      .filter(Boolean);

    preloadMany(upcomingSources);
  }, [gridItems, initialReady]);

  const showLoader =
    !initialReady || filmsLoading || editosLoading || !allContent.length;

  if (showLoader) {
    return <LoadingLanding />;
  }

  return (
    <div className="relative min-h-[calc(100vh-4rem)] w-full bg-black">
      <div className="grid h-[calc(100vh-4rem)] w-full grid-cols-1 grid-rows-3 bg-black/90 sm:grid-cols-2 lg:grid-cols-4">
        {gridItems.map((item, index) => {
          if (item.type === "text") {
            return (
              <SmoothColorTile
                key={index}
                color={COLORS[colorIndex]}
                tick={tick}
                slotIndex={index}
                className="flex items-center justify-center"
                innerClassName="flex items-center justify-center"
              >
                <div className="text-6xl font-extrabold tracking-wide text-white transition-transform duration-700 hover:scale-[1.02] sm:text-7xl lg:text-8xl">
                  {item.content}
                </div>
              </SmoothColorTile>
            );
          }

          if (item.type === "subtitle") {
            return (
              <SmoothColorTile
                key={index}
                color={COLORS[colorIndex]}
                tick={tick}
                slotIndex={index}
                className="flex items-center justify-center p-5 text-center text-white"
                innerClassName="flex h-full flex-col items-center justify-center"
              >
                <p className="mb-4 max-w-[28rem] text-sm font-light leading-snug sm:text-lg lg:text-2xl">
                  {item.content}
                </p>

                <div className="mb-5 flex flex-wrap justify-center gap-2">
                  <span className="rounded-full border border-white/20 bg-black/25 px-2 py-1 text-[10px] backdrop-blur-sm md:text-xs">
                    Gratuit
                  </span>
                  <span className="rounded-full border border-white/20 bg-black/25 px-2 py-1 text-[10px] backdrop-blur-sm md:text-xs">
                    Don volontaire
                  </span>
                  <span className="rounded-full border border-white/20 bg-black/25 px-2 py-1 text-[10px] backdrop-blur-sm md:text-xs">
                    Ouverte à tous
                  </span>
                </div>

                <div className="flex gap-3">
                  <Link
                    to="/nouveautes"
                    className="rounded bg-white px-4 py-2 text-sm text-black transition hover:bg-white/90 md:text-base"
                  >
                    Nouveautés
                  </Link>

                  <Link
                    to="/catalogue"
                    className="rounded border border-white px-4 py-2 text-sm text-white transition hover:bg-white/10 md:text-base"
                  >
                    Voir le catalogue
                  </Link>
                </div>
              </SmoothColorTile>
            );
          }

          if (item.type === "film" || item.type === "edito") {
            return (
              <RotatingMediaTile
                key={index}
                item={item}
                tick={tick}
                slotIndex={index}
                isActive={activeTile === index}
                setActiveTile={setActiveTile}
                navigate={navigate}
              />
            );
          }

          return <div key={index} className="bg-black/25" />;
        })}
      </div>

      <BubbleHintPopup />
    </div>
  );
}