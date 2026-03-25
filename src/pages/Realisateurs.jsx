import { useEffect, useMemo, useState } from "react";

const COLORS = ["#FF0054", "#0096FF", "#00C49A", "#FFB800", "#C83CB9"];
const COLOR_ROTATION_MS = 28000;

const TOPICS = [
  {
    id: "pitch",
    title: "Proposer un film",
    short: "Un espace simple pour envoyer un court-métrage.",
    colorIndex: 0,
    long: (
      <>
        <p className="mb-4">
          Vous pouvez nous envoyer votre film ici.
        </p>
        <p className="mb-4">
          La Baie Vitrée diffuse des courts-métrages indépendants en accès libre,
          dans un cadre simple et associatif.
        </p>
        <p className="opacity-90">
          Si votre projet a sa place sur la plateforme, on reprend contact avec vous.
        </p>
      </>
    ),
  },
  {
    id: "droits",
    title: "Vos droits",
    short: "La diffusion n’est pas exclusive.",
    colorIndex: 1,
    long: (
      <>
        <p className="mb-4">
          Vous gardez vos droits.
        </p>
        <p className="mb-4">
          Mettre un film sur La Baie Vitrée ne vous empêche pas de le montrer ailleurs.
        </p>
        <p className="opacity-90">
          Et si besoin, la diffusion peut être arrêtée selon le cadre prévu ensemble.
        </p>
      </>
    ),
  },
  {
    id: "dons",
    title: "Les dons",
    short: "Le film reste gratuit, le soutien est libre.",
    colorIndex: 2,
    long: (
      <>
        <p className="mb-4">
          Les films sont accessibles gratuitement.
        </p>
        <p className="mb-4">
          Les dons sont volontaires. Ils ne servent pas à acheter un accès.
        </p>
        <p className="opacity-90">
          Le principe de la plateforme est simple : montrer les films librement,
          et laisser une possibilité de soutien pour celles et ceux qui le souhaitent.
        </p>
      </>
    ),
  },
  {
    id: "process",
    title: "Comment ça se passe",
    short: "Envoi, échange, validation, mise en ligne.",
    colorIndex: 3,
    long: (
      <>
        <p className="mb-4">
          Vous envoyez le film et quelques infos via le formulaire.
        </p>
        <p className="mb-4">
          Ensuite, on échange avec vous pour vérifier que tout est bon pour la diffusion.
        </p>
        <p className="opacity-90">
          Si ça fonctionne, on prépare la mise en ligne avec vous.
        </p>
      </>
    ),
  },
];

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

function TopicCard({ topic, active, onClick, tick, slotIndex }) {
  const color = COLORS[topic.colorIndex];

  return (
    <SmoothAccent color={color} tick={tick} slotIndex={slotIndex}>
      {(baseColor, overlayColor, showOverlay) => (
        <button
          type="button"
          onClick={onClick}
          className={[
            "relative overflow-hidden rounded-[1.5rem] border p-6 md:p-7 text-left transition-all duration-300",
            active
              ? "bg-white/[0.06] text-white"
              : "border-white/10 bg-white/[0.025] text-white hover:border-white/18 hover:bg-white/[0.04]",
          ].join(" ")}
          style={active ? { borderColor: baseColor } : undefined}
        >
          {active && overlayColor && (
            <span
              className="pointer-events-none absolute inset-0 rounded-[1.5rem] transition-opacity duration-[2400ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
              style={{
                border: `1px solid ${overlayColor}`,
                opacity: showOverlay ? 1 : 0,
              }}
            />
          )}

          <div
            className="absolute left-0 top-0 h-full w-[2px]"
            style={{ backgroundColor: active ? baseColor : `${baseColor}AA` }}
          />

          <div className="pl-4">
            <ColorLabel
              value={topic.title}
              color={baseColor}
              tick={tick}
              slotIndex={slotIndex + 100}
              className="text-[11px] md:text-xs uppercase tracking-[0.22em]"
            />

            <p className="mt-4 text-base md:text-lg leading-relaxed text-white/78">
              {topic.short}
            </p>
          </div>
        </button>
      )}
    </SmoothAccent>
  );
}

