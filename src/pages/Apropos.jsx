import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";

const COLORS = ["#FF0054", "#0096FF", "#00C49A", "#FFB800", "#C83CB9"];
const COLOR_ROTATION_MS = 28000;
const ABOUT_ROTATION_MS = 5000;

const ABOUT_ITEMS = [
  {
    id: "diffusion",
    eyebrow: "Diffusion",
    number: "01",
    title: "Les films sont faits pour être vus.",
    text: "La plateforme permet une diffusion directe, sans abonnement ni accès restreint, dans un environnement simple et accessible. L’objectif est de faciliter la circulation des œuvres.",
  },
  {
    id: "editorial",
    eyebrow: "Éditorial",
    number: "02",
    title: "Une sélection, mais sans compliquer les choses.",
    text: "Les films proposés font l’objet d’une sélection. L’idée n’est pas de complexifier l’accès, mais de maintenir un cadre lisible et d’accompagner les œuvres avec un minimum de contexte. Une ligne simple, volontairement.",
  },
  {
    id: "ancrage",
    eyebrow: "Ancrage",
    number: "03",
    title: "Un projet né ici, mais ouvert plus largement.",
    text: "Le projet est né à Grenoble, au sein de La Niche Studio. Il s’appuie sur un ancrage local réel, tout en restant ouvert à des projets extérieurs. L’objectif est de construire un espace accessible, capable de relier différents parcours et différentes pratiques.",
  },
];

function getStableDelay(slotIndex, max = 1400) {
  const x = Math.sin(slotIndex * 137.7 * 9999.91) * 10000;
  const seeded = x - Math.floor(x);
  return Math.floor(seeded * max);
}

function SectionHeader({ eyebrow, title, intro }) {
  return (
    <div className="max-w-2xl">
      {eyebrow && (
        <p className="mb-3 text-[11px] md:text-xs uppercase tracking-[0.24em] text-white/45">
          {eyebrow}
        </p>
      )}

      {title && (
        <h2 className="text-3xl md:text-5xl font-semibold leading-[0.98] tracking-tight text-white">
          {title}
        </h2>
      )}

      {intro && (
        <p className="mt-5 text-base md:text-lg leading-relaxed text-white/68">
          {intro}
        </p>
      )}
    </div>
  );
}

function SmoothAccent({ color, tick, slotIndex, children }) {
  const [baseColor, setBaseColor] = useState(color);
  const [overlayColor, setOverlayColor] = useState(null);
  const [showOverlay, setShowOverlay] = useState(false);

  useEffect(() => {
    if (baseColor === color) return;

    let cancelled = false;
    const delay = getStableDelay(slotIndex, 1500);

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
    }, 2400);

    return () => clearTimeout(endTimer);
  }, [showOverlay, overlayColor]);

  return children(baseColor, overlayColor, showOverlay);
}

function ColorLine({ color, tick, slotIndex = 1, className = "" }) {
  return (
    <SmoothAccent color={color} tick={tick} slotIndex={slotIndex}>
      {(baseColor, overlayColor, showOverlay) => (
        <div className={`relative h-[1px] w-16 overflow-hidden ${className}`}>
          <div
            className="absolute inset-0"
            style={{ backgroundColor: baseColor }}
          />
          {overlayColor && (
            <div
              className="absolute inset-0 transition-opacity duration-[2400ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
              style={{
                backgroundColor: overlayColor,
                opacity: showOverlay ? 1 : 0,
              }}
            />
          )}
        </div>
      )}
    </SmoothAccent>
  );
}

function ColorNumber({ value, color, tick, slotIndex = 1, className = "" }) {
  return (
    <SmoothAccent color={color} tick={tick} slotIndex={slotIndex}>
      {(baseColor, overlayColor, showOverlay) => (
        <div className="relative inline-block">
          <p
            className={`text-[11px] md:text-xs uppercase tracking-[0.22em] ${className}`}
            style={{ color: baseColor }}
          >
            {value}
          </p>

          {overlayColor && (
            <p
              className={`absolute inset-0 text-[11px] md:text-xs uppercase tracking-[0.22em] transition-opacity duration-[2400ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${className}`}
              style={{
                color: overlayColor,
                opacity: showOverlay ? 1 : 0,
              }}
            >
              {value}
            </p>
          )}
        </div>
      )}
    </SmoothAccent>
  );
}

