import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Papa from "papaparse";
import useFilms from "../hooks/useFilms";

const EDITO_CSV =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vRji8-c6KyC6q2l3Qtb2-bRk-NZ8YKGqGOojjBQ829DlZK1Qj8zRlDL4KQmy7I5TbwhjhG2BmfPIps-/pub?output=csv";

const COLORS = ["#FF0054", "#0096FF", "#00C49A", "#FFB800", "#C83CB9"];
const ROTATION_MS = 28000;
const LOADER_MIN_MS = 1100;
const LOADER_MAX_MS = 4500;
const MEDIA_FADE_MS = 1200;

/* ---------------- helpers ---------------- */

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
    if (!src) {
      resolve();
      return;
    }

    const img = new Image();
    img.src = src;

    if (img.complete) {
      resolve();
      return;
    }

    img.onload = () => resolve();
    img.onerror = () => resolve();
  });
}

function preloadImages(sources = []) {
  const uniqueSources = [...new Set(sources.filter(Boolean))];
  return Promise.allSettled(uniqueSources.map((src) => preloadImage(src)));
}

/* ---------------- loader ---------------- */

function WindowLoader() {
  return (
    <div className="flex flex-col items-center gap-6">
      <div className="relative flex items-center justify-center">
        <svg
          viewBox="0 0 220 220"
          className="h-40 w-40 sm:h-48 sm:w-48"
          aria-hidden="true"
        >
          <rect x="0" y="0" width="220" height="220" fill="transparent" />

          <rect
            x="35"
            y="35"
            width="150"
            height="150"
            rx="6"
            fill="none"
            stroke="white"
            strokeWidth="8"
          />

          <line
            x1="110"
            y1="35"
            x2="110"
            y2="185"
            stroke="white"
            strokeWidth="6"
            opacity="0.9"
          />

          <circle cx="98" cy="110" r="3.5" fill="white" className="animate-windowHandleLeft" />
          <circle cx="122" cy="110" r="3.5" fill="white" className="animate-windowHandleRight" />

          <g className="origin-[110px_110px] animate-windowLeft">
            <rect
              x="39"
              y="39"
              width="67"
              height="142"
              rx="4"
              fill="none"
              stroke="white"
              strokeWidth="6"
            />
          </g>

          <g className="origin-[110px_110px] animate-windowRight">
            <rect
              x="114"
              y="39"
              width="67"
              height="142"
              rx="4"
              fill="none"
              stroke="white"
              strokeWidth="6"
            />
          </g>

          <g className="animate-windowImpact origin-center">
            <line x1="110" y1="101" x2="110" y2="119" stroke="white" strokeWidth="3" />
            <line x1="101" y1="110" x2="119" y2="110" stroke="white" strokeWidth="3" />
            <line x1="103" y1="103" x2="108" y2="108" stroke="white" strokeWidth="2.5" />
            <line x1="117" y1="103" x2="112" y2="108" stroke="white" strokeWidth="2.5" />
            <line x1="103" y1="117" x2="108" y2="112" stroke="white" strokeWidth="2.5" />
            <line x1="117" y1="117" x2="112" y2="112" stroke="white" strokeWidth="2.5" />
          </g>
        </svg>
      </div>

      <div className="text-center text-white">
        <div className="text-[11px] uppercase tracking-[0.38em] text-white/70 sm:text-sm">
          Chargement
        </div>
      </div>
    </div>
  );
}