function AccentSubmitButton({ color, tick, slotIndex = 1 }) {
  return (
    <SmoothAccent color={color} tick={tick} slotIndex={slotIndex}>
      {(baseColor, overlayColor, showOverlay) => (
        <button
          type="submit"
          className="relative rounded-full px-7 py-3.5 text-white transition-all duration-300 hover:-translate-y-[1px] hover:bg-white/10"
          style={{ border: `1px solid ${baseColor}` }}
        >
          Envoyer le film

          {overlayColor && (
            <span
              className="pointer-events-none absolute inset-0 rounded-full transition-opacity duration-[2400ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
              style={{
                border: `1px solid ${overlayColor}`,
                opacity: showOverlay ? 1 : 0,
              }}
            />
          )}
        </button>
      )}
    </SmoothAccent>
  );
}

function Field({ children }) {
  return <div className="space-y-2">{children}</div>;
}

function Input(props) {
  return (
    <input
      {...props}
      className="w-full rounded-2xl border border-white/15 bg-black px-5 py-4 text-white placeholder:text-white/35 outline-none transition focus:border-white/30"
    />
  );
}

function Textarea(props) {
  return (
    <textarea
      {...props}
      className="w-full rounded-2xl border border-white/15 bg-black px-5 py-4 text-white placeholder:text-white/35 outline-none transition focus:border-white/30"
    />
  );
}

