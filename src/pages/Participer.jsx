import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const HELLOASSO_URL =
  "https://www.helloasso.com/associations/la-niche-studio/formulaires/2";

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

function Field({ label, children }) {
  return (
    <div className="space-y-2">
      <label className="text-sm text-white/70">{label}</label>
      {children}
    </div>
  );
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

function AccentButton({ children, href, to, color, tick, slotIndex, filled = false }) {
  if (filled && href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="rounded-full bg-white px-6 py-3 text-black transition-all duration-300 hover:-translate-y-[1px] hover:bg-white/90"
      >
        {children}
      </a>
    );
  }

  if (filled && to) {
    return (
      <Link
        to={to}
        className="rounded-full bg-white px-6 py-3 text-black transition-all duration-300 hover:-translate-y-[1px] hover:bg-white/90"
      >
        {children}
      </Link>
    );
  }

  const content = (baseColor, overlayColor, showOverlay) => {
    const className =
      "relative rounded-full px-6 py-3 text-white transition-all duration-300 hover:-translate-y-[1px] hover:bg-white/10";

    const style = { border: `1px solid ${baseColor}` };

    const border = overlayColor && (
      <span
        className="pointer-events-none absolute inset-0 rounded-full transition-opacity duration-[2400ms]"
        style={{
          border: `1px solid ${overlayColor}`,
          opacity: showOverlay ? 1 : 0,
        }}
      />
    );

    if (href) {
      return (
        <a href={href} target="_blank" rel="noopener noreferrer" className={className} style={style}>
          {children}
          {border}
        </a>
      );
    }

    return (
      <Link to={to} className={className} style={style}>
        {children}
        {border}
      </Link>
    );
  };

  return (
    <SmoothAccent color={color} tick={tick} slotIndex={slotIndex}>
      {content}
    </SmoothAccent>
  );
}

