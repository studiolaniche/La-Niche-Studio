import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

const COLORS = [
  "#FF0054",
  "#0096FF",
  "#00C49A",
  "#FFB800",
  "#C83CB9",
];

const HERO_PALETTE = [
  "#E94B35",
  "#F2C14E",
  "#2A9D8F",
  "#3A86FF",
  "#C77DFF",
  "#FF6B9A",
];

const FLICKER_FONTS = [
  {
    className: "font-flicker-anton",
    letterSpacing: "-0.035em",
    lineHeight: 0.82,
    transform: "scaleX(0.98)",
  },
  {
    className: "font-flicker-archivo",
    letterSpacing: "-0.075em",
    lineHeight: 0.84,
    transform: "scaleX(0.9)",
  },
  {
    className: "font-flicker-bebas",
    letterSpacing: "0.005em",
    lineHeight: 0.78,
    transform: "scaleX(1.03)",
  },
  {
    className: "font-flicker-cormorant",
    letterSpacing: "-0.055em",
    lineHeight: 0.76,
    transform: "scaleX(1)",
  },
  {
    className: "font-flicker-dm-serif",
    letterSpacing: "-0.065em",
    lineHeight: 0.8,
    transform: "scaleX(0.94)",
  },
  {
    className: "font-flicker-ibm",
    letterSpacing: "-0.09em",
    lineHeight: 0.84,
    transform: "scaleX(0.78)",
  },
  {
    className: "font-flicker-inter",
    letterSpacing: "-0.085em",
    lineHeight: 0.8,
    transform: "scaleX(0.92)",
  },
  {
    className: "font-flicker-oswald",
    letterSpacing: "-0.045em",
    lineHeight: 0.8,
    transform: "scaleX(0.96)",
  },
  {
    className: "font-flicker-playfair",
    letterSpacing: "-0.07em",
    lineHeight: 0.76,
    transform: "scaleX(0.92)",
  },
];

/*
  La police finale n’est pas incluse dans le tirage aléatoire.
  Elle apparaît seulement à la fin des cinq secondes.
*/
const REFERENCE_FONT = {
  className: "font-title-reference",
  letterSpacing: "-0.065em",
  lineHeight: 0.8,
  transform: "scaleX(1)",
};

const FLICKER_DURATION = 5000;

const FALLBACK_THUMB = "/miniatures/placeholder.jpg";

function shuffleArray(array) {
  const shuffled = [...array];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));

    [shuffled[index], shuffled[randomIndex]] = [
      shuffled[randomIndex],
      shuffled[index],
    ];
  }

  return shuffled;
}

function getRandomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function hexToRgb(hexColor) {
  const cleanHex = hexColor.replace("#", "");

  const normalizedHex =
    cleanHex.length === 3
      ? cleanHex
          .split("")
          .map((character) => character + character)
          .join("")
      : cleanHex;

  return {
    red: parseInt(normalizedHex.slice(0, 2), 16),
    green: parseInt(normalizedHex.slice(2, 4), 16),
    blue: parseInt(normalizedHex.slice(4, 6), 16),
  };
}

function getRelativeLuminance(hexColor) {
  const { red, green, blue } = hexToRgb(hexColor);

  const channels = [red, green, blue].map((channel) => {
    const normalized = channel / 255;

    return normalized <= 0.03928
      ? normalized / 12.92
      : Math.pow((normalized + 0.055) / 1.055, 2.4);
  });

  return (
    0.2126 * channels[0] +
    0.7152 * channels[1] +
    0.0722 * channels[2]
  );
}

function getRandomHeroTheme() {
  const backgroundColor = getRandomItem(HERO_PALETTE);
  const luminance = getRelativeLuminance(backgroundColor);
  const isLightBackground = luminance > 0.42;

  return {
    backgroundColor,

    textColor: isLightBackground ? "#111111" : "#FFFFFF",

    subtleTextColor: isLightBackground
      ? "rgba(17, 17, 17, 0.64)"
      : "rgba(255, 255, 255, 0.70)",

    faintTextColor: isLightBackground
      ? "rgba(17, 17, 17, 0.48)"
      : "rgba(255, 255, 255, 0.52)",

    borderColor: isLightBackground
      ? "rgba(17, 17, 17, 0.24)"
      : "rgba(255, 255, 255, 0.28)",
  };
}

