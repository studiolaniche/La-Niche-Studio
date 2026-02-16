import { useMemo, useState, useEffect } from "react";
import { Link } from "react-router-dom";

const COLORS = ["#FF0054", "#0096FF", "#00C49A", "#FFB800", "#C83CB9"];

const HELLOASSO_URL =
  "https://www.helloasso.com/associations/la-niche-studio/formulaires/2";
const INSTAGRAM_URL = "https://www.instagram.com/laniche.studio/";

const TOPICS = [
  {
    id: "modele",
    title: "Modèle 90/10",
    short: "90% aux ayants droits, 10% plateforme.",
    colorIndex: 0,
    long: (
      <>
        <p className="mb-3">
          La Baie Vitrée est une plateforme associative : l’accès aux films est{" "}
          <strong>gratuit</strong>.
        </p>
        <p className="mb-3">
          Les dons sont <strong>volontaires</strong> et versés à l’association via{" "}
          <strong>HelloAsso</strong>.
        </p>

        <ul className="list-disc list-inside space-y-1 opacity-90">
          <li>
            <strong>90%</strong> des dons sont destinés aux{" "}
            <strong>ayants droits</strong> des œuvres diffusées
          </li>
          <li>
            <strong>10%</strong> servent à faire vivre la plateforme (hébergement,
            maintenance, outils)
          </li>
        </ul>

        <p className="mt-4 opacity-90">
          Si vous indiquez un <strong>code de film</strong> lors du don, cela nous aide à{" "}
          <strong>retracer les dons</strong> et à les prendre en compte dans la répartition,{" "}
          <strong>dans la mesure du possible</strong>.
        </p>
        <p className="mt-2 text-xs opacity-70">
          Cette indication est <strong>facultative</strong> et peut être modifiée/supprimée.
        </p>
      </>
    ),
  },
  {
    id: "transparence",
    title: "Transparence",
    short: "Suivi clair et reversements périodiques.",
    colorIndex: 2,
    long: (
      <>
        <p className="mb-3">
          Nous privilégions un système <strong>simple</strong> et{" "}
          <strong>compréhensible</strong> : accès gratuit, don volontaire, soutien
          concret aux œuvres.
        </p>
        <p className="opacity-90">
          Les reversements sont effectués de manière{" "}
          <strong>périodique</strong> et suivis en interne.
        </p>
      </>
    ),
  },
  {
    id: "asso",
    title: "Association",
    short: "Projet porté par La Niche Studio (loi 1901).",
    colorIndex: 3,
    long: (
      <>
        <p className="mb-3">
          La Baie Vitrée est une initiative portée par{" "}
          <strong>La Niche Studio</strong>, association loi <strong>1901</strong>.
        </p>
        <p className="opacity-90">
          Le don <strong>n’est pas un achat</strong> et ne conditionne{" "}
          <strong>pas l’accès</strong> aux films.
        </p>
      </>
    ),
  },
  {
    id: "initiative",
    title: "Aider autrement",
    short: "Partager, proposer un film, suivre nos actus.",
    colorIndex: 1,
    long: (
      <>
        <p className="mb-3">
          Vous pouvez soutenir La Baie Vitrée <strong>même sans donner</strong>.
        </p>

        <ul className="list-disc list-inside space-y-2 opacity-90">
          <li>
            <strong>Partagez</strong> un film ou une page projet autour de vous.
          </li>
          <li>
            <strong>Proposez</strong> un court-métrage (ou un making-of) via la page{" "}
            <strong>Réalisateurs</strong>.
          </li>
          <li>
            Suivez nos <strong>réseaux</strong> pour les nouveautés, appels à films, et actualités.
          </li>
        </ul>

        <p className="mt-4 text-sm opacity-85">
          L’idée : rendre les œuvres visibles, créer une vitrine locale, et faire grandir la
          communauté autour du court-métrage.
        </p>

        <div className="mt-5 flex flex-col sm:flex-row gap-3">
          <Link
            to="/realisateurs"
            className="px-5 py-3 border border-white/30 text-white rounded-lg hover:bg-white/10 transition text-center font-semibold"
          >
            Proposer un film
          </Link>

          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-3 bg-white text-black rounded-lg hover:bg-white/90 transition text-center font-semibold"
          >
            Instagram
          </a>
        </div>
      </>
    ),
  },
];

