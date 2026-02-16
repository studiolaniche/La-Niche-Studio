import { useMemo, useState } from "react";

const COLORS = ["#FF0054", "#0096FF", "#00C49A", "#FFB800", "#C83CB9"];

const TOPICS = [
  {
    id: "pitch",
    title: "Proposer un film",
    short: "Diffusion gratuite, associative, et non exclusive.",
    colorIndex: 0,
    long: (
      <>
        <p className="mb-3">
          La Baie Vitrée diffuse des <strong>courts-métrages indépendants</strong> en{" "}
          <strong>accès gratuit</strong>.
        </p>
        <p className="mb-3">
          L’objectif : donner de la visibilité aux œuvres, et permettre au public de soutenir la
          création via des <strong>dons volontaires</strong>.
        </p>
        <p className="opacity-90">
          Si vous avez un film (ou un making-of / bonus), vous pouvez nous le proposer ici.
        </p>
      </>
    ),
  },
  {
    id: "droits",
    title: "Cadre de diffusion",
    short: "Non exclusif, vous gardez vos droits.",
    colorIndex: 1,
    long: (
      <>
        <p className="mb-3">
          La diffusion sur La Baie Vitrée se fait via une autorisation{" "}
          <strong>non exclusive</strong>.
        </p>
        <ul className="list-disc list-inside space-y-1 opacity-90">
          <li>
            Vous conservez <strong>l’intégralité de vos droits</strong>
          </li>
          <li>
            Vous pouvez continuer à diffuser ailleurs (Vimeo, YouTube, festivals, plateformes…)
          </li>
          <li>
            La diffusion peut être <strong>retirée</strong> sur demande (selon les modalités du contrat)
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "dons",
    title: "Dons & répartition",
    short: "Don volontaire (pas un achat). Modèle 90/10.",
    colorIndex: 2,
    long: (
      <>
        <p className="mb-3">
          Les dons sont <strong>volontaires</strong> et versés à l’association via HelloAsso.
          Le don <strong>n’est pas un achat</strong> et ne conditionne pas l’accès aux films.
        </p>
        <p className="mb-3">
          Notre principe : <strong>90%</strong> des dons pour les <strong>ayants droits</strong>,{" "}
          <strong>10%</strong> pour faire vivre la plateforme.
        </p>
        <p className="text-xs opacity-70">
          La répartition est effectuée en “montant net” (montant encaissé, hors remboursements/impayés et frais techniques).
        </p>
      </>
    ),
  },
  {
    id: "process",
    title: "Process",
    short: "Envoi → validation → contrat → mise en ligne.",
    colorIndex: 3,
    long: (
      <>
        <ol className="list-decimal list-inside space-y-2 opacity-90">
          <li>
            Vous remplissez le formulaire (film + lien + infos de droits).
          </li>
          <li>
            On visionne et on vérifie la <strong>chaîne de droits</strong>.
          </li>
          <li>
            On vous envoie une <strong>convention de diffusion non exclusive</strong>.
          </li>
          <li>
            Mise en ligne + création de la fiche film.
          </li>
        </ol>
        <p className="mt-3 text-sm opacity-85">
          On peut aussi intégrer des bonus (making-of, interviews) avec un code de suivi par projet.
        </p>
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

export default function Realisateurs() {
  const [activeId, setActiveId] = useState("pitch");

  const active = useMemo(
    () => TOPICS.find((t) => t.id === activeId) || TOPICS[0],
    [activeId]
  );

  const activeColor = COLORS[active.colorIndex];

  return (
    <div className="bg-black text-white min-h-[calc(100vh-4rem)]">
      {/* Header */}
      <section className="max-w-6xl mx-auto px-4 pt-10 pb-6">
        <h1 className="text-4xl md:text-5xl font-bold mb-3">
          Réalisateurs
        </h1>
        <p className="opacity-80 max-w-3xl">
          Proposez votre court-métrage (ou bonus) pour une diffusion{" "}
          <strong>gratuite</strong> et <strong>associative</strong>.  
          Nous vous recontactons pour valider la diffusion et vous envoyer la convention.
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

          {/* Panneau détails + Form */}
          <div
            className="lg:col-span-2 border bg-black/40 p-6 md:p-8 transition-colors"
            style={{ borderColor: activeColor }}
          >
            <div className="flex flex-col gap-6">
              {/* Détails */}
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

              {/* Formulaire */}
              <div className="border border-white/10 rounded-lg p-5 md:p-6 bg-black/30">
                <h3 className="text-xl font-semibold mb-4">
                  Proposer votre film
                </h3>

                <form
                  action="https://formspree.io/f/mzzjgwyd"
                  method="POST"
                  className="space-y-3"
                >
                  <input
                    type="text"
                    name="Nom"
                    placeholder="Votre nom / société"
                    required
                    className="w-full p-3 bg-black border border-white/15 rounded"
                  />
                  <input
                    type="email"
                    name="Email"
                    placeholder="Votre email"
                    required
                    className="w-full p-3 bg-black border border-white/15 rounded"
                  />
                  <input
                    type="text"
                    name="Titre"
                    placeholder="Titre du film"
                    className="w-full p-3 bg-black border border-white/15 rounded"
                  />
                  <input
                    type="text"
                    name="Lien"
                    placeholder="Lien Vimeo / Drive / autre"
                    className="w-full p-3 bg-black border border-white/15 rounded"
                  />
                  <textarea
                    name="Message"
                    placeholder="Présentez votre projet (synopsis, durée, sélections, ayants droits, etc.)"
                    rows={6}
                    className="w-full p-3 bg-black border border-white/15 rounded"
                  />

                  <button
                    type="submit"
                    className="px-6 py-3 bg-white text-black rounded-lg hover:bg-white/90 transition font-semibold"
                  >
                    Envoyer ma proposition
                  </button>
                </form>

                <p className="text-xs opacity-60 mt-4">
                  En envoyant ce formulaire, vous acceptez d’être recontacté pour la validation et la signature de la convention.
                </p>
              </div>

              {/* Petit renvoi */}
              <div className="text-xs opacity-60">
                Vous avez une question avant d’envoyer ? Écrivez-nous dans le message, ou passez par{" "}
                <span className="font-semibold">À propos</span>.
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