function getFilmImage(film) {
  return (
    film.hero_image_url ||
    film.miniature_url ||
    (film.vimeo_id
      ? `https://vumbnail.com/${film.vimeo_id}.jpg`
      : FALLBACK_THUMB)
  );
}

function getFilmThumbnail(film) {
  return (
    film.miniature_url ||
    film.hero_image_url ||
    (film.vimeo_id
      ? `https://vumbnail.com/${film.vimeo_id}.jpg`
      : FALLBACK_THUMB)
  );
}

function getFilmUrl(film) {
  return `/projet/${film.slug || film.id}`;
}

function getDirectors(film) {
  return [film.realisateur_1, film.realisateur_2]
    .filter(Boolean)
    .join(" & ");
}

function getStableColor(text) {
  if (!text) {
    return "#666666";
  }

  let hash = 0;

  for (let index = 0; index < text.length; index += 1) {
    hash = text.charCodeAt(index) + ((hash << 5) - hash);
  }

  const hue = Math.abs(hash) % 360;

  return `hsl(${hue}, 70%, 45%)`;
}

function MobileIntroHero({ filmCount }) {
  const theme = useMemo(() => getRandomHeroTheme(), []);

  const [activeFont, setActiveFont] = useState(() =>
    getRandomItem(FLICKER_FONTS)
  );

  const [flickerFinished, setFlickerFinished] = useState(false);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) {
      setActiveFont(REFERENCE_FONT);
      setFlickerFinished(true);
      return undefined;
    }

    let timeoutId;
    let previousIndex = -1;
    let cancelled = false;

    const startTime = performance.now();

    function scheduleNextFont() {
      if (cancelled) {
        return;
      }

      const elapsed = performance.now() - startTime;

      if (elapsed >= FLICKER_DURATION) {
        setActiveFont(REFERENCE_FONT);
        setFlickerFinished(true);
        return;
      }

      const progress = elapsed / FLICKER_DURATION;

      /*
        Rapide au début, puis de plus en plus lent.
        Environ 65 ms au départ et 450 ms à la fin.
      */
      const delay = 65 + Math.pow(progress, 2.3) * 385;

      let nextIndex;

      do {
        nextIndex = Math.floor(Math.random() * FLICKER_FONTS.length);
      } while (
        FLICKER_FONTS.length > 1 &&
        nextIndex === previousIndex
      );

      previousIndex = nextIndex;
      setActiveFont(FLICKER_FONTS[nextIndex]);

      timeoutId = window.setTimeout(scheduleNextFont, delay);
    }

    scheduleNextFont();

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, []);

  return (
    <section
      className="
        relative
        flex
        min-h-[100svh]
        snap-start
        flex-col
        justify-between
        overflow-hidden
        px-5
        pb-8
        pt-6
      "
      style={{
        backgroundColor: theme.backgroundColor,
        color: theme.textColor,
      }}
    >
      <div className="relative z-10 flex items-center justify-between">
        <p
          className="text-[10px] font-semibold uppercase tracking-[0.3em]"
          style={{ color: theme.subtleTextColor }}
        >
          Une initiative de La Niche Studio
        </p>

        <p
          className="text-[10px] uppercase tracking-[0.2em]"
          style={{ color: theme.faintTextColor }}
        >
          
        </p>
      </div>

      <div className="relative z-10 mt-auto pb-10 pt-20">
        <p
          className="mb-5 text-[10px] font-semibold uppercase tracking-[0.3em]"
          style={{ color: theme.subtleTextColor }}
        >
          
        </p>

        <h1
          className={`
            title-font-flicker
            origin-left
            text-[4.2rem]
            uppercase
            min-[390px]:text-[4.85rem]
            ${activeFont.className}
            ${
              flickerFinished
                ? "title-font-flicker-finished"
                : ""
            }
          `}
          style={{
            letterSpacing: activeFont.letterSpacing,
            lineHeight: activeFont.lineHeight,
            transform: activeFont.transform,
          }}
          aria-label="La Baie Vitrée"
        >
          <span className="block whitespace-nowrap" aria-hidden="true">
            La Baie
          </span>

          <span className="block whitespace-nowrap" aria-hidden="true">
            Vitrée
          </span>
        </h1>

        <p
          className="mt-8 max-w-[19rem] text-base font-light leading-relaxed"
          style={{ color: theme.subtleTextColor }}
        >
          La plateforme grenobloise du court-métrage indépendant.
        </p>
      </div>

      <div
        className="relative z-10 flex items-end justify-between border-t pt-4"
        style={{ borderColor: theme.borderColor }}
      >
        <p className="text-xs" style={{ color: theme.faintTextColor }}>
          {filmCount} film{filmCount > 1 ? "s" : ""} à découvrir
        </p>

        <p
          className="flex items-center gap-2 text-[10px] uppercase tracking-[0.18em]"
          style={{ color: theme.subtleTextColor }}
        >
          Défiler
          <span aria-hidden="true">↓</span>
        </p>
      </div>
    </section>
  );
}