function Card({ topic, active, onClick }) {
  const color = COLORS[topic.colorIndex];

  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "relative text-left overflow-hidden border transition p-5 md:p-6",
        active
          ? "border-white/30 bg-black/60"
          : "border-white/10 bg-black/40 hover:bg-black/30",
      ].join(" ")}
    >
      {/* Bande couleur */}
      <div
        className="absolute left-0 top-0 h-full w-1"
        style={{ backgroundColor: color }}
      />

      <div className="pl-4">
        <h3 className="text-lg md:text-xl font-semibold">{topic.title}</h3>
        <p className="mt-2 text-sm opacity-80 leading-relaxed">{topic.short}</p>
        <p className="mt-4 text-xs opacity-60">Cliquer pour détails</p>
      </div>
    </button>
  );
}

export default function Soutenir() {
  const [activeId, setActiveId] = useState("modele");

  // ✅ Défilement automatique toutes les 15s (dans l'ordre des TOPICS)
  useEffect(() => {
    const ids = TOPICS.map((t) => t.id);

    const interval = setInterval(() => {
      setActiveId((current) => {
        const idx = ids.indexOf(current);
        const nextIdx = idx === -1 ? 0 : (idx + 1) % ids.length;
        return ids[nextIdx];
      });
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  const active = useMemo(
    () => TOPICS.find((t) => t.id === activeId) || TOPICS[0],
    [activeId]
  );

  const activeColor = COLORS[active.colorIndex];

  return (
    <div className="bg-black text-white min-h-[calc(100vh-4rem)]">
      {/* Header */}
      <section className="max-w-6xl mx-auto px-4 pt-10 pb-6">
        <h1 className="text-4xl md:text-5xl font-bold mb-3">Soutenir</h1>
        <p className="opacity-80 max-w-3xl">
          Une plateforme de courts-métrages indépendants{" "}
          <strong>gratuite</strong>. Si vous le souhaitez, vous pouvez faire un{" "}
          <strong>don volontaire</strong> via HelloAsso.
        </p>
      </section>

      {/* Contenu */}
      <section className="max-w-6xl mx-auto px-4 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Cartes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
            {TOPICS.map((topic) => (
              <Card
                key={topic.id}
                topic={topic}
                active={topic.id === activeId}
                onClick={() => setActiveId(topic.id)}
              />
            ))}
          </div>

          {/* Panneau détails */}
          <div
            className="lg:col-span-2 border bg-black/40 p-6 md:p-8 transition-colors"
            style={{ borderColor: activeColor }}
          >
            <div className="flex flex-col gap-5">
              <div>
                <div
                  className="text-xs uppercase tracking-wide mb-2"
                  style={{ color: activeColor }}
                >
                  Détails
                </div>
                <h2 className="text-2xl md:text-3xl font-bold">{active.title}</h2>
                <div className="mt-4 text-sm md:text-base opacity-90 leading-relaxed">
                  {active.long}
                </div>
              </div>

              {/* CTA dons + catalogue (on les garde toujours visibles) */}
              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href={HELLOASSO_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 bg-white text-black rounded-lg hover:bg-white/90 transition font-semibold text-center"
                >
                  Faire un don sur HelloAsso
                </a>

                <Link
                  to="/catalogue"
                  className="px-6 py-3 border border-white/30 text-white rounded-lg hover:bg-white/10 transition text-center"
                >
                  Voir le catalogue
                </Link>
              </div>

              <div className="text-xs opacity-60">
                Astuce : pour soutenir un film précis, récupérez son code sur sa page
                (ex : <span className="font-mono">GUM_2</span>) et collez-le sur HelloAsso.
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
