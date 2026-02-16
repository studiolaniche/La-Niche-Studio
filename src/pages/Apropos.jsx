import CountUp from "react-countup";
import { Link } from "react-router-dom";

export default function Apropos() {
  return (
    <div className="bg-black text-white">
      {/* Hero */}
      <section className="relative h-[80vh] flex items-center justify-center text-center bg-[url('/photos/phototournagegum1.jpg')] bg-cover bg-center">
        <div className="bg-black/60 absolute inset-0"></div>
        <div className="relative z-10 px-4">
          <h1 className="text-5xl font-bold mb-4">La Niche Studio</h1>
          <p className="max-w-2xl mx-auto text-lg opacity-90">
            Une association loi 1901 engagée pour la création indépendante et la
            diffusion libre des courts-métrages.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/catalogue" className="px-5 py-2 bg-white text-black rounded">
              Découvrir les films
            </Link>
            <Link to="/soutenir" className="px-5 py-2 border border-white rounded">
              Soutenir le projet
            </Link>
            <Link to="/realisateurs" className="px-5 py-2 bg-black/30 border border-white/60 rounded">
              Proposer un film
            </Link>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="max-w-5xl mx-auto py-20 px-4 text-center">
        <h2 className="text-3xl font-semibold mb-4">Notre mission</h2>
        <p className="opacity-80 leading-relaxed max-w-3xl mx-auto">
          La Niche Studio accompagne et valorise des projets de courts-métrages
          indépendants, en favorisant l’accès libre aux œuvres, la solidarité
          entre créateurs et le soutien direct aux auteurs.
        </p>
      </section>

      {/* La Baie Vitrée */}
      <section className="bg-white/5 py-20 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl font-semibold mb-4">La Baie Vitrée</h2>
          <p className="opacity-85 max-w-3xl mx-auto">
            La Baie Vitrée est la plateforme de streaming associative de La Niche
            Studio, dédiée aux courts-métrages indépendants de la région de
            Grenoble.
          </p>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div className="p-6 border border-white/15 rounded-lg">
              <h3 className="font-semibold mb-2">🎬 Accès gratuit</h3>
              <p className="opacity-80">
                Tous les films sont accessibles librement, sans abonnement.
              </p>
            </div>
            <div className="p-6 border border-white/15 rounded-lg">
              <h3 className="font-semibold mb-2">❤️ Dons volontaires</h3>
              <p className="opacity-80">
                Le public peut soutenir la création via des dons, sans
                contrepartie obligatoire.
              </p>
            </div>
            <div className="p-6 border border-white/15 rounded-lg">
              <h3 className="font-semibold mb-2">🔁 Répartition 90 / 10</h3>
              <p className="opacity-80">
                90 % des dons soutiennent les ayants droits, 10 % assurent le
                fonctionnement de la plateforme.
              </p>
            </div>
          </div>

          <p className="mt-6 text-sm opacity-75 max-w-3xl mx-auto">
            Les dons soutiennent la création : ce n’est pas un achat, et l’accès
            aux films reste gratuit.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center px-4">
          <div>
            <div className="text-4xl font-bold">
              <CountUp end={524} duration={3} suffix=" h" />
            </div>
            <p className="opacity-70">Temps de visionnage</p>
          </div>
          <div>
            <div className="text-4xl font-bold">
              <CountUp end={12} duration={3} />
            </div>
            <p className="opacity-70">Membres actifs</p>
          </div>
          <div>
            <div className="text-4xl font-bold">
              <CountUp end={6} duration={3} />
            </div>
            <p className="opacity-70">Tournages 2024</p>
          </div>
          <div>
            <div className="text-4xl font-bold">
              <CountUp end={5500} duration={3} suffix=" €" />
            </div>
            <p className="opacity-70">Dons récoltés</p>
          </div>
        </div>
      </section>
    </div>
  );
}