function FilmHero({ film }) {
  const image = getFilmImage(film);
  const directors = getDirectors(film);

  return (
    <article className="relative min-h-[100svh] snap-start overflow-hidden border-b border-white/10 bg-black">
      <Link
        to={getFilmUrl(film)}
        className="group absolute inset-0 block"
        aria-label={`Découvrir ${film.titre || "ce film"}`}
      >
        <img
          src={image}
          alt={film.titre || "Court-métrage"}
          loading="lazy"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-active:scale-[1.01]"
          onError={(event) => {
            if (event.currentTarget.src.endsWith(FALLBACK_THUMB)) {
              return;
            }

            event.currentTarget.src = FALLBACK_THUMB;
          }}
        />

        <div className="absolute inset-0 bg-black/15" />

        <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-transparent to-black/95" />

        <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-transparent" />

        {film.genre && (
          <span className="absolute left-5 top-6 z-10 rounded-full border border-white/20 bg-black/35 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-white backdrop-blur-sm">
            {film.genre}
          </span>
        )}

        <div className="absolute inset-x-0 bottom-0 z-10 p-5 pb-8">
          <h2 className="max-w-[92%] text-4xl font-black leading-[0.92] tracking-tight text-white min-[390px]:text-5xl">
            {film.titre}
          </h2>

          {(directors || film.annee) && (
            <p className="mt-4 text-sm leading-relaxed text-white/75">
              {directors}
              {directors && film.annee ? " — " : ""}
              {film.annee || ""}
            </p>
          )}

          {film.synopsis && (
            <p className="mt-4 line-clamp-3 max-w-md text-sm leading-relaxed text-white/60">
              {film.synopsis}
            </p>
          )}

          <div className="mt-6 flex items-center justify-between border-t border-white/25 pt-4">
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-white">
              Découvrir le film
            </span>

            <span className="text-2xl font-light text-white">→</span>
          </div>
        </div>
      </Link>
    </article>
  );
}

function MobileNavigationLink({
  number,
  title,
  description,
  to,
  last = false,
}) {
  return (
    <Link
      to={to}
      className={`
        group
        grid
        grid-cols-[2.5rem_1fr_auto]
        items-start
        gap-3
        px-5
        py-7
        ${last ? "" : "border-b border-white/10"}
      `}
    >
      <span className="pt-1 text-[10px] font-semibold text-white/30">
        {number}
      </span>

      <span>
        <span className="block text-2xl font-black tracking-tight text-white">
          {title}
        </span>

        <span className="mt-2 block max-w-[16rem] text-xs leading-relaxed text-white/45">
          {description}
        </span>
      </span>

      <span className="pt-1 text-2xl font-light text-white/60 transition-transform group-active:translate-x-1">
        →
      </span>
    </Link>
  );
}

