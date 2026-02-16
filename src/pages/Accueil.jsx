import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import useFilms from "../hooks/useFilms";
import Papa from "papaparse";

const EDITO_CSV =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vRji8-c6KyC6q2l3Qtb2-bRk-NZ8YKGqGOojjBQ829DlZK1Qj8zRlDL4KQmy7I5TbwhjhG2BmfPIps-/pub?output=csv";

const COLORS = ["#FF0054", "#0096FF", "#00C49A", "#FFB800", "#C83CB9"];

/** 🎨 Couleur stable par texte (STATUS) */
function getStableColor(text) {
  if (!text) return "#666";
  let hash = 0;
  for (let i = 0; i < text.length; i++) hash = text.charCodeAt(i) + ((hash << 5) - hash);
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 70%, 45%)`;
}

export default function Accueil() {
  const navigate = useNavigate();

  // 🎬 Films
  const { data: films = [] } = useFilms();

  // 📰 Éditos
  const [editos, setEditos] = useState([]);

  useEffect(() => {
    async function fetchEditos() {
      const res = await fetch(EDITO_CSV);
      const text = await res.text();
      const parsed = Papa.parse(text, { header: true }).data;
      setEditos(parsed);
    }
    fetchEditos();
  }, []);

  // 🎬 Films formatés
  const formattedFilms = useMemo(() => {
    return films
      .filter((f) => f.MINIATURE)
      .map((f) => ({
        id: f.ID,
        titre: f.TITRE || "",
        annee: f.ANNEE || "",
        real: [f["REALISATEUR 1"], f["REALISATEUR 2"]].filter(Boolean).join(" & "),
        src: `/miniatures/${f.MINIATURE}`,
        type: "film",
        priorite: parseInt(f.PRIORITE) || 0,
        status: f.STATUS || "",
      }));
  }, [films]);

  // 📰 Éditos formatés
  const formattedEditos = useMemo(() => {
    return editos
      .filter((e) => e.TITRE || e.TEXTE)
      .map((e) => ({
        id: e.ID,
        titre: e.TITRE || "",
        texte: e.TEXTE || "",
        src: e.IMAGE ? `/edito/${e.IMAGE}` : "/miniatures/placeholder.jpg",
        url: e.URL || "#",
        type: "edito",
        priorite: parseInt(e.PRIORITE) || 0,
        status: e.STATUS || "",
      }));
  }, [editos]);

  // 🧠 Fusion + tri
  const allContent = useMemo(() => {
    return [...formattedFilms, ...formattedEditos].sort(
      (a, b) => (b.priorite || 0) - (a.priorite || 0)
    );
  }, [formattedFilms, formattedEditos]);

  // ⏱️ Rotation 20s
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 20000);
    return () => clearInterval(interval);
  }, []);

  const colorIndex = tick % COLORS.length;
  const offset = allContent.length ? tick % allContent.length : 0;

  // ✅ Tap-to-preview (mobile + desktop hover)
  const [activeTile, setActiveTile] = useState(null);

  // Escape = ferme preview
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") setActiveTile(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // 🧩 12 cases
  const gridItems = Array.from({ length: 12 }).map((_, i) => {
    if (i === 0) return { type: "text", content: "LA" };
    if (i === 2)
      return {
        type: "subtitle",
        content: "Découvrez des courts métrages indépendants et soutenez les créateurs.",
      };
    if (i === 5) return { type: "text", content: "BAIE" };
    if (i === 10) return { type: "text", content: "VITRÉE" };

    const item = allContent.length ? allContent[(offset + i) % allContent.length] : null;
    return item || { type: "empty" };
  });

  return (
    <div className="relative w-full min-h-[calc(100vh-4rem)] bg-black">
      {/* Grille principale */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 grid-rows-3 w-full h-[calc(100vh-4rem)] bg-black/90">
        {gridItems.map((item, i) => {
          // 🟦 Texte LA / BAIE / VITRÉE
          if (item.type === "text") {
            return (
              <div
                key={i}
                className="flex items-center justify-center text-white font-extrabold tracking-wide text-6xl sm:text-7xl lg:text-8xl transition-all duration-1000 hover:scale-[1.02] animate-fade-in"
                style={{ backgroundColor: COLORS[colorIndex] }}
              >
                {item.content}
              </div>
            );
          }

          // 📝 Bloc central
          if (item.type === "subtitle") {
            return (
              <div
                key={i}
                className="flex flex-col items-center justify-center text-white text-center p-5 transition-colors duration-1000 animate-fade-in"
                style={{ backgroundColor: COLORS[colorIndex] }}
              >
                <p className="text-sm sm:text-lg lg:text-2xl font-light leading-snug mb-4">
                  {item.content}
                </p>

                <div className="flex flex-wrap justify-center gap-2 mb-5">
                  <span className="px-2 py-1 rounded-full text-[10px] md:text-xs bg-black/25 border border-white/20">
                    Gratuit
                  </span>
                  <span className="px-2 py-1 rounded-full text-[10px] md:text-xs bg-black/25 border border-white/20">
                    Don volontaire
                  </span>
                  <span className="px-2 py-1 rounded-full text-[10px] md:text-xs bg-black/25 border border-white/20">
                    90/10
                  </span>
                </div>

                <div className="flex gap-3">
                  <Link
                    to="/nouveautes"
                    className="px-4 py-2 bg-white text-black rounded hover:bg-white/90 text-sm md:text-base transition"
                  >
                    Nouveautés
                  </Link>
                  <Link
                    to="/catalogue"
                    className="px-4 py-2 border border-white text-white rounded hover:bg-white/10 text-sm md:text-base transition"
                  >
                    Voir le catalogue
                  </Link>
                </div>
              </div>
            );
          }

          // 🎬 Film ou édito
          if (item.type === "film" || item.type === "edito") {
            const isActive = activeTile === i;

            const labelTop =
              item.type === "film" ? item.status || "FILM" : item.status || "ÉDITO";

            const open = () => {
              if (item.type === "film") navigate(`/projet/${item.id}`);
              else window.location.href = item.url;
            };

            const handleClick = () => {
              // Mobile: 1 tap = preview / focus, 2 tap = open
              if (!isActive) {
                setActiveTile(i);
                return;
              }
              open();
            };

            return (
              <button
                key={i}
                type="button"
                onClick={handleClick}
                onMouseEnter={() => setActiveTile(i)}
                onMouseLeave={() => setActiveTile(null)}
                className={[
                  "relative group overflow-hidden bg-black/50 text-left",
                  "transition focus:outline-none focus:ring-2 focus:ring-white/30",
                  // ✅ séparation premium (écrêtage)
                  "shadow-[inset_0_0_0_1px_rgba(255,255,255,0.10)]",
                  // ✅ grain ciné
                  "cine-grain",
                  isActive ? "ring-2 ring-white/15" : "",
                ].join(" ")}
              >
                {/* Image */}
                <div className="absolute inset-0">
                  <img
                    src={item.src}
                    alt={item.titre || "Projet"}
                    loading="lazy"
                    decoding="async"
                    className={[
                      "w-full h-full object-cover",
                      "transition duration-1000",
                      "opacity-95 group-hover:opacity-100",
                      "group-hover:scale-[1.03]",
                      isActive ? "scale-[1.02] opacity-100" : "",
                    ].join(" ")}
                  />
                </div>

                {/* Gradient overlay (léger en idle, fort en hover/active) */}
                <div
                  className={[
                    "absolute inset-0 z-10",
                    "bg-gradient-to-t from-black/75 via-black/20 to-black/5",
                    "transition-opacity duration-300",
                    "opacity-60 group-hover:opacity-100",
                    isActive ? "opacity-100" : "",
                  ].join(" ")}
                />

                {/* Badge STATUS */}
                {labelTop && (
                  <div
                    className="absolute top-3 left-3 z-30 text-xs font-bold px-3 py-1 rounded-full shadow-md border border-white/10"
                    style={{ backgroundColor: getStableColor(labelTop), color: "white" }}
                  >
                    {labelTop}
                  </div>
                )}

                {/* Infos uniquement en hover/active (pas visibles par défaut) */}
                <div
                  className={[
                    "absolute inset-0 z-20 flex flex-col justify-end p-4 md:p-5",
                    "transition-opacity duration-200",
                    "opacity-0 group-hover:opacity-100",
                    isActive ? "opacity-100" : "",
                  ].join(" ")}
                >
                  {item.titre && (
                    <h3 className="text-lg md:text-xl font-bold text-white leading-tight">
                      {item.titre}
                    </h3>
                  )}

                  {item.type === "film" ? (
                    <p className="text-sm text-gray-200 mt-1">
                      {item.annee ? item.annee : ""}
                      {item.annee && item.real ? " — " : ""}
                      {item.real}
                    </p>
                  ) : item.texte ? (
                    <p className="text-sm text-gray-200 mt-1 line-clamp-3">
                      {item.texte}
                    </p>
                  ) : null}

                  <div className="mt-3 flex items-center gap-2">
                    <span className="text-xs text-white/70">
                      {isActive ? "Re-tap pour ouvrir" : "Tap pour aperçu"}
                    </span>

                    {isActive && (
                      <span className="ml-auto text-xs px-2 py-1 rounded border border-white/20 bg-white/10">
                        Ouvrir →
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          }

          // 🪟 Case vide
          return <div key={i} className="bg-black/30" />;
        })}
      </div>
    </div>
  );
}