function FramedBlock({
  children,
  color,
  tick,
  slotIndex = 1,
  className = "",
  innerClassName = "",
  radius = "2rem",
}) {
  return (
    <SmoothAccent color={color} tick={tick} slotIndex={slotIndex}>
      {(baseColor, overlayColor, showOverlay) => (
        <div className={`relative ${className}`} style={{ borderRadius: radius }}>
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              borderRadius: radius,
              border: `1px solid ${baseColor}`,
              opacity: 0.72,
            }}
          />

          {overlayColor && (
            <div
              className="absolute inset-0 pointer-events-none transition-opacity duration-[2400ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
              style={{
                borderRadius: radius,
                border: `1px solid ${overlayColor}`,
                opacity: showOverlay ? 0.72 : 0,
              }}
            />
          )}

          <div
            className={`relative bg-white/[0.04] ${innerClassName}`}
            style={{ borderRadius: `calc(${radius} - 1px)` }}
          >
            {children}
          </div>
        </div>
      )}
    </SmoothAccent>
  );
}

function AccentButton({
  children,
  to,
  color,
  tick,
  slotIndex = 1,
  filled = false,
}) {
  if (filled) {
    return (
      <Link
        to={to}
        className="rounded-full bg-white px-6 py-3 text-black transition-all duration-300 hover:-translate-y-[1px] hover:bg-white/92"
      >
        {children}
      </Link>
    );
  }

  return (
    <SmoothAccent color={color} tick={tick} slotIndex={slotIndex}>
      {(baseColor, overlayColor, showOverlay) => (
        <Link
          to={to}
          className="relative rounded-full px-6 py-3 text-white transition-all duration-300 hover:-translate-y-[1px] hover:bg-white/10"
          style={{ border: `1px solid ${baseColor}` }}
        >
          {children}

          {overlayColor && (
            <span
              className="pointer-events-none absolute inset-0 rounded-full transition-opacity duration-[2400ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
              style={{
                border: `1px solid ${overlayColor}`,
                opacity: showOverlay ? 1 : 0,
              }}
            />
          )}
        </Link>
      )}
    </SmoothAccent>
  );
}