function OpeningLoader({ visible }) {
  return (
    <div
      className={[
        "fixed inset-0 z-[9999] flex items-center justify-center bg-black",
        "transition-opacity duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]",
        visible ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
      ].join(" ")}
      aria-hidden={!visible}
    >
      <WindowLoader />

      <style>
        {`
          @keyframes windowLeft {
            0% {
              transform: perspective(500px) rotateY(-68deg) scale(0.98);
            }
            52% {
              transform: perspective(500px) rotateY(0deg) scale(1);
            }
            62% {
              transform: perspective(500px) rotateY(8deg) scale(1.01);
            }
            74% {
              transform: perspective(500px) rotateY(-3deg) scale(1);
            }
            100% {
              transform: perspective(500px) rotateY(0deg) scale(1);
            }
          }

          @keyframes windowRight {
            0% {
              transform: perspective(500px) rotateY(68deg) scale(0.98);
            }
            52% {
              transform: perspective(500px) rotateY(0deg) scale(1);
            }
            62% {
              transform: perspective(500px) rotateY(-8deg) scale(1.01);
            }
            74% {
              transform: perspective(500px) rotateY(3deg) scale(1);
            }
            100% {
              transform: perspective(500px) rotateY(0deg) scale(1);
            }
          }

          @keyframes windowImpact {
            0%, 45% {
              opacity: 0;
              transform: scale(0.4);
            }
            52% {
              opacity: 1;
              transform: scale(1.15);
            }
            64% {
              opacity: 0.65;
              transform: scale(0.92);
            }
            100% {
              opacity: 0;
              transform: scale(0.5);
            }
          }

          @keyframes windowHandleLeft {
            0% {
              transform: translateX(-10px);
              opacity: 0.7;
            }
            52% {
              transform: translateX(0);
              opacity: 1;
            }
            100% {
              transform: translateX(0);
              opacity: 1;
            }
          }

          @keyframes windowHandleRight {
            0% {
              transform: translateX(10px);
              opacity: 0.7;
            }
            52% {
              transform: translateX(0);
              opacity: 1;
            }
            100% {
              transform: translateX(0);
              opacity: 1;
            }
          }

          .animate-windowLeft {
            animation: windowLeft 1.25s cubic-bezier(0.22, 1, 0.36, 1) infinite;
            transform-box: fill-box;
          }

          .animate-windowRight {
            animation: windowRight 1.25s cubic-bezier(0.22, 1, 0.36, 1) infinite;
            transform-box: fill-box;
          }

          .animate-windowImpact {
            animation: windowImpact 1.25s ease-out infinite;
            transform-box: fill-box;
            transform-origin: center;
          }

          .animate-windowHandleLeft {
            animation: windowHandleLeft 1.25s cubic-bezier(0.22, 1, 0.36, 1) infinite;
          }

          .animate-windowHandleRight {
            animation: windowHandleRight 1.25s cubic-bezier(0.22, 1, 0.36, 1) infinite;
          }
        `}
      </style>
    </div>
  );
}

/* ---------------- smooth color tile ---------------- */

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

      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.14),transparent_38%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.08),transparent_36%)]" />

      <div className={`relative z-10 h-full ${innerClassName}`}>{children}</div>
    </div>
  );
}

/* ---------------- media tile ---------------- */