function MobileHome({ films, editos }) {
  const featuredFilms = useMemo(() => {
    const eligibleFilms = films.filter(
      (film) => film.featured === true
    );

    const randomizedFeatured = shuffleArray(eligibleFilms);

    if (randomizedFeatured.length >= 3) {
      return randomizedFeatured.slice(0, 3);
    }

    const selectedIds = new Set(
      randomizedFeatured.map((film) => film.id)
    );

    const fallbackFilms = shuffleArray(
      films.filter((film) => !selectedIds.has(film.id))
    );

    return [...randomizedFeatured, ...fallbackFilms].slice(0, 3);
  }, [films]);

  const featuredEdito = editos[0];

  return (
    <div className="bg-black text-white md:hidden">
      <div className="snap-y snap-mandatory">
        <MobileIntroHero filmCount={films.length} />

        {featuredFilms.map((film) => (
          <FilmHero key={film.id} film={film} />
        ))}
      </div>

      {featuredEdito && (
        <section className="border-b border-white/10 bg-white text-black">
          <div className="px-5 py-14">
            <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-black/45">
              Édito
            </p>

            <h2 className="mt-5 text-4xl font-black leading-[0.95] tracking-tight">
              {featuredEdito.titre}
            </h2>

            {featuredEdito.texte && (
              <p className="mt-6 line-clamp-6 text-base leading-relaxed text-black/65">
                {featuredEdito.texte}
              </p>
            )}

            {featuredEdito.url && featuredEdito.url !== "#" && (
              <a
                href={featuredEdito.url}
                className="mt-8 flex items-center justify-between border-t border-black/20 pt-4 text-xs font-bold uppercase tracking-[0.18em]"
              >
                Lire la suite

                <span className="text-2xl font-light">→</span>
              </a>
            )}
          </div>
        </section>
      )}

      <section className="border-b border-white/10 px-5 py-14">
        <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-white/45">
          Tous les films
        </p>

        <h2 className="mt-5 max-w-[20rem] text-4xl font-black leading-[0.95] tracking-tight">
          Continuez votre exploration.
        </h2>

        <p className="mt-5 max-w-[20rem] text-sm leading-relaxed text-white/60">
          Parcourez les films par année, réalisateur·ice, genre ou
          statut.
        </p>

        <Link
          to="/catalogue"
          className="mt-8 flex items-center justify-between border-y border-white/25 py-5 text-sm font-bold uppercase tracking-[0.16em]"
        >
          Voir le catalogue complet

          <span className="text-2xl font-light">→</span>
        </Link>
      </section>

      <nav aria-label="Rubriques principales" className="bg-black">
        <MobileNavigationLink
          number="01"
          title="Nouveautés"
          description="Les derniers films arrivés sur la plateforme."
          to="/nouveautes"
        />

        <MobileNavigationLink
          number="02"
          title="Ma fenêtre"
          description="Retrouvez une sélection qui vous ressemble."
          to="/fenetre"
        />

        <MobileNavigationLink
          number="03"
          title="Participer"
          description="Proposer un film ou soutenir le projet."
          to="/participer"
        />

        <MobileNavigationLink
          number="04"
          title="À propos"
          description="Découvrir La Baie Vitrée et La Niche Studio."
          to="/a-propos"
          last
        />
      </nav>
    </div>
  );
}

function DesktopTile({ item, index }) {
  if (item.type === "title") {
    return (
      <div
        className="flex items-center justify-center overflow-hidden p-6"
        style={{
          backgroundColor: COLORS[index % COLORS.length],
        }}
      >
        <p className="text-center text-6xl font-black uppercase leading-none tracking-tight lg:text-8xl">
          {item.content}
        </p>
      </div>
    );
  }

  if (item.type === "intro") {
    return (
      <div
        className="flex flex-col items-center justify-center p-6 text-center"
        style={{
          backgroundColor: COLORS[index % COLORS.length],
        }}
      >
        <p className="max-w-sm text-xl font-light leading-snug lg:text-2xl">
          La plateforme grenobloise du court-métrage indépendant.
        </p>

        <div className="mt-6 flex gap-3">
          <Link
            to="/nouveautes"
            className="rounded bg-white px-4 py-2 text-sm font-semibold text-black"
          >
            Nouveautés
          </Link>

          <Link
            to="/catalogue"
            className="rounded border border-white px-4 py-2 text-sm font-semibold"
          >
            Catalogue
          </Link>
        </div>
      </div>
    );
  }

  if (!item.film) {
    return <div className="bg-white/[0.04]" />;
  }

  const film = item.film;
  const image = getFilmThumbnail(film);
  const directors = getDirectors(film);

  return (
    <Link
      to={getFilmUrl(film)}
      className="group relative block overflow-hidden bg-black"
    >
      <img
        src={image}
        alt={film.titre || "Court-métrage"}
        loading="lazy"
        decoding="async"
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        onError={(event) => {
          if (event.currentTarget.src.endsWith(FALLBACK_THUMB)) {
            return;
          }

          event.currentTarget.src = FALLBACK_THUMB;
        }}
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent opacity-75 transition-opacity group-hover:opacity-100" />

      {film.genre && (
        <span
          className="absolute left-3 top-3 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-white"
          style={{
            backgroundColor: getStableColor(film.genre),
          }}
        >
          {film.genre}
        </span>
      )}

      <div className="absolute inset-x-0 bottom-0 p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <h2 className="text-xl font-black leading-tight">
          {film.titre}
        </h2>

        <p className="mt-2 text-xs text-white/70">
          {directors}
          {directors && film.annee ? " — " : ""}
          {film.annee || ""}
        </p>
      </div>
    </Link>
  );
}