function EditorialSplitSection({
  eyebrow,
  title,
  intro,
  children,
  color,
  tick,
  slotIndex = 1,
  className = "",
}) {
  return (
    <section className={`max-w-6xl mx-auto px-4 md:px-6 ${className}`}>
      <div className="grid md:grid-cols-12 gap-8 md:gap-12">
        <div className="md:col-span-4">
          <SectionHeader eyebrow={eyebrow} title={title} intro={intro} />
          <ColorLine color={color} tick={tick} slotIndex={slotIndex} className="mt-6" />
        </div>

        <div className="md:col-span-8">
          <div className="max-w-2xl text-base md:text-lg leading-[1.8] text-white/74">
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}

function ValueCards({ color, tick }) {
  const items = [
    {
      number: "01",
      title: "Accès gratuit",
      text: "Les films sont accessibles gratuitement.",
    },
    {
      number: "02",
      title: "Pas d’abonnement",
      text: "Il n’y a pas d’abonnement, ni de contenu réservé.",
    },
    {
      number: "03",
      title: "Soutien volontaire",
      text: "Le modèle repose sur un soutien volontaire, sous forme de dons. Chacun participe librement, à son niveau.",
    },
  ];

  return (
    <div className="grid md:grid-cols-3 gap-4 md:gap-5">
      {items.map((item, index) => (
        <div
          key={item.title}
          className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-5 md:p-6 transition-all duration-300 hover:border-white/18 hover:bg-white/[0.045]"
        >
          <ColorNumber
            value={item.number}
            color={color}
            tick={tick}
            slotIndex={20 + index}
          />
          <div className="mt-5 h-px w-full bg-white/10" />
          <h3 className="mt-5 text-lg md:text-xl font-medium text-white">
            {item.title}
          </h3>
          <p className="mt-3 text-sm md:text-base leading-relaxed text-white/66">
            {item.text}
          </p>
        </div>
      ))}
    </div>
  );
}

function RightsGrid({ color, tick }) {
  const items = [
    {
      number: "01",
      text: "Les œuvres restent la propriété de leurs auteurs.",
    },
    {
      number: "02",
      text: "La diffusion proposée est non exclusive : les films peuvent être montrés ailleurs.",
    },
    {
      number: "03",
      text: "Ils peuvent aussi être retirés à tout moment, sur simple demande. Le cadre est volontairement souple et transparent.",
    },
  ];

  return (
    <div className="grid md:grid-cols-3 gap-4 md:gap-5">
      {items.map((item, index) => (
        <div
          key={item.number}
          className="rounded-[1.5rem] border border-white/10 bg-white/[0.025] p-5 md:p-6 transition-all duration-300 hover:border-white/18 hover:bg-white/[0.04]"
        >
          <ColorNumber
            value={item.number}
            color={color}
            tick={tick}
            slotIndex={30 + index}
          />
          <p className="mt-6 text-base md:text-lg leading-relaxed text-white/82">
            {item.text}
          </p>
        </div>
      ))}
    </div>
  );
}

function ManifestoBand({ color, tick }) {
  return (
    <section className="px-4 md:px-6 py-8 md:py-10">
      <FramedBlock
        color={color}
        tick={tick}
        slotIndex={10}
        className="max-w-6xl mx-auto"
        innerClassName="px-6 md:px-10 py-8 md:py-10 bg-white/[0.03]"
      >
        <p className="max-w-4xl text-xl md:text-3xl font-medium leading-[1.35] text-white/90">
          Montrer des films.
          <br className="hidden md:block" /> Les rendre accessibles.
          <br className="hidden md:block" /> Et respecter le cadre de leurs auteurs.
        </p>
      </FramedBlock>
    </section>
  );
}

function AboutCarousel({ color, tick }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [displayIndex, setDisplayIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  const timeoutRef = useRef(null);

  const clearSwitchTimeout = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const goToIndex = (index) => {
    clearSwitchTimeout();
    setVisible(false);

    timeoutRef.current = setTimeout(() => {
      setDisplayIndex(index);
      setVisible(true);
    }, 220);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      goToIndex((displayIndex + 1) % ABOUT_ITEMS.length);
    }, ABOUT_ROTATION_MS);

    return () => {
      clearInterval(interval);
      clearSwitchTimeout();
    };
  }, [displayIndex]);

  useEffect(() => {
    setActiveIndex(displayIndex);
  }, [displayIndex]);

  const activeItem = useMemo(() => ABOUT_ITEMS[activeIndex], [activeIndex]);

  return (
    <section className="relative max-w-6xl mx-auto px-4 md:px-6 py-20 md:py-28">
      <div className="grid md:grid-cols-12 gap-8 md:gap-10 items-start">
        <div className="md:col-span-4">
          <SectionHeader
            eyebrow="Ligne"
            title="Une structure simple, portée par trois axes."
            intro="Un espace pour faire circuler les films, garder une lecture claire, et rester ouvert à des parcours différents."
          />
          <ColorLine color={color} tick={tick} slotIndex={40} className="mt-6" />
        </div>

        <div className="md:col-span-8">
          <div className="grid sm:grid-cols-3 gap-3">
            {ABOUT_ITEMS.map((item, index) => {
              const isCurrent = index === activeIndex;

              return (
                <SmoothAccent
                  key={item.id}
                  color={color}
                  tick={tick}
                  slotIndex={50 + index}
                >
                  {(baseColor, overlayColor, showOverlay) => (
                    <button
                      type="button"
                      onClick={() => goToIndex(index)}
                      className={`relative rounded-full border px-4 py-3 text-left transition-all duration-300 ${
                        isCurrent
                          ? "text-white"
                          : "border-white/10 bg-transparent text-white/45 hover:border-white/20 hover:bg-white/[0.03] hover:text-white/72"
                      }`}
                      style={
                        isCurrent
                          ? {
                              borderColor: baseColor,
                              color: "white",
                            }
                          : undefined
                      }
                    >
                      {isCurrent && overlayColor && (
                        <span
                          className="pointer-events-none absolute inset-0 rounded-full transition-opacity duration-[2400ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
                          style={{
                            border: `1px solid ${overlayColor}`,
                            opacity: showOverlay ? 1 : 0,
                          }}
                        />
                      )}

                      <div className="flex items-center justify-between gap-3">
                        <span className="text-[11px] md:text-xs uppercase tracking-[0.2em]">
                          {item.eyebrow}
                        </span>

                        <span
                          className="text-[11px] md:text-xs"
                          style={{
                            color: isCurrent
                              ? baseColor
                              : "rgba(255,255,255,0.35)",
                          }}
                        >
                          {item.number}
                        </span>

                        {isCurrent && overlayColor && (
                          <span
                            className="pointer-events-none absolute right-4 text-[11px] md:text-xs transition-opacity duration-[2400ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
                            style={{
                              color: overlayColor,
                              opacity: showOverlay ? 1 : 0,
                            }}
                          >
                            {item.number}
                          </span>
                        )}
                      </div>
                    </button>
                  )}
                </SmoothAccent>
              );
            })}
          </div>

          <FramedBlock
            color={color}
            tick={tick}
            slotIndex={60}
            className="mt-6"
            innerClassName="p-6 md:p-10 min-h-[300px] md:min-h-[320px] overflow-hidden bg-white/[0.04]"
          >
            <div className="flex items-start justify-between gap-4">
              <ColorNumber
                value={`${activeItem.number} / ${String(ABOUT_ITEMS.length).padStart(2, "0")}`}
                color={color}
                tick={tick}
                slotIndex={61}
                className="text-white/35"
              />

              <div className="h-px flex-1 max-w-[180px] bg-white/10 mt-2" />
            </div>

            <div
              className={`mt-8 transition-all duration-500 ease-out ${
                visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
              }`}
            >
              <ColorNumber
                value={activeItem.eyebrow}
                color={color}
                tick={tick}
                slotIndex={62}
                className="text-xs md:text-sm uppercase tracking-[0.24em]"
              />

              <h3 className="mt-4 max-w-3xl text-2xl md:text-4xl font-medium leading-[1.05] text-white">
                {activeItem.title}
              </h3>

              <p className="mt-6 max-w-3xl text-base md:text-xl leading-[1.75] text-white/72">
                {activeItem.text}
              </p>
            </div>
          </FramedBlock>
        </div>
      </div>
    </section>
  );
}