export default function Realisateurs() {
  const [activeId, setActiveId] = useState("pitch");
  const [colorTick, setColorTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setColorTick((value) => value + 1);
    }, COLOR_ROTATION_MS);

    return () => clearInterval(interval);
  }, []);

  const active = useMemo(
    () => TOPICS.find((t) => t.id === activeId) || TOPICS[0],
    [activeId]
  );

  const activeColor = COLORS[active.colorIndex];

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

      <div className="relative min-h-[calc(100vh-4rem)] overflow-hidden bg-black text-white">
        <div className="pointer-events-none absolute inset-0 opacity-[0.04]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,white,transparent_30%),radial-gradient(circle_at_bottom_right,white,transparent_28%)]" />
        </div>

        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,transparent,rgba(255,255,255,0.015),transparent)]" />

        <div className="relative z-10">
          {/* HERO */}
          <section className="relative min-h-[72vh] flex items-end overflow-hidden">
            <img
              src="/photos/phototournagegum1.jpg"
              alt="Réalisateurs"
              className="absolute inset-0 h-full w-full object-cover scale-[1.02]"
              style={{ animation: "slowFloat 14s ease-in-out infinite" }}
            />

            <div className="absolute inset-0 bg-black/48" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/72 to-black/28" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/10 to-black/25" />

            <div className="relative z-10 w-full max-w-6xl mx-auto px-4 md:px-6 pb-14 md:pb-20 pt-28">
              <div className="max-w-5xl">
                <p className="mb-5 text-[11px] md:text-xs uppercase tracking-[0.26em] text-white/50">
                  Réalisateurs
                </p>

                <h1 className="max-w-5xl text-4xl md:text-6xl lg:text-7xl font-semibold leading-[0.92] tracking-tight">
                  Vous pouvez
                  <br />
                  nous envoyer
                  <br />
                  votre film.
                </h1>

                <p className="mt-6 max-w-2xl text-base md:text-lg leading-relaxed text-white/72">
                  La Baie Vitrée est un espace de diffusion gratuit pour des
                  courts-métrages indépendants. Cette page vous permet de proposer
                  simplement un projet.
                </p>
              </div>

              <div className="mt-10 flex items-center gap-4 text-white/42">
                <ColorLine color={activeColor} tick={colorTick} slotIndex={1} className="w-14" />
                <p className="text-[11px] md:text-xs uppercase tracking-[0.22em]">
                  Film · Droits · Soutien · Mise en ligne
                </p>
              </div>
            </div>
          </section>

          {/* INTRO */}
          <section className="max-w-6xl mx-auto px-4 md:px-6 py-20 md:py-28">
            <div className="grid md:grid-cols-12 gap-8 md:gap-12">
              <div className="md:col-span-4">
                <SectionHeader
                  eyebrow="Envoyer un projet"
                  title="Un cadre simple."
                  intro="Pas besoin de rentrer dans quelque chose de compliqué pour nous écrire."
                />
                <ColorLine color={activeColor} tick={colorTick} slotIndex={2} className="mt-6" />
              </div>

              <div className="md:col-span-8">
                <div className="max-w-2xl space-y-6 text-base md:text-lg leading-[1.8] text-white/74">
                  <p>
                    Si vous avez un court-métrage, vous pouvez nous l’envoyer ici.
                  </p>
                  <p>
                    On regarde le film, on échange avec vous, et on voit ensemble
                    si une mise en ligne sur La Baie Vitrée est possible.
                  </p>
                  <p>
                    Le but est que ce soit clair, simple, et rassurant.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* CONTENU PRINCIPAL */}
          <section className="max-w-6xl mx-auto px-4 md:px-6 pb-20 md:pb-28">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 md:gap-6">
              <div className="lg:col-span-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
                {TOPICS.map((topic, index) => (
                  <TopicCard
                    key={topic.id}
                    topic={topic}
                    active={topic.id === activeId}
                    onClick={() => setActiveId(topic.id)}
                    tick={colorTick}
                    slotIndex={10 + index}
                  />
                ))}
              </div>

              <div className="lg:col-span-8">
                <FramedBlock
                  color={activeColor}
                  tick={colorTick}
                  slotIndex={30}
                  innerClassName="p-7 md:p-10 lg:p-12 bg-white/[0.04]"
                >
                  <div className="grid gap-10 lg:gap-12">
                    <div className="max-w-3xl">
                      <ColorLabel
                        value="Informations"
                        color={activeColor}
                        tick={colorTick}
                        slotIndex={31}
                        className="text-xs md:text-sm uppercase tracking-[0.24em]"
                      />

                      <h2 className="mt-4 text-2xl md:text-4xl font-medium leading-[1.08] text-white">
                        {active.title}
                      </h2>

                      <div className="mt-6 text-base md:text-lg leading-[1.8] text-white/84">
                        {active.long}
                      </div>
                    </div>

                    <div className="rounded-[1.75rem] border border-white/10 bg-black/30 p-6 md:p-8 lg:p-10">
                      <p className="text-[11px] md:text-xs uppercase tracking-[0.22em] text-white/45 mb-3">
                        Formulaire
                      </p>

                      <h3 className="text-2xl md:text-3xl font-medium mb-8">
                        Proposer votre film
                      </h3>

                      <form
                        action="https://formspree.io/f/mzzjgwyd"
                        method="POST"
                        className="space-y-5"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          <Field>
                            <label className="text-sm text-white/70">Nom / structure</label>
                            <Input
                              type="text"
                              name="Nom"
                              placeholder="Votre nom / société"
                              required
                            />
                          </Field>

                          <Field>
                            <label className="text-sm text-white/70">Email</label>
                            <Input
                              type="email"
                              name="Email"
                              placeholder="Votre email"
                              required
                            />
                          </Field>
                        </div>

                        <Field>
                          <label className="text-sm text-white/70">Titre du film</label>
                          <Input
                            type="text"
                            name="Titre"
                            placeholder="Titre du film"
                          />
                        </Field>

                        <Field>
                          <label className="text-sm text-white/70">Lien de visionnage</label>
                          <Input
                            type="text"
                            name="Lien"
                            placeholder="Lien Vimeo / Drive / autre"
                          />
                        </Field>

                        <Field>
                          <label className="text-sm text-white/70">Quelques mots sur le projet</label>
                          <Textarea
                            name="Message"
                            placeholder="Synopsis, durée, sélections, situation des droits, ou tout autre élément utile."
                            rows={8}
                          />
                        </Field>

                        <div className="pt-3">
                          <AccentSubmitButton
                            color={activeColor}
                            tick={colorTick}
                            slotIndex={32}
                          />
                        </div>
                      </form>

                      <p className="mt-6 max-w-2xl text-sm leading-relaxed text-white/55">
                        En envoyant ce formulaire, vous acceptez simplement
                        d’être recontacté pour échanger autour du film et de sa
                        diffusion éventuelle.
                      </p>
                    </div>
                  </div>

                  <div className="mt-8 border-t border-white/10 pt-6 text-sm leading-relaxed text-white/58">
                    Vous n’êtes pas sûr de quoi envoyer, ou vous avez une question
                    sur les droits ? Dites-le simplement dans le message.
                  </div>
                </FramedBlock>
              </div>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}