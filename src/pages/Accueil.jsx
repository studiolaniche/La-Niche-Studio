import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import useFilms from "../hooks/useFilms";
import Papa from "papaparse";

const EDITO_CSV =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vRji8-c6KyC6q2l3Qtb2-bRk-NZ8YKGqGOojjBQ829DlZK1Qj8zRlDL4KQmy7I5TbwhjhG2BmfPIps-/pub?output=csv";

const COLORS = ["#FF0054", "#0096FF", "#00C49A", "#FFB800", "#C83CB9"];

export default function Accueil() {
  const navigate = useNavigate();

  // 🎬 1. On récupère les films via le hook (chargés depuis ton JSON/Google Sheet)
  const { data: films = [] } = useFilms();

  // 📰 2. On récupère les éditos directement depuis leur CSV
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

  // 🎬 3. On prépare les films pour affichage
  const formattedFilms = films
    .filter((f) => f.MINIATURE) // on ignore ceux sans image
    .map((f) => ({
      id: f.ID,
      titre: f.TITRE || "",
      annee: f.ANNEE || "",
      real: [f["REALISATEUR 1"], f["REALISATEUR 2"]]
        .filter(Boolean)
        .join(" & "),
      src: `/miniatures/${f.MINIATURE}`, // 📁 chargé depuis /public/miniatures/
      type: "film",
      priorite: parseInt(f.PRIORITE) || 0,
    }));

  // 📰 4. On prépare les éditos
  const formattedEditos = editos
    .filter((e) => e.TITRE || e.TEXTE) // on ignore les lignes vides
    .map((e) => ({
      id: e.ID,
      titre: e.TITRE || "",
      texte: e.TEXTE || "",
      src: e.IMAGE ? `/edito/${e.IMAGE}` : "/miniatures/placeholder.jpg", // 📁 chargé depuis /public/edito/
      url: e.URL || "#",
      type: "edito",
      priorite: parseInt(e.PRIORITE) || 0,
    }));

  // 🧠 5. Fusion + tri global par priorité
  const allContent = [...formattedFilms, ...formattedEditos].sort(
    (a, b) => (b.priorite || 0) - (a.priorite || 0)
  );

  // ⏱️ 6. Rotation automatique toutes les 20s
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 20000);
    return () => clearInterval(interval);
  }, []);

  const colorIndex = tick % COLORS.length;
  const offset = allContent.length ? tick % allContent.length : 0;

  // 🧩 7. Grille dynamique de 12 cases
  const gridItems = Array.from({ length: 12 }).map((_, i) => {
    if (i === 0) return { type: "text", content: "LA" };
    if (i === 2)
      return {
        type: "subtitle",
        content:
          "Découvrez des courts métrages indépendants et soutenez les créateurs.",
      };
    if (i === 5) return { type: "text", content: "BAIE" };
    if (i === 10) return { type: "text", content: "VITRÉE" };

    const item = allContent.length
      ? allContent[(offset + i) % allContent.length]
      : null;
    return item || { type: "empty" };
  });

  return (
    <div className="relative w-full min-h-[calc(100vh-4rem)] bg-black">
      {/* 🧱 Grille principale */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 grid-rows-3 w-full h-[calc(100vh-4rem)]">
        {gridItems.map((item, i) => {
          // 🟦 Texte « LA / BAIE / VITRÉE »
          if (item.type === "text") {
            return (
              <div
                key={i}
                className="flex items-center justify-center text-white font-extrabold tracking-wide text-6xl sm:text-7xl lg:text-8xl transition-all duration-1000 hover:scale-105 animate-fade-in"
                style={{ backgroundColor: COLORS[colorIndex] }}
              >
                {item.content}
              </div>
            );
          }

          // 📝 Bloc central texte + boutons
          if (item.type === "subtitle") {
            return (
              <div
                key={i}
                className="flex flex-col items-center justify-center text-white text-center p-4 transition-colors duration-1000 animate-fade-in"
                style={{ backgroundColor: COLORS[colorIndex] }}
              >
                <p className="text-sm sm:text-lg lg:text-2xl font-light leading-snug mb-4">
                  {item.content}
                </p>
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

          // 🎬 Image de film ou édito
          if (item.type === "film" || item.type === "edito") {
            const handleClick = () =>
              item.type === "film"
                ? navigate(`/projet/${item.id}`)
                : (window.location.href = item.url);

            return (
              <div
                key={i}
                className="relative cursor-pointer group overflow-hidden"
                onClick={handleClick}
              >
                <div className="aspect-video w-full h-full overflow-hidden">
                  <img
                    src={item.src}
                    alt={item.titre || "Projet"}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover opacity-0 animate-fade-in group-hover:scale-105 transition duration-1000"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-center items-center text-center p-4">
                    {item.titre && (
                      <h3 className="text-lg md:text-xl font-bold text-white">
                        {item.titre}
                      </h3>
                    )}
                    {item.annee || item.real ? (
                      <p className="text-sm text-gray-200 mt-1">
                        {item.annee ? `${item.annee}` : ""}
                        {item.annee && item.real ? " — " : ""}
                        {item.real}
                      </p>
                    ) : item.texte ? (
                      <p className="text-sm text-gray-200 mt-1">{item.texte}</p>
                    ) : null}
                  </div>
                </div>
              </div>
            );
          }

          // 🪟 Case vide par défaut
          return <div key={i} className="bg-black/30" />;
        })}
      </div>
    </div>
  );
}