function RotatingMediaTile({
  item,
  tick,
  slotIndex,
  isActive,
  setActiveTile,
  navigate,
}) {
  const [currentItem, setCurrentItem] = useState(item || null);
  const [incomingItem, setIncomingItem] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const transitionIdRef = useRef(0);

  useEffect(() => {
    if (!item) return;

    if (!currentItem) {
      setCurrentItem(item);
      return;
    }

    if (isSameMedia(currentItem, item)) return;

    let cancelled = false;
    const transitionId = transitionIdRef.current + 1;
    transitionIdRef.current = transitionId;
    const delay = getStableDelay(slotIndex, 1200);

    const startTransition = async () => {
      await preloadImage(item.src);
      if (cancelled || transitionIdRef.current !== transitionId) return;

      const delayTimer = setTimeout(() => {
        if (cancelled || transitionIdRef.current !== transitionId) return;

        setIncomingItem(item);

        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            if (cancelled || transitionIdRef.current !== transitionId) return;
            setIsTransitioning(true);
          });
        });

        const finalizeTimer = setTimeout(() => {
          if (cancelled || transitionIdRef.current !== transitionId) return;
          setCurrentItem(item);
          setIncomingItem(null);
          setIsTransitioning(false);
        }, MEDIA_FADE_MS);

        transitionIdRef.current = transitionId;

        return () => clearTimeout(finalizeTimer);
      }, delay);

      return () => clearTimeout(delayTimer);
    };

    let localCleanup;
    startTransition().then((cleanup) => {
      localCleanup = cleanup;
    });

    return () => {
      cancelled = true;
      if (typeof localCleanup === "function") localCleanup();
    };
  }, [item, currentItem, tick, slotIndex]);

  const displayedItem = incomingItem || currentItem;
  if (!displayedItem) {
    return <div className="bg-black/25" />;
  }

  const statusLabel =
    displayedItem.status || (displayedItem.type === "film" ? "FILM" : "ÉDITO");

  const handleOpen = () => {
    if (displayedItem.type === "film") {
      navigate(`/projet/${displayedItem.id}`);
      return;
    }

    if (displayedItem.url) {
      window.location.href = displayedItem.url;
    }
  };

  const handleClick = () => {
    if (!isActive) {
      setActiveTile(slotIndex);
      return;
    }
    handleOpen();
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      onMouseEnter={() => setActiveTile(slotIndex)}
      onMouseLeave={() => setActiveTile(null)}
      className={[
        "group relative overflow-hidden bg-black/40 text-left",
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
            className={[
              "absolute inset-0 h-full w-full object-cover",
              "transition-[opacity,transform] ease-[cubic-bezier(0.22,1,0.36,1)]",
              "will-change-[opacity,transform] [transform:translateZ(0)]",
              isTransitioning ? "opacity-0 scale-[1.02]" : "opacity-95 scale-100",
            ].join(" ")}
            style={{
              backfaceVisibility: "hidden",
              transitionDuration: `${MEDIA_FADE_MS}ms`,
            }}
          />
        )}

        {incomingItem && (
          <img
            src={incomingItem.src}
            alt={incomingItem.titre || "Projet"}
            loading="eager"
            decoding="async"
            className={[
              "absolute inset-0 h-full w-full object-cover",
              "transition-[opacity,transform] ease-[cubic-bezier(0.22,1,0.36,1)]",
              "will-change-[opacity,transform] [transform:translateZ(0)]",
              isTransitioning ? "opacity-95 scale-100" : "opacity-0 scale-[1.04]",
            ].join(" ")}
            style={{
              backfaceVisibility: "hidden",
              transitionDuration: `${MEDIA_FADE_MS}ms`,
            }}
          />
        )}
      </div>

      <div
        className={[
          "absolute inset-0 z-10 bg-gradient-to-t from-black/75 via-black/25 to-black/5",
          "transition-opacity duration-500",
          isActive ? "opacity-100" : "opacity-70 group-hover:opacity-100",
        ].join(" ")}
      />

      {displayedItem.type === "edito" && statusLabel && (
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
          isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100",
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
          <p className="mt-1 line-clamp-3 text-sm text-gray-200">{displayedItem.texte}</p>
        ) : null}

        <div className="mt-3 flex items-center gap-2">
          <span className="text-xs text-white/70">
            {isActive ? "Re-tap pour ouvrir" : "Tap pour aperçu"}
          </span>

          {isActive && (
            <span className="ml-auto rounded border border-white/20 bg-white/10 px-2 py-1 text-xs text-white">
              Ouvrir →
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

/* ---------------- main component ---------------- */

export default function Accueil() {
  const navigate = useNavigate();
  const filmsHook = useFilms();

  const films = Array.isArray(filmsHook?.data)
    ? filmsHook.data
    : Array.isArray(filmsHook)
      ? filmsHook
      : [];

  const [editos, setEditos] = useState([]);
  const [tick, setTick] = useState(0);
  const [activeTile, setActiveTile] = useState(null);
  const [loaderVisible, setLoaderVisible] = useState(true);

  useEffect(() => {
    async function fetchEditos() {
      try {
        const response = await fetch(EDITO_CSV);
        const csvText = await response.text();
        const parsed = Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
        }).data;

        setEditos(Array.isArray(parsed) ? parsed : []);
      } catch (error) {
        console.error("Erreur chargement éditos :", error);
        setEditos([]);
      }
    }

    fetchEditos();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setTick((value) => value + 1);
    }, ROTATION_MS);

    return () => clearInterval(interval);
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
    return films
      .filter((film) => film?.MINIATURE)
      .map((film) => ({
        id: film.ID,
        titre: film.TITRE || "",
        annee: film.ANNEE || "",
        real: [film["REALISATEUR 1"], film["REALISATEUR 2"]].filter(Boolean).join(" & "),
        src: `/miniatures/${film.MINIATURE}`,
        type: "film",
        priorite: parseInt(film.PRIORITE, 10) || 0,
        status: film.STATUS || "",
      }));
  }, [films]);

  const formattedEditos = useMemo(() => {
    return editos
      .filter((edito) => edito?.TITRE || edito?.TEXTE)
      .map((edito) => ({
        id: edito.ID || edito.TITRE || Math.random().toString(36).slice(2),
        titre: edito.TITRE || "",
        texte: edito.TEXTE || "",
        src: edito.IMAGE ? `/edito/${edito.IMAGE}` : "/miniatures/placeholder.jpg",
        url: edito.URL || "#",
        type: "edito",
        priorite: parseInt(edito.PRIORITE, 10) || 0,
        status: edito.STATUS || "",
      }));
  }, [editos]);

  const allContent = useMemo(() => {
    return [...formattedFilms, ...formattedEditos].sort(
      (a, b) => (b.priorite || 0) - (a.priorite || 0)
    );
  }, [formattedFilms, formattedEditos]);

  const colorIndex = tick % COLORS.length;
  const offset = allContent.length ? tick % allContent.length : 0;

  const gridItems = useMemo(() => {
    return Array.from({ length: 12 }).map((_, index) => {
      if (index === 0) return { type: "text", content: "LA" };

      if (index === 2) {
        return {
          type: "subtitle",
          content: "Découvrez des courts métrages indépendants et soutenez les créateurs.",
        };
      }

      if (index === 5) return { type: "text", content: "BAIE" };
      if (index === 10) return { type: "text", content: "VITRÉE" };

      const item = allContent.length ? allContent[(offset + index) % allContent.length] : null;
      return item || { type: "empty" };
    });
  }, [allContent, offset]);

  const allSourcesToPreload = useMemo(() => {
    return allContent.map((item) => item.src).filter(Boolean);
  }, [allContent]);

  useEffect(() => {
    let cancelled = false;

    async function runLoader() {
      const minimumDuration = new Promise((resolve) =>
        setTimeout(resolve, LOADER_MIN_MS)
      );

      const maximumDuration = new Promise((resolve) =>
        setTimeout(resolve, LOADER_MAX_MS)
      );

      await Promise.all([
        minimumDuration,
        Promise.race([preloadImages(allSourcesToPreload), maximumDuration]),
      ]);

      if (!cancelled) {
        setLoaderVisible(false);
      }
    }

    if (allSourcesToPreload.length > 0) {
      runLoader();
    } else {
      const fallbackTimer = setTimeout(() => {
        if (!cancelled) {
          setLoaderVisible(false);
        }
      }, LOADER_MIN_MS);

      return () => {
        cancelled = true;
        clearTimeout(fallbackTimer);
      };
    }

    return () => {
      cancelled = true;
    };
  }, [allSourcesToPreload]);

  useEffect(() => {
    const upcomingSources = gridItems
      .filter((item) => item.type === "film" || item.type === "edito")
      .map((item) => item.src)
      .filter(Boolean);

    preloadImages(upcomingSources);
  }, [gridItems]);

  return (
    <>
      <OpeningLoader visible={loaderVisible} />

      <div
        className={[
          "relative min-h-[calc(100vh-4rem)] w-full bg-black",
          "transition-opacity duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]",
          loaderVisible ? "opacity-0" : "opacity-100",
        ].join(" ")}
      >
        <div className="grid h-[calc(100vh-4rem)] w-full grid-cols-1 grid-rows-3 bg-black/90 sm:grid-cols-2 lg:grid-cols-4">
          {gridItems.map((item, index) => {
            if (item.type === "text") {
              return (
                <SmoothColorTile
                  key={`text-${index}-${item.content}`}
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
                  key={`subtitle-${index}`}
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
                      90/10
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
                  key={`media-slot-${index}`}
                  item={item}
                  tick={tick}
                  slotIndex={index}
                  isActive={activeTile === index}
                  setActiveTile={setActiveTile}
                  navigate={navigate}
                />
              );
            }

            return <div key={`empty-${index}`} className="bg-black/25" />;
          })}
        </div>
      </div>
    </>
  );
}