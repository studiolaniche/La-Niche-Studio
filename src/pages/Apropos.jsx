import CountUp from "react-countup";
import { Link } from "react-router-dom";

export default function Apropos() {
  return (
    <div className="bg-black text-white">
      {/* Hero */}
      <section className="relative h-[80vh] flex flex-col items-center justify-center text-center bg-[url('/photos/phototournagegum1.jpg')] bg-cover bg-center">
        <div className="bg-black/60 absolute inset-0"></div>
        <div className="relative z-10 px-4">
          <h1 className="text-5xl font-bold mb-4">La Niche Studio</h1>
          <p className="max-w-2xl mx-auto text-lg opacity-90">
            Une association loi 1901 qui soutient la création indépendante et
            rend les courts-métrages accessibles au plus grand nombre.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              to="/catalogue"
              className="px-5 py-2 bg-white text-black rounded hover:bg-white/90 transition text-sm md:text-base"
            >
              Découvrir les films
            </Link>
            <Link
              to="/soutenir"
              className="px-5 py-2 border border-white text-white rounded hover:bg-white/10 transition text-sm md:text-base"
            >
              Soutenir le projet
            </Link>
            <Link
              to="/realisateurs"
              className="px-5 py-2 bg-black/30 border border-white/60 text-white rounded hover:bg-black/40 transition text-sm md:text-base"
            >
              Diffuser mon film
            </Link>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="max-w-5xl mx-auto py-20 px-4 text-center">
        <h2 className="text-3xl font-semibold mb-4">Notre mission</h2>
        <p className="opacity-80 leading-relaxed max-w-3xl mx-auto">
          La Niche Studio accompagne des créateurs de courts-métrages et des
          projets indépendants. Nous produisons, diffusons et soutenons des
          œuvres portées par la collaboration, l’entraide et la passion du
          cinéma.
        </p>
      </section>

      {/* La Baie Vitrée / Modèle (bloc clé) */}
      <section className="bg-white/5 py-20 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl font-semibold mb-4">La Baie Vitrée</h2>
          <p className="opacity-85 leading-relaxed max-w-3xl mx-auto">
            La Baie Vitrée est notre plateforme associative de diffusion gratuite
            de courts-métrages indépendants (région de Grenoble).
          </p>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div className="p-6 border border-white/15 rounded-lg">
              <p className="text-lg font-semibold mb-2">🎬 Accès gratuit</p>
              <p className="opacity-80 leading-relaxed">
                Tous les films sont accessibles librement, sans abonnement et
                sans paywall.
              </p>
            </div>

            <div className="p-6 border border-white/15 rounded-lg">
              <p className="text-lg font-semibold mb-2">❤️ Dons volontaires</p>
              <p className="opacity-80 leading-relaxed">
                Le public peut soutenir le projet via HelloAsso. Les dons
                permettent de soutenir la création et de faire vivre la
                plateforme.
              </p>
            </div>

            <div className="p-6 border border-white/15 rounded-lg">
              <p className="text-lg font-semibold mb-2">🔁 Partage transparent</p>
              <p className="opacity-80 leading-relaxed">
                Une partie des dons est reversée aux ayants droits des films
                diffusés, l’autre couvre les frais de fonctionnement (hébergement,
                développement, communication).
              </p>
            </div>
          </div>

          <p className="mt-6 text-sm opacity-75 max-w-3xl mx-auto">
            Les dons soutiennent la création : <span className="font-medium">ce n’est pas un achat</span>,
            et l’accès aux films reste gratuit pour toutes et tous.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              to="/soutenir"
              className="px-6 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition"
            >
              Faire un don
            </Link>
            <Link
              to="/catalogue"
              className="px-6 py-3 border border-white text-white rounded-lg hover:bg-white/10 transition"
            >
              Voir le catalogue
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center px-4">
          <div className="p-4 rounded-lg border border-white/10">
            <div className="text-4xl font-bold">
              <CountUp end={524} duration={3} suffix=" h" />
            </div>
            <p className="opacity-70 mt-1">Temps de visionnage</p>
          </div>
          <div className="p-4 rounded-lg border border-white/10">
            <div className="text-4xl font-bold">
              <CountUp end={12} duration={3} />
            </div>
            <p className="opacity-70 mt-1">Membres actifs</p>
          </div>
          <div className="p-4 rounded-lg border border-white/10">
            <div className="text-4xl font-bold">
              <CountUp end={6} duration={3} />
            </div>
            <p className="opacity-70 mt-1">Tournages 2024</p>
          </div>
          <div className="p-4 rounded-lg border border-white/10">
            <div className="text-4xl font-bold">
              <CountUp end={5500} duration={3} suffix=" €" />
            </div>
            <p className="opacity-70 mt-1">Dons récoltés</p>
          </div>
        </div>

        <p className="text-center text-xs opacity-60 mt-6 px-4">
          Chiffres indicatifs, mis à jour selon nos bilans internes.
        </p>
      </section>

      {/* Timeline */}
      <section className="max-w-5xl mx-auto py-20 px-4">
        <h2 className="text-3xl font-semibold mb-8 text-center">Notre histoire</h2>
        <div className="space-y-8 border-l-2 border-white/20 pl-8">
          <div>
            <h3 className="text-xl font-bold">2023 — Fondation</h3>
            <p className="opacity-80">
              Lancement de La Niche Studio et premiers projets pilotes.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-bold">2024 — Expansion</h3>
            <p className="opacity-80">
              Développement du réseau, premières avant-premières et diffusion
              renforcée des courts-métrages.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-bold">2025 — Structuration</h3>
            <p className="opacity-80">
              Consolidation de la plateforme, nouveaux partenariats et montée en
              puissance des projets.
            </p>
          </div>
        </div>
      </section>

      {/* Galerie photo */}
      <section className="bg-white/5 py-20 px-4">
        <h2 className="text-3xl font-semibold mb-8 text-center">En images</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-w-5xl mx-auto">
          <img
            src="/photos/phototournagegum1.jpg"
            className="object-cover w-full h-64 rounded-lg"
            alt="Tournage La Niche Studio 1"
            loading="lazy"
            decoding="async"
          />
          <img
            src="/photos/phototournagegum2.jpg"
            className="object-cover w-full h-64 rounded-lg"
            alt="Tournage La Niche Studio 2"
            loading="lazy"
            decoding="async"
          />
          <img
            src="/photos/phototournageopium1.jpg"
            className="object-cover w-full h-64 rounded-lg"
            alt="Tournage La Niche Studio 3"
            loading="lazy"
            decoding="async"
          />
        </div>
      </section>
    </div>
  );
}
