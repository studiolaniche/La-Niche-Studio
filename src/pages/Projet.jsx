import { useParams } from "react-router-dom";
import { useState } from "react";
import useFilms from "../hooks/useFilms";
import DonModal from "../components/DonModal";
import Breadcrumb from "../components/Breadcrumb";

/* ---------- helpers ---------- */
function extractVimeoId(value) {
  if (!value) return null;
  if (/^\d+$/.test(value)) return value;
  const match = String(value).match(/vimeo\.com\/(?:video\/)?(\d+)/i);
  return match ? match[1] : null;
}

function cleanQuotes(s) {
  if (!s) return "";
  return String(s)
    .trim()
    .replace(/^["'“”«»\s]+/, "")
    .replace(/["'“”«»\s]+$/, "");
}

function getDirectors(film) {
  return [film["REALISATEUR 1"], film["REALISATEUR 2"]].filter(Boolean);
}

function getActors(film) {
  return Array.from({ length: 15 }, (_, i) => film[`ACTEUR${i + 1}`]).filter(Boolean);
}

// ✅ Tag stable : NOMDUFILM_REFERENCE (ex: GUM_2)
// - base = NOMDUFILM (ou TITRE si NOMDUFILM vide)
// - reference = REFERENCE (nombre dans ta sheet)
function buildDonationTag(film) {
  const baseRaw = film.NOMDUFILM || film.TITRE || "FILM";

  const base = String(baseRaw)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // supprime accents
    .toUpperCase()
    .trim()
    .replace(/[^A-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .replace(/_+/g, "_");

  const ref = Number.isFinite(Number(film.REFERENCE)) ? Number(film.REFERENCE) : 1;

  return `${base}_${ref}`;
}

/* ---------- page ---------- */
export default function Projet() {
  const { id } = useParams();
  const { data: films = [], isLoading: loading } = useFilms();
  const [open, setOpen] = useState(false);

  if (loading) return <p className="p-8">Chargement…</p>;

  const film = films.find((f) => String(f.ID) === String(id));
  if (!film) return <p className="p-8">Film introuvable.</p>;

  const vimeoId = extractVimeoId(film.VIMEOID);
  const directors = getDirectors(film);
  const actors = getActors(film);
  const duration =
    (film.DUREE &&
      String(film.DUREE).match(/\d+/) &&
      `${String(film.DUREE).match(/\d+/)[0]} min`) ||
    null;

  // 🖼️ Gestion robuste de la miniature
  const miniature = film.MINIATURE
    ? film.MINIATURE.includes("/miniatures/")
      ? film.MINIATURE
      : `/miniatures/${film.MINIATURE}`
    : "/miniatures/placeholder.jpg";

  // ✅ Tag de don (ex: GUM_2)
  const donationTag = buildDonationTag(film);

  return (
    <div className="px-4 md:px-8 py-8 max-w-5xl mx-auto text-white">
      {/* 🧭 Fil d’Ariane */}
      <Breadcrumb
        items={[
          { label: "Accueil", href: "/" },
          { label: "Catalogue", href: "/catalogue" },
          { label: film.TITRE },
        ]}
      />

      {/* Titre + méta */}
      <h1 className="text-3xl md:text-4xl font-bold mb-2">{film.TITRE}</h1>
      <p className="mb-6 text-gray-300">
        {directors.join(" & ")}
        {film.ANNEE ? ` — ${film.ANNEE}` : ""}
        {duration ? ` • ${duration}` : ""}
        {film.GENRE ? ` • ${film.GENRE}` : ""}
      </p>

      {/* Lecteur Vimeo ou miniature */}
      {vimeoId ? (
        <div className="mb-8 aspect-video w-full overflow-hidden rounded-lg bg-black">
          <iframe
            src={`https://player.vimeo.com/video/${vimeoId}?dnt=1&title=0&byline=0&portrait=0`}
            width="100%"
            height="100%"
            frameBorder="0"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            title={film.TITRE}
            className="w-full h-full"
          />
        </div>
      ) : (
        <div className="mb-8 aspect-video w-full rounded-lg bg-white/5 flex items-center justify-center text-white/70">
          <img
            src={miniature}
            alt={film.TITRE}
            className="w-full h-full object-cover rounded-lg opacity-80"
          />
        </div>
      )}

      {/* Synopsis */}
      {film.SYNOPSIS && (
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Synopsis</h2>
          <p className="leading-relaxed text-gray-200 whitespace-pre-line">
            {cleanQuotes(film.SYNOPSIS)}
          </p>
        </section>
      )}

      {/* (Optionnel) Description */}
      {film.DESCRIPTION && (
        <section className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Note d’intention</h3>
          <p className="leading-relaxed text-gray-200 whitespace-pre-line">
            {cleanQuotes(film.DESCRIPTION)}
          </p>
        </section>
      )}

      {/* Fiche technique rapide */}
      <div className="mb-8 grid sm:grid-cols-2 gap-6">
        {directors.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-white/80 mb-2">
              Réalisateur·ice·s
            </h3>
            <div className="flex flex-wrap gap-2">
              {directors.map((d, i) => (
                <span key={i} className="px-2 py-1 bg-white/10 rounded text-xs">
                  {d}
                </span>
              ))}
            </div>
          </div>
        )}

        {actors.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-white/80 mb-2">Acteurs</h3>
            <div className="flex flex-wrap gap-2">
              {actors.map((a, i) => (
                <span key={i} className="px-2 py-1 bg-white/5 rounded text-xs">
                  {a}
                </span>
              ))}
            </div>
          </div>
        )}

        {film.SELECTIONFESTIVAL && (
          <div>
            <h3 className="text-sm font-semibold text-white/80 mb-2">
              Sélections
            </h3>
            <p className="text-sm text-gray-200 whitespace-pre-line">
              {cleanQuotes(film.SELECTIONFESTIVAL)}
            </p>
          </div>
        )}

        {film.PRIXFESTIVAL && (
          <div>
            <h3 className="text-sm font-semibold text-white/80 mb-2">Prix</h3>
            <p className="text-sm text-gray-200 whitespace-pre-line">
              {cleanQuotes(film.PRIXFESTIVAL)}
            </p>
          </div>
        )}

        {film.CHAINEDEDROITS && (
          <div className="sm:col-span-2">
            <h3 className="text-sm font-semibold text-white/80 mb-2">
              Chaîne de droits
            </h3>
            <p className="text-sm text-gray-200 whitespace-pre-line">
              {cleanQuotes(film.CHAINEDEDROITS)}
            </p>
          </div>
        )}
      </div>

      {/* ✅ Bouton don + tag */}
      <div className="p-5 border border-white/15 rounded-lg">
        <p className="opacity-90 mb-3">
          Accès gratuit. Si vous le souhaitez, vous pouvez faire un don volontaire via
          HelloAsso pour soutenir la création. (Ce n’est pas un achat.)
        </p>

        <button
          onClick={() => setOpen(true)}
          className="px-6 py-3 bg-white text-black rounded-lg hover:bg-white/90 transition"
        >
          Soutenir ce film
        </button>

        <p className="text-xs opacity-70 mt-3">
          Préférence de soutien (facultatif) :{" "}
          <span className="font-mono">{donationTag}</span>
        </p>
      </div>

      {/* ✅ Modale HelloAsso (pré-remplie) */}
      {open && (
        <DonModal
          onClose={() => setOpen(false)}
          donationTag={donationTag}
        />
      )}
    </div>
  );
}
