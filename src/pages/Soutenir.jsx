import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";

const HELLOASSO_URL =
  "https://www.helloasso.com/associations/la-niche-studio/formulaires/2";
const INSTAGRAM_URL = "https://www.instagram.com/laniche.studio/";

const COLORS = ["#FF0054", "#0096FF", "#00C49A", "#FFB800", "#C83CB9"];
const COLOR_ROTATION_MS = 28000;
const SUPPORT_ROTATION_MS = 5000;

const SUPPORT_ITEMS = [
  {
    id: "partager",
    eyebrow: "Partager",
    number: "01",
    title: "Faire circuler les films compte aussi.",
    text: "Parler d’un film, envoyer un lien, relayer une page ou recommander La Baie Vitrée à quelqu’un : c’est déjà une vraie forme de soutien. La visibilité passe souvent par là.",
  },
  {
    id: "proposer",
    eyebrow: "Proposer",
    number: "02",
    title: "La Baie Vitrée reste ouverte aux propositions.",
    text: "Réalisateurs, productrices, collectifs : soutenir le projet, c’est aussi y faire entrer de nouveaux films. L’idée est de garder un espace vivant, accessible et réellement ouvert.",
  },
  {
    id: "suivre",
    eyebrow: "Suivre",
    number: "03",
    title: "Revenir, regarder, suivre ce qui arrive.",
    text: "Le soutien ne passe pas seulement par un don. Il existe aussi dans la durée : regarder les films, revenir sur la plateforme, suivre les actualités, et faire exister les œuvres dans le temps.",
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
          <div className="absolute inset-0" style={{ backgroundColor: baseColor }} />
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
  href,
  color,
  tick,
  slotIndex = 1,
  filled = false,
}) {
  if (filled && to) {
    return (
      <Link
        to={to}
        className="rounded-full bg-white px-6 py-3 text-black transition-all duration-300 hover:-translate-y-[1px] hover:bg-white/92"
      >
        {children}
      </Link>
    );
  }

  if (filled && href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="rounded-full bg-white px-6 py-3 text-black transition-all duration-300 hover:-translate-y-[1px] hover:bg-white/92"
      >
        {children}
      </a>
    );
  }

  return (
    <SmoothAccent color={color} tick={tick} slotIndex={slotIndex}>
      {(baseColor, overlayColor, showOverlay) =>
        to ? (
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
        ) : (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
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
          </a>
        )
      }
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

function DonationGrid({ color, tick }) {
  const items = [
    {
      number: "01",
      title: "Faire exister La Baie Vitrée",
      text: "Les dons aident à maintenir un espace de diffusion gratuit, simple et accessible.",
    },
    {
      number: "02",
      title: "Accompagner les films",
      text: "Quand c’est possible, ils permettent aussi de mieux faire circuler les œuvres diffusées.",
    },
    {
      number: "03",
      title: "Garder un accès libre",
      text: "Le principe reste le même : regarder un film est libre, soutenir le projet l’est aussi.",
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

function SupportCodeSection({ color, tick }) {
  return (
    <section className="max-w-6xl mx-auto px-4 md:px-6 py-20 md:py-28">
      <div className="grid gap-8 md:grid-cols-[1.15fr_0.85fr] md:items-end">
        <div>
          <SectionHeader
            eyebrow="Soutenir un film"
            title="Vous pouvez aussi orienter votre don."
            intro="Sur les pages film, un code permet d’indiquer plus précisément votre intention."
          />
          <ColorLine color={color} tick={tick} slotIndex={30} className="mt-6" />

          <div className="mt-8 max-w-2xl space-y-5 text-base md:text-lg leading-[1.8] text-white/74">
            <p>
              Si vous faites un don, vous pouvez renseigner le code d’un film
              au moment du soutien.
            </p>
            <p>
              Cela reste facultatif, mais ça nous permet de mieux comprendre
              vers quelles œuvres se portent les contributions.
            </p>
          </div>
        </div>

        <FramedBlock
          color={color}
          tick={tick}
          slotIndex={31}
          innerClassName="px-6 py-8 md:px-8 md:py-10 bg-white/[0.04]"
        >
          <p className="text-[11px] md:text-xs uppercase tracking-[0.22em] text-white/45 mb-3">
            Exemple
          </p>

          <div className="font-mono text-4xl md:text-5xl font-semibold tracking-[0.12em] text-white">
            GUM_2
          </div>
        </FramedBlock>
      </div>
    </section>
  );
}

function RotatingSupportBlock({ color, tick }) {
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
      goToIndex((displayIndex + 1) % SUPPORT_ITEMS.length);
    }, SUPPORT_ROTATION_MS);

    return () => {
      clearInterval(interval);
      clearSwitchTimeout();
    };
  }, [displayIndex]);

  useEffect(() => {
    setActiveIndex(displayIndex);
  }, [displayIndex]);

  const activeItem = useMemo(() => SUPPORT_ITEMS[activeIndex], [activeIndex]);

  return (
    <section className="max-w-6xl mx-auto px-4 md:px-6 py-20 md:py-28">
      <div className="grid md:grid-cols-12 gap-8 md:gap-10 items-start">
        <div className="md:col-span-4">
          <SectionHeader
            eyebrow="Autres façons d’aider"
            title="Soutenir, ce n’est pas seulement donner."
            intro="La Baie Vitrée peut aussi avancer par les gestes simples qui font circuler les films."
          />
          <ColorLine color={color} tick={tick} slotIndex={40} className="mt-6" />

          <div className="mt-8">
            <AccentButton
              href={INSTAGRAM_URL}
              color={color}
              tick={tick}
              slotIndex={41}
            >
              Voir notre Instagram
            </AccentButton>
          </div>
        </div>

        <div className="md:col-span-8">
          <div className="grid sm:grid-cols-3 gap-3">
            {SUPPORT_ITEMS.map((item, index) => {
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
                value={`${activeItem.number} / ${String(SUPPORT_ITEMS.length).padStart(2, "0")}`}
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

export default function Soutenir() {
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
          {/* HERO */}
          <section className="relative min-h-[72vh] flex items-end overflow-hidden">
            <img
              src="/photos/phototournagegum1.jpg"
              alt="Soutenir La Baie Vitrée"
              className="absolute inset-0 h-full w-full object-cover scale-[1.02]"
              style={{ animation: "slowFloat 14s ease-in-out infinite" }}
            />

            <div className="absolute inset-0 bg-black/45" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/72 to-black/25" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/12 to-black/25" />

            <div className="relative z-10 w-full max-w-6xl mx-auto px-4 md:px-6 pb-14 md:pb-20 pt-28">
              <div className="max-w-5xl">
                <p className="mb-5 text-[11px] md:text-xs uppercase tracking-[0.26em] text-white/50">
                  Soutenir
                </p>

                <h1 className="max-w-5xl text-4xl md:text-6xl lg:text-7xl font-semibold leading-[0.92] tracking-tight">
                  La Baie Vitrée est gratuite.
                  <br />
                  Si vous le souhaitez,
                  <br />
                  vous pouvez contribuer.
                </h1>

                <p className="mt-6 max-w-2xl text-base md:text-lg leading-relaxed text-white/72">
                  Le principe reste simple : voir les films est libre. Soutenir
                  le projet, ou les œuvres qui y circulent, reste possible.
                </p>
              </div>

              <div className="mt-10 flex items-center gap-4 text-white/42">
                <ColorLine color={activeColor} tick={colorTick} slotIndex={70} className="w-14" />
                <p className="text-[11px] md:text-xs uppercase tracking-[0.22em]">
                  Don · Circulation · Visibilité
                </p>
              </div>
            </div>
          </section>

          {/* INTRO */}
          <EditorialSplitSection
            className="py-20 md:py-28"
            eyebrow="Soutien"
            title="Un don sert d’abord à faire tenir l’espace."
            intro="Pas comme un passage obligé, mais comme une possibilité ouverte."
            color={activeColor}
            tick={colorTick}
            slotIndex={80}
          >
            <div className="space-y-6">
              <p>
                Les dons permettent de faire exister{" "}
                <strong className="font-medium text-white">La Baie Vitrée</strong>{" "}
                dans la durée.
              </p>

              <p>
                Ils aident à maintenir un espace de diffusion gratuit, et quand
                c’est possible, à mieux accompagner les films présentés sur la
                plateforme.
              </p>

              <p>
                L’idée n’est pas de conditionner l’accès, mais de laisser une
                possibilité de soutien à celles et ceux qui le souhaitent.
              </p>
            </div>
          </EditorialSplitSection>

          {/* À quoi sert le soutien */}
          <section className="max-w-6xl mx-auto px-4 md:px-6 py-20 md:py-28">
            <div className="grid md:grid-cols-12 gap-8 md:gap-12">
              <div className="md:col-span-4">
                <SectionHeader
                  eyebrow="À quoi ça sert"
                  title="Un soutien simple, pour un cadre simple."
                  intro="L’objectif reste le même : garder les films visibles et l’accès ouvert."
                />
                <ColorLine color={activeColor} tick={colorTick} slotIndex={90} className="mt-6" />
              </div>

              <div className="md:col-span-8">
                <DonationGrid color={activeColor} tick={colorTick} />
              </div>
            </div>
          </section>

          {/* Code film */}
          <SupportCodeSection color={activeColor} tick={colorTick} />

          {/* Bloc rotatif */}
          <RotatingSupportBlock color={activeColor} tick={colorTick} />

          {/* CTA */}
          <section className="px-4 md:px-6 pb-20 md:pb-28">
            <FramedBlock
              color={activeColor}
              tick={colorTick}
              slotIndex={110}
              className="max-w-6xl mx-auto"
              innerClassName="p-7 md:p-12 bg-white/[0.04]"
            >
              <p className="text-[11px] md:text-xs uppercase tracking-[0.24em] text-white/45 mb-3">
                Action
              </p>

              <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8">
                <div className="max-w-2xl">
                  <h2 className="text-3xl md:text-5xl font-semibold leading-[1.02] tracking-tight">
                    Faire un don,
                    <br />
                    ou simplement continuer à regarder.
                  </h2>

                  <p className="mt-5 text-base md:text-lg leading-relaxed text-white/68">
                    Les deux comptent.
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <AccentButton
                    href={HELLOASSO_URL}
                    filled
                  >
                    Faire un don
                  </AccentButton>

                  <AccentButton
                    to="/catalogue"
                    color={activeColor}
                    tick={colorTick}
                    slotIndex={111}
                  >
                    Voir les films
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