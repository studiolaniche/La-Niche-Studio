import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const COLORS = ["#FF0054", "#0096FF", "#00C49A", "#FFB800", "#C83CB9"];
const COLOR_ROTATION_MS = 28000;

function getStableDelay(slotIndex, max = 1400) {
  const x = Math.sin(slotIndex * 137.7 * 9999.91) * 10000;
  const seeded = x - Math.floor(x);
  return Math.floor(seeded * max);
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
              className="absolute inset-0 transition-opacity duration-[2400ms]"
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

function ColorLabel({ value, color, tick, slotIndex = 1, className = "" }) {
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
              className={`absolute inset-0 text-[11px] md:text-xs uppercase tracking-[0.22em] transition-opacity duration-[2400ms] ${className}`}
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
              className="absolute inset-0 pointer-events-none transition-opacity duration-[2400ms]"
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

function SectionHeader({ eyebrow, title, intro }) {
  return (
    <div className="max-w-2xl">
      {eyebrow && (
        <p className="mb-3 text-[11px] md:text-xs uppercase tracking-[0.24em] text-white/45">
          {eyebrow}
        </p>
      )}

      <h2 className="text-3xl md:text-5xl font-semibold leading-[0.98] tracking-tight text-white">
        {title}
      </h2>

      {intro && (
        <p className="mt-5 text-base md:text-lg leading-relaxed text-white/68">
          {intro}
        </p>
      )}
    </div>
  );
}

function EditorialSection({
  eyebrow,
  title,
  intro,
  children,
  color,
  tick,
  slotIndex,
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

function ActivityCards({ color, tick }) {
  const items = [
    {
      title: "Produire",
      text: "Développer et réaliser des projets audiovisuels indépendants.",
    },
    {
      title: "Rassembler",
      text: "Créer des collaborations entre auteurs, techniciens, artistes et bénévoles.",
    },
    {
      title: "Diffuser",
      text: "Permettre aux films de continuer leur vie après leur production grâce à La Baie Vitrée.",
    },
  ];

  return (
    <div className="grid md:grid-cols-3 gap-4 md:gap-5">
      {items.map((item, index) => (
        <div
          key={item.title}
          className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-6 transition-all duration-300 hover:border-white/18 hover:bg-white/[0.045]"
        >
          <ColorLabel
            value={`0${index + 1}`}
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

function PrincipleCards({ color, tick }) {
  const items = [
    {
      title: "Gratuit",
      text: "Les films peuvent être regardés librement.",
    },
    {
      title: "Non exclusif",
      text: "Les réalisateurs gardent leurs droits.",
    },
    {
      title: "Soutien volontaire",
      text: "Les dons restent libres, jamais obligatoires.",
    },
  ];

  return (
    <div className="grid md:grid-cols-3 gap-4 md:gap-5 mt-8">
      {items.map((item, index) => (
        <div
          key={item.title}
          className="rounded-[1.4rem] border border-white/10 bg-black/25 p-5"
        >
          <ColorLabel
            value={item.title}
            color={color}
            tick={tick}
            slotIndex={40 + index}
          />

          <p className="mt-4 text-sm md:text-base leading-relaxed text-white/68">
            {item.text}
          </p>
        </div>
      ))}
    </div>
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
          0% { transform: translate3d(0, 0, 0) scale(1.01); }
          50% { transform: translate3d(0, -8px, 0) scale(1.03); }
          100% { transform: translate3d(0, 0, 0) scale(1.01); }
        }
      `}</style>

      <div className="relative overflow-hidden bg-black text-white">
        <div className="pointer-events-none absolute inset-0 opacity-[0.04]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,white,transparent_30%),radial-gradient(circle_at_bottom_right,white,transparent_28%)]" />
        </div>

        <div className="relative z-10">
          {/* HERO */}
          <section className="relative min-h-[82vh] flex items-end overflow-hidden">
            <img
              src="/photos/phototournagegum1.jpg"
              alt="La Niche Studio"
              className="absolute inset-0 h-full w-full object-cover scale-[1.02]"
              style={{ animation: "slowFloat 14s ease-in-out infinite" }}
            />

            <div className="absolute inset-0 bg-black/48" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/72 to-black/28" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/10 to-black/25" />

            <div className="relative z-10 w-full max-w-6xl mx-auto px-4 md:px-6 pb-14 md:pb-20 pt-28">
              <p className="mb-5 text-[11px] md:text-xs uppercase tracking-[0.26em] text-white/50">
                À propos
              </p>

              <h1 className="max-w-5xl text-4xl md:text-6xl lg:text-7xl font-semibold leading-[0.92] tracking-tight">
                La Niche Studio.
                <br />
                Une association
                <br />
                de cinéma indépendant.
              </h1>

              <p className="mt-6 max-w-2xl text-base md:text-lg leading-relaxed text-white/72">
                Née à Grenoble, La Niche Studio produit des films, accompagne des
                projets, et porte La Baie Vitrée comme espace de diffusion.
              </p>

              <div className="mt-10 flex items-center gap-4 text-white/42">
                <ColorLine color={activeColor} tick={colorTick} slotIndex={1} className="w-14" />
                <p className="text-[11px] md:text-xs uppercase tracking-[0.22em]">
                  Produire · Rassembler · Diffuser
                </p>
              </div>
            </div>
          </section>

          {/* POURQUOI */}
          <EditorialSection
            className="py-20 md:py-28"
            eyebrow="Pourquoi"
            title="Faire un film demande souvent plus qu’une caméra."
            intro="Il faut des rencontres, du temps, des compétences et des espaces où les projets peuvent grandir."
            color={activeColor}
            tick={colorTick}
            slotIndex={2}
          >
            <div className="space-y-6">
              <p>
                La Niche Studio est née de cette idée simple : mettre en commun
                des ressources et des savoir-faire pour permettre à des œuvres
                indépendantes d’exister.
              </p>

              <p>
                L’association cherche à créer un cadre où des projets peuvent se
                développer collectivement, sans attendre des structures plus
                lourdes ou plus éloignées.
              </p>
            </div>
          </EditorialSection>

          {/* CE QUE NOUS FAISONS */}
          <section className="max-w-6xl mx-auto px-4 md:px-6 pb-20 md:pb-28">
            <div className="grid md:grid-cols-12 gap-8 md:gap-12">
              <div className="md:col-span-4">
                <SectionHeader
                  eyebrow="Ce que nous faisons"
                  title="Des films, des liens, des espaces de diffusion."
                  intro="L’association agit à plusieurs endroits du parcours d’un projet."
                />
                <ColorLine color={activeColor} tick={colorTick} slotIndex={10} className="mt-6" />
              </div>

              <div className="md:col-span-8">
                <ActivityCards color={activeColor} tick={colorTick} />
              </div>
            </div>
          </section>

          {/* LA BAIE VITRÉE */}
          <section className="max-w-6xl mx-auto px-4 md:px-6 pb-20 md:pb-28">
            <FramedBlock
              color={activeColor}
              tick={colorTick}
              slotIndex={30}
              innerClassName="p-7 md:p-12 bg-white/[0.04]"
            >
              <div className="grid md:grid-cols-12 gap-8 md:gap-12">
                <div className="md:col-span-4">
                  <p className="mb-3 text-[11px] md:text-xs uppercase tracking-[0.24em] text-white/45">
                    La Baie Vitrée
                  </p>

                  <h2 className="text-3xl md:text-5xl font-semibold leading-[1.02] tracking-tight">
                    Le projet de diffusion porté par l’association.
                  </h2>

                  <ColorLine color={activeColor} tick={colorTick} slotIndex={31} className="mt-6" />
                </div>

                <div className="md:col-span-8">
                  <div className="max-w-2xl text-base md:text-lg leading-[1.8] text-white/74">
                    <p>
                      La Baie Vitrée est un projet porté par La Niche Studio.
                    </p>

                    <p className="mt-5">
                      Nous l’avons imaginée comme un espace simple : regarder des
                      films gratuitement, soutenir les œuvres de manière
                      volontaire, et créer un lien plus direct entre les créateurs
                      et leur public.
                    </p>
                  </div>

                  <PrincipleCards color={activeColor} tick={colorTick} />
                </div>
              </div>
            </FramedBlock>
          </section>

          {/* GRENOBLE */}
          <EditorialSection
            className="pb-20 md:pb-28"
            eyebrow="Grenoble"
            title="Un projet né dans un territoire concret."
            intro="L’association est basée à Grenoble, au contact d’un tissu local de créateurs, techniciens, bénévoles et structures culturelles."
            color={activeColor}
            tick={colorTick}
            slotIndex={50}
          >
            <div className="space-y-6">
              <p>
                Nous croyons qu’un cinéma indépendant peut se construire partout,
                dès lors qu’il existe des personnes prêtes à partager leurs
                compétences et leurs envies.
              </p>

              <p>
                La Niche Studio part de cet ancrage local, tout en restant ouverte
                à d’autres projets, d’autres regards et d’autres façons de faire.
              </p>
            </div>
          </EditorialSection>

          {/* CTA */}
          <section className="px-4 md:px-6 pb-20 md:pb-28">
            <FramedBlock
              color={activeColor}
              tick={colorTick}
              slotIndex={60}
              className="max-w-6xl mx-auto"
              innerClassName="p-7 md:p-12 bg-white/[0.04]"
            >
              <p className="text-[11px] md:text-xs uppercase tracking-[0.24em] text-white/45 mb-3">
                Explorer
              </p>

              <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8">
                <div className="max-w-2xl">
                  <h2 className="text-3xl md:text-5xl font-semibold leading-[1.02] tracking-tight">
                    Découvrir les films,
                    <br />
                    ou participer au projet.
                  </h2>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Link
                    to="/catalogue"
                    className="rounded-full bg-white px-6 py-3 text-black transition-all duration-300 hover:-translate-y-[1px] hover:bg-white/90"
                  >
                    Voir les films
                  </Link>

                  <SmoothAccent color={activeColor} tick={colorTick} slotIndex={61}>
                    {(baseColor, overlayColor, showOverlay) => (
                      <Link
                        to="/participer"
                        className="relative rounded-full px-6 py-3 text-white transition-all duration-300 hover:-translate-y-[1px] hover:bg-white/10"
                        style={{ border: `1px solid ${baseColor}` }}
                      >
                        Participer

                        {overlayColor && (
                          <span
                            className="pointer-events-none absolute inset-0 rounded-full transition-opacity duration-[2400ms]"
                            style={{
                              border: `1px solid ${overlayColor}`,
                              opacity: showOverlay ? 1 : 0,
                            }}
                          />
                        )}
                      </Link>
                    )}
                  </SmoothAccent>
                </div>
              </div>
            </FramedBlock>
          </section>
        </div>
      </div>
    </>
  );
}