export default function Apropos() {
  const [colorTick, setColorTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setColorTick((value) => value + 1);
    }, COLOR_ROTATION_MS);

    return () => clearInterval(interval);
  }, []);

  const activeColor = COLORS[colorTick % COLORS.length];

  return (
    <>
      <style>{`
        @keyframes slowFloat {
          0% {
            transform: translate3d(0, 0, 0) scale(1.01);
          }
          50% {
            transform: translate3d(0, -8px, 0) scale(1.03);
          }
          100% {
            transform: translate3d(0, 0, 0) scale(1.01);
          }
        }
      `}</style>

      <div className="relative overflow-hidden bg-black text-white">
        <div className="pointer-events-none absolute inset-0 opacity-[0.04]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,white,transparent_30%),radial-gradient(circle_at_bottom_right,white,transparent_28%)]" />
        </div>

        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,transparent,rgba(255,255,255,0.015),transparent)]" />

        <div className="relative z-10">
          <section className="relative min-h-[82vh] flex items-end overflow-hidden">
            <img
              src="/photos/phototournagegum2.jpg"
              alt="La Niche Studio"
              className="absolute inset-0 h-full w-full object-cover scale-[1.02]"
              style={{ animation: "slowFloat 14s ease-in-out infinite" }}
            />

            <div className="absolute inset-0 bg-black/45" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/72 to-black/25" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/12 to-black/25" />

            <div className="relative z-10 w-full max-w-6xl mx-auto px-4 md:px-6 pb-14 md:pb-20 pt-28">
              <div className="max-w-5xl">
                <p className="mb-5 text-[11px] md:text-xs uppercase tracking-[0.26em] text-white/50">
                  La Niche Studio · Association loi 1901
                </p>

                <h1 className="max-w-5xl text-4xl md:text-6xl lg:text-7xl font-semibold leading-[0.92] tracking-tight">
                  Une plateforme pour voir
                  <br />
                  et diffuser des courts-métrages.
                  <br />
                  Simplement.
                </h1>

                <p className="mt-6 max-w-2xl text-base md:text-lg leading-relaxed text-white/72">
                  La Baie Vitrée est un espace gratuit dédié aux courts-métrages
                  indépendants, qui permet à la fois de les découvrir et de les
                  diffuser sans contrainte.
                </p>
              </div>

              <div className="mt-10 flex items-center gap-4 text-white/42">
                <ColorLine color={activeColor} tick={colorTick} slotIndex={70} className="w-14" />
                <p className="text-[11px] md:text-xs uppercase tracking-[0.22em]">
                  Diffusion · Éditorial · Ancrage
                </p>
              </div>
            </div>
          </section>

          <EditorialSplitSection
            className="py-20 md:py-28"
            eyebrow="À propos"
            title="Un espace pour rendre les films plus faciles à voir."
            intro="Pensé pour le public comme pour les réalisateurs, sans compliquer l’accès."
            color={activeColor}
            tick={colorTick}
            slotIndex={80}
          >
            <div className="space-y-6">
              <p>
                <strong className="font-medium text-white">La Baie Vitrée</strong>{" "}
                est portée par{" "}
                <strong className="font-medium text-white">La Niche Studio</strong>,
                une association basée à Grenoble.
              </p>

              <p>
                Le projet part d’un constat simple : beaucoup de courts-métrages
                existent, mais restent difficiles à voir en dehors des festivals
                ou de plateformes fermées.
              </p>

              <p>
                L’idée est donc de proposer un espace accessible, où les films
                peuvent être diffusés facilement et regardés librement.
              </p>
            </div>
          </EditorialSplitSection>

          <ManifestoBand color={activeColor} tick={colorTick} />

          <AboutCarousel color={activeColor} tick={colorTick} />

          <section className="max-w-6xl mx-auto px-4 md:px-6 py-20 md:py-28">
            <div className="grid md:grid-cols-12 gap-8 md:gap-12">
              <div className="md:col-span-4">
                <SectionHeader
                  eyebrow="Fonctionnement"
                  title="Un cadre simple."
                  intro="Un accès libre pour regarder, un soutien libre pour participer."
                />
                <ColorLine color={activeColor} tick={colorTick} slotIndex={90} className="mt-6" />
              </div>

              <div className="md:col-span-8">
                <ValueCards color={activeColor} tick={colorTick} />
              </div>
            </div>
          </section>

          <section className="max-w-6xl mx-auto px-4 md:px-6 py-20 md:py-28">
            <div className="grid md:grid-cols-12 gap-8 md:gap-12">
              <div className="md:col-span-4">
                <SectionHeader
                  eyebrow="Réalisateurs"
                  title="Les films restent à leurs auteurs."
                  intro="Un espace de diffusion, pas une prise de contrôle sur les œuvres."
                />
                <ColorLine color={activeColor} tick={colorTick} slotIndex={100} className="mt-6" />
              </div>

              <div className="md:col-span-8">
                <RightsGrid color={activeColor} tick={colorTick} />
              </div>
            </div>
          </section>

          <section className="px-4 md:px-6 pb-20 md:pb-28">
            <FramedBlock
              color={activeColor}
              tick={colorTick}
              slotIndex={110}
              className="max-w-6xl mx-auto"
              innerClassName="p-7 md:p-12 bg-white/[0.04]"
            >
              <p className="text-[11px] md:text-xs uppercase tracking-[0.24em] text-white/45 mb-3">
                Explorer
              </p>

              <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8">
                <div className="max-w-2xl">
                  <h2 className="text-3xl md:text-5xl font-semibold leading-[1.02] tracking-tight">
                    Vous pouvez découvrir les films,
                    <br />
                    ou proposer le vôtre.
                  </h2>

                  <p className="mt-5 text-base md:text-lg leading-relaxed text-white/68">
                    Les deux sont ouverts.
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <AccentButton to="/catalogue" filled>
                    Voir les films
                  </AccentButton>

                  <AccentButton
                    to="/realisateurs"
                    color={activeColor}
                    tick={colorTick}
                    slotIndex={111}
                  >
                    Proposer un film
                  </AccentButton>
                </div>
              </div>
            </FramedBlock>
          </section>
        </div>
      </div>
    </>
  );
}