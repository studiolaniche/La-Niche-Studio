import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import DonModal from "../components/DonModal";
import Breadcrumb from "../components/Breadcrumb";
import VimeoCustomPlayer from "../components/VimeoCustomPlayer";

function extractVimeoInfo(value) {
  if (!value) return null;

  const raw = String(value).trim();

  if (/^\d+$/.test(raw)) {
    return { id: raw, hash: "" };
  }

  const idMatch = raw.match(/vimeo\.com\/(?:video\/)?(\d+)/i);
  if (!idMatch) return null;

  const hashMatch = raw.match(/[?&]h=([^&]+)/i);

  return {
    id: idMatch[1],
    hash: hashMatch ? hashMatch[1] : "",
  };
}

function cleanQuotes(s) {
  if (!s) return "";

  return String(s)
    .trim()
    .replace(/^["'“”«»\s]+/, "")
    .replace(/["'“”«»\s]+$/, "");
}

function buildDonationTag(film) {
  const baseRaw = film.tag_don || film.nom_du_film || film.titre || "FILM";

  const base = String(baseRaw)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .trim()
    .replace(/[^A-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .replace(/_+/g, "_");

  const ref = film.reference || "1";

  return `${base}_${ref}`;
}

export default function Projet() {
  const { id } = useParams();

  const [film, setFilm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    async function loadFilm() {
      setLoading(true);

      const { data, error } = await supabase
        .from("films")
        .select("*")
        .eq("is_published", true)
        .eq("slug", id)
        .maybeSingle();

      if (error) {
        console.error("Erreur chargement film :", error);
        setFilm(null);
      } else {
        setFilm(data || null);
      }

      setLoading(false);
    }

    loadFilm();
  }, [id]);

  useEffect(() => {
    if (!film?.id) return;

    async function recordView() {
      try {
        let sessionId = localStorage.getItem("lbv_session_id");

        if (!sessionId) {
          sessionId = crypto.randomUUID();
          localStorage.setItem("lbv_session_id", sessionId);
        }

        const viewKey = `lbv_view_${film.id}`;
        const lastView = localStorage.getItem(viewKey);
        const now = Date.now();

        // Évite de compter 15 vues si quelqu’un recharge la page plusieurs fois.
        // Ici : 1 vue max par film toutes les 30 minutes pour une même session.
        if (lastView && now - Number(lastView) < 30 * 60 * 1000) {
          return;
        }

        const { error } = await supabase.from("film_views").insert({
          film_id: film.id,
          session_id: sessionId,
          page_url: window.location.href,
          user_agent: navigator.userAgent,
        });

        if (error) {
          console.error("Erreur enregistrement vue :", error);
          return;
        }

        localStorage.setItem(viewKey, String(now));
      } catch (error) {
        console.error("Erreur vue :", error);
      }
    }

    recordView();
  }, [film?.id]);

  if (loading) return <p className="p-8">Chargement…</p>;

  if (!film) return <p className="p-8">Film introuvable.</p>;

  const vimeoInfo = extractVimeoInfo(film.vimeo_id);

  const directors = [film.realisateur_1, film.realisateur_2].filter(Boolean);

  const duration =
    film.duree && String(film.duree).match(/\d+/)
      ? `${String(film.duree).match(/\d+/)[0]} min`
      : film.duree || null;

  const miniature =
    film.miniature_url ||
    (film.vimeo_id
      ? `https://vumbnail.com/${film.vimeo_id}.jpg`
      : "/miniatures/placeholder.jpg");

  const donationTag = buildDonationTag(film);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 text-white md:px-8">
      <Breadcrumb
        items={[
          { label: "Accueil", href: "/" },
          { label: "Catalogue", href: "/catalogue" },
          { label: film.titre },
        ]}
      />

      <h1 className="mb-2 text-3xl font-bold md:text-4xl">{film.titre}</h1>

      <p className="mb-6 text-gray-300">
        {directors.join(" & ")}
        {film.annee ? ` — ${film.annee}` : ""}
        {duration ? ` • ${duration}` : ""}
        {film.genre ? ` • ${film.genre}` : ""}
      </p>

      {vimeoInfo ? (
        <div className="mb-8">
          <VimeoCustomPlayer
            vimeoId={vimeoInfo.id}
            vimeoHash={vimeoInfo.hash}
            poster={miniature}
            title={film.titre}
          />
        </div>
      ) : (
        <div className="mb-8 flex aspect-video w-full items-center justify-center rounded-lg bg-white/5 text-white/70">
          <img
            src={miniature}
            alt={film.titre}
            className="h-full w-full rounded-lg object-cover opacity-80"
          />
        </div>
      )}

      {film.synopsis && (
        <section className="mb-6">
          <h2 className="mb-2 text-xl font-semibold">Synopsis</h2>
          <p className="whitespace-pre-line leading-relaxed text-gray-200">
            {cleanQuotes(film.synopsis)}
          </p>
        </section>
      )}

      <div className="mb-8 grid gap-6 sm:grid-cols-2">
        {directors.length > 0 && (
          <div>
            <h3 className="mb-2 text-sm font-semibold text-white/80">
              Réalisateur·ice·s
            </h3>

            <div className="flex flex-wrap gap-2">
              {directors.map((director, index) => (
                <Link
                  key={`${director}-${index}`}
                  to={`/catalogue?realisateur=${encodeURIComponent(director)}`}
                  className="rounded bg-white/10 px-2 py-1 text-xs transition hover:bg-white/20"
                >
                  {director}
                </Link>
              ))}
            </div>
          </div>
        )}

        {film.collectif && (
          <div>
            <h3 className="mb-2 text-sm font-semibold text-white/80">
              Collectif
            </h3>

            <div className="flex flex-wrap gap-2">
              <Link
                to={`/catalogue?collectif=${encodeURIComponent(film.collectif)}`}
                className="rounded bg-fuchsia-600/80 px-2 py-1 text-xs text-white transition hover:bg-fuchsia-500"
              >
                {film.collectif}
              </Link>
            </div>
          </div>
        )}

        {film.selection_festival && (
          <div>
            <h3 className="mb-2 text-sm font-semibold text-white/80">
              Sélections
            </h3>

            <p className="whitespace-pre-line text-sm text-gray-200">
              {cleanQuotes(film.selection_festival)}
            </p>
          </div>
        )}

        {film.prix_festival && (
          <div>
            <h3 className="mb-2 text-sm font-semibold text-white/80">Prix</h3>

            <p className="whitespace-pre-line text-sm text-gray-200">
              {cleanQuotes(film.prix_festival)}
            </p>
          </div>
        )}

        {film.chaine_de_droits && (
          <div className="sm:col-span-2">
            <h3 className="mb-2 text-sm font-semibold text-white/80">
              Chaîne de droits
            </h3>

            <p className="whitespace-pre-line text-sm text-gray-200">
              {cleanQuotes(film.chaine_de_droits)}
            </p>
          </div>
        )}
      </div>

      <div className="rounded-lg border border-white/15 p-5">
        <p className="mb-3 opacity-90">
          Accès gratuit. Si vous le souhaitez, vous pouvez faire un don volontaire
          via HelloAsso pour soutenir la création. Ce n’est pas un achat.
        </p>

        <button
          type="button"
          onClick={() => setOpen(true)}
          className="rounded-lg bg-white px-6 py-3 text-black transition hover:bg-white/90"
        >
          Soutenir ce film
        </button>

        <p className="mt-3 text-xs opacity-70">
          Préférence de soutien facultative :{" "}
          <span className="font-mono">{donationTag}</span>
        </p>
      </div>

      {open && (
        <DonModal onClose={() => setOpen(false)} donationTag={donationTag} />
      )}
    </div>
  );
}