function FormSubmitButton({ color, tick }) {
  return (
    <SmoothAccent color={color} tick={tick} slotIndex={40}>
      {(baseColor, overlayColor, showOverlay) => (
        <button
          type="submit"
          className="relative rounded-full px-7 py-3.5 text-white transition-all duration-300 hover:-translate-y-[1px] hover:bg-white/10"
          style={{ border: `1px solid ${baseColor}` }}
        >
          Envoyer le film
          {overlayColor && (
            <span
              className="pointer-events-none absolute inset-0 rounded-full transition-opacity duration-[2400ms]"
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

function InfoCards({ color, tick }) {
  const items = [
    {
      title: "Gratuit",
      text: "Les films restent accessibles librement.",
    },
    {
      title: "Non exclusif",
      text: "Les réalisateurs gardent leurs droits.",
    },
    {
      title: "Soutien libre",
      text: "Les dons sont volontaires, jamais obligatoires.",
    },
  ];

  return (
    <div className="grid md:grid-cols-3 gap-4 md:gap-5">
      {items.map((item, index) => (
        <div
          key={item.title}
          className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-6 transition-all duration-300 hover:border-white/18 hover:bg-white/[0.045]"
        >
          <SmoothAccent color={color} tick={tick} slotIndex={20 + index}>
            {(baseColor) => (
              <p
                className="text-[11px] md:text-xs uppercase tracking-[0.22em]"
                style={{ color: baseColor }}
              >
                0{index + 1}
              </p>
            )}
          </SmoothAccent>

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

export default function Participer() {
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

      <div className="relative min-h-[calc(100vh-4rem)] overflow-hidden bg-black text-white">
        <div className="pointer-events-none absolute inset-0 opacity-[0.04]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,white,transparent_30%),radial-gradient(circle_at_bottom_right,white,transparent_28%)]" />
        </div>

        <div className="relative z-10">
          {/* HERO */}
          <section className="relative min-h-[78vh] flex items-end overflow-hidden">
            <img
              src="/photos/phototournagegum1.jpg"
              alt="Participer à La Baie Vitrée"
              className="absolute inset-0 h-full w-full object-cover scale-[1.02]"
              style={{ animation: "slowFloat 14s ease-in-out infinite" }}
            />

            <div className="absolute inset-0 bg-black/48" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/72 to-black/28" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/10 to-black/25" />

            <div className="relative z-10 w-full max-w-6xl mx-auto px-4 md:px-6 pb-14 md:pb-20 pt-28">
              <p className="mb-5 text-[11px] md:text-xs uppercase tracking-[0.26em] text-white/50">
                Participer
              </p>

              <h1 className="max-w-5xl text-4xl md:text-6xl lg:text-7xl font-semibold leading-[0.92] tracking-tight">
                Proposer un film
                <br />
                ou soutenir
                <br />
                la plateforme.
              </h1>

              <p className="mt-6 max-w-2xl text-base md:text-lg leading-relaxed text-white/72">
                La Baie Vitrée est un espace gratuit pour voir et diffuser des
                courts-métrages indépendants. Vous pouvez participer en envoyant
                un film, en faisant un don, ou simplement en faisant circuler les œuvres.
              </p>

              <div className="mt-10 flex items-center gap-4 text-white/42">
                <ColorLine color={activeColor} tick={colorTick} slotIndex={1} className="w-14" />
                <p className="text-[11px] md:text-xs uppercase tracking-[0.22em]">
                  Film · Don · Partage
                </p>
              </div>
            </div>
          </section>

          {/* INTRO */}
          <section className="max-w-6xl mx-auto px-4 md:px-6 py-20 md:py-28">
            <div className="grid md:grid-cols-12 gap-8 md:gap-12">
              <div className="md:col-span-4">
                <SectionHeader
                  eyebrow="Deux façons simples"
                  title="Participer, ce n’est pas forcément faire beaucoup."
                  intro="Un film envoyé, un don, un lien partagé : tout peut aider."
                />
                <ColorLine color={activeColor} tick={colorTick} slotIndex={2} className="mt-6" />
              </div>

              <div className="md:col-span-8">
                <div className="max-w-2xl space-y-6 text-base md:text-lg leading-[1.8] text-white/74">
                  <p>
                    Vous avez réalisé un court-métrage ? Vous pouvez nous
                    l’envoyer via le formulaire.
                  </p>
                  <p>
                    Vous aimez le projet ? Vous pouvez le soutenir par un don,
                    ou simplement parler des films autour de vous.
                  </p>
                  <p>
                    L’idée reste simple : garder les films accessibles, et leur
                    donner plus de chances d’être vus.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* CARDS */}
          <section className="max-w-6xl mx-auto px-4 md:px-6 pb-20 md:pb-28">
            <InfoCards color={activeColor} tick={colorTick} />
          </section>

          {/* PROPOSER UN FILM */}
          <section className="max-w-6xl mx-auto px-4 md:px-6 pb-20 md:pb-28">
            <div className="grid lg:grid-cols-12 gap-8 md:gap-10">
              <div className="lg:col-span-4">
                <SectionHeader
                  eyebrow="Proposer un film"
                  title="Vous pouvez nous envoyer votre projet."
                  intro="On le regarde, on échange avec vous, puis on voit si une mise en ligne est possible."
                />
                <ColorLine color={activeColor} tick={colorTick} slotIndex={10} className="mt-6" />

                <div className="mt-8 space-y-5 text-base leading-relaxed text-white/70">
                  <p>
                    La diffusion est non exclusive : vous gardez vos droits et
                    votre film peut continuer à vivre ailleurs.
                  </p>
                  <p>
                    Le formulaire sert simplement à ouvrir la discussion.
                  </p>
                </div>
              </div>

              <div className="lg:col-span-8">
                <FramedBlock
                  color={activeColor}
                  tick={colorTick}
                  slotIndex={11}
                  innerClassName="p-7 md:p-10 lg:p-12 bg-white/[0.04]"
                >
                  <form
                    action="https://formspree.io/f/mzzjgwyd"
                    method="POST"
                    className="space-y-6"
                  >
                    <div className="grid md:grid-cols-2 gap-5">
                      <Field label="Nom / structure">
                        <Input
                          type="text"
                          name="Nom"
                          placeholder="Votre nom / société"
                          required
                        />
                      </Field>

                      <Field label="Email">
                        <Input
                          type="email"
                          name="Email"
                          placeholder="Votre email"
                          required
                        />
                      </Field>
                    </div>

                    <Field label="Titre du film">
                      <Input
                        type="text"
                        name="Titre"
                        placeholder="Titre du film"
                      />
                    </Field>

                    <Field label="Lien de visionnage">
                      <Input
                        type="text"
                        name="Lien"
                        placeholder="Lien Vimeo / Drive / autre"
                      />
                    </Field>

                    <Field label="Quelques mots sur le projet">
                      <Textarea
                        name="Message"
                        placeholder="Synopsis, durée, sélections, contexte, droits, ou simplement ce que vous voulez nous dire."
                        rows={8}
                      />
                    </Field>

                    <div className="pt-2">
                      <FormSubmitButton color={activeColor} tick={colorTick} />
                    </div>
                  </form>

                  <p className="mt-6 max-w-2xl text-sm leading-relaxed text-white/55">
                    En envoyant ce formulaire, vous acceptez d’être recontacté
                    pour échanger autour du film et de sa diffusion éventuelle.
                  </p>
                </FramedBlock>
              </div>
            </div>
          </section>

          {/* SOUTENIR */}
          <section className="max-w-6xl mx-auto px-4 md:px-6 pb-20 md:pb-28">
            <FramedBlock
              color={activeColor}
              tick={colorTick}
              slotIndex={50}
              innerClassName="p-7 md:p-12 bg-white/[0.04]"
            >
              <div className="grid md:grid-cols-12 gap-8 md:gap-12 md:items-end">
                <div className="md:col-span-7">
                  <p className="mb-3 text-[11px] md:text-xs uppercase tracking-[0.24em] text-white/45">
                    Soutenir
                  </p>

                  <h2 className="text-3xl md:text-5xl font-semibold leading-[1.02] tracking-tight">
                    Faire un don,
                    <br />
                    ou simplement faire circuler les films.
                  </h2>

                  <div className="mt-6 max-w-2xl space-y-5 text-base md:text-lg leading-relaxed text-white/68">
                    <p>
                      Les films restent accessibles gratuitement. Le don n’est
                      jamais obligatoire.
                    </p>
                    <p>
                      Il permet de faire tenir la plateforme, et quand c’est
                      possible, d’accompagner les œuvres diffusées.
                    </p>
                    <p>
                      Partager un film, revenir voir les nouveautés, parler du
                      projet : c’est aussi participer.
                    </p>
                  </div>
                </div>

                <div className="md:col-span-5 flex flex-wrap md:justify-end gap-3">
                  <AccentButton href={HELLOASSO_URL} filled>
                    Faire un don
                  </AccentButton>

                  <AccentButton
                    to="/catalogue"
                    color={activeColor}
                    tick={colorTick}
                    slotIndex={51}
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