function DesktopHome({ films }) {
  const gridItems = useMemo(() => {
    const visualItems = films.slice(0, 8);

    return [
      {
        type: "title",
        content: "LA",
      },
      {
        type: "film",
        film: visualItems[0],
      },
      {
        type: "intro",
      },
      {
        type: "film",
        film: visualItems[1],
      },
      {
        type: "film",
        film: visualItems[2],
      },
      {
        type: "title",
        content: "BAIE",
      },
      {
        type: "film",
        film: visualItems[3],
      },
      {
        type: "film",
        film: visualItems[4],
      },
      {
        type: "film",
        film: visualItems[5],
      },
      {
        type: "film",
        film: visualItems[6],
      },
      {
        type: "title",
        content: "VITRÉE",
      },
      {
        type: "film",
        film: visualItems[7],
      },
    ];
  }, [films]);

  return (
    <div className="hidden h-[calc(100vh-4rem)] grid-cols-2 grid-rows-6 bg-black md:grid lg:grid-cols-4 lg:grid-rows-3">
      {gridItems.map((item, index) => (
        <DesktopTile
          key={`${item.type}-${item.film?.id || item.content || index}`}
          item={item}
          index={index}
        />
      ))}
    </div>
  );
}

function LoadingHome() {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-black">
      <div className="md:hidden">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="min-h-[100svh] animate-pulse border-b border-white/10 bg-white/[0.05]"
          />
        ))}
      </div>

      <div className="hidden h-[calc(100vh-4rem)] grid-cols-4 grid-rows-3 md:grid">
        {Array.from({ length: 12 }).map((_, index) => (
          <div
            key={index}
            className="animate-pulse border border-white/5 bg-white/[0.04]"
          />
        ))}
      </div>
    </div>
  );
}

export default function Accueil() {
  const [films, setFilms] = useState([]);
  const [editos, setEditos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadHome() {
      setLoading(true);

      try {
        const [filmsResponse, editosResponse] = await Promise.all([
          supabase
            .from("films")
            .select("*")
            .eq("is_published", true)
            .order("created_at", {
              ascending: false,
            }),

          supabase
            .from("editos")
            .select("*")
            .eq("is_published", true)
            .order("poids", {
              ascending: false,
            })
            .order("created_at", {
              ascending: false,
            }),
        ]);

        if (filmsResponse.error) {
          throw filmsResponse.error;
        }

        if (editosResponse.error) {
          console.error(
            "Erreur Supabase lors du chargement des éditos :",
            editosResponse.error
          );
        }

        if (!cancelled) {
          setFilms(filmsResponse.data || []);
          setEditos(editosResponse.data || []);
        }
      } catch (error) {
        console.error("Erreur lors du chargement de l’accueil :", error);

        if (!cancelled) {
          setFilms([]);
          setEditos([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadHome();

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return <LoadingHome />;
  }

  if (!films.length) {
    return (
      <section className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-black px-6 text-center text-white">
        <div>
          <h1 className="text-4xl font-black">La Baie Vitrée</h1>

          <p className="mt-4 text-sm text-white/60">
            Aucun film publié n’est disponible pour le moment.
          </p>
        </div>
      </section>
    );
  }

  return (
    <main className="bg-black text-white">
      <MobileHome films={films} editos={editos} />
      <DesktopHome films={films} />
    </main>
  );
}