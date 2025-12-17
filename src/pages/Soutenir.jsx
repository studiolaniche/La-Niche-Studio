export default function Soutenir() {
  return (
    <section className="max-w-4xl mx-auto px-4 py-20 text-center">
      <h1 className="text-4xl md:text-5xl font-bold mb-6">
        Soutenir les films, simplement
      </h1>

      <p className="opacity-90 text-lg mb-6">
        La Baie Vitrée est une plateforme associative de diffusion gratuite de
        courts-métrages indépendants, portée par{" "}
        <span className="font-medium">La Niche Studio</span> (association loi
        1901).
      </p>

      <div className="text-base md:text-lg opacity-85 mb-8 leading-relaxed max-w-3xl mx-auto">
        <p className="mb-3">
          🎬 Tous les films sont accessibles <strong>gratuitement</strong>, sans
          abonnement.
        </p>
        <p className="mb-3">
          ❤️ Si vous le souhaitez, vous pouvez faire un{" "}
          <strong>don volontaire</strong> via HelloAsso.
        </p>
        <p className="mb-3">
          🔁 Une partie des dons est <strong>reversée aux ayants droits</strong>{" "}
          des films diffusés, l’autre permet d’assurer le fonctionnement de la
          plateforme (hébergement, développement, communication).
        </p>
        <p className="mt-4 text-sm opacity-80">
          Les dons soutiennent la création : <strong>ce n’est pas un achat</strong>
          , et l’accès aux films reste libre pour toutes et tous.
        </p>
      </div>

      {/* Bouton HelloAsso */}
      <a
        href="https://www.helloasso.com/associations/la-niche-studio/formulaires/2"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block px-8 py-4 bg-pink-600 text-white rounded-lg text-lg font-medium hover:bg-pink-700 transition"
      >
        Faire un don sur HelloAsso
      </a>

      {/* Encadré transparence */}
      <div className="mt-12 p-6 border border-white/20 rounded-lg text-sm opacity-85 max-w-3xl mx-auto">
        <p className="mb-2 font-medium">🔍 Transparence</p>
        <p>
          La répartition des dons est définie à l’avance et communiquée aux ayants
          droits. La Baie Vitrée ne vend pas les films, n’affiche pas de publicité
          et ne conditionne jamais le soutien au nombre de vues.
        </p>
      </div>
    </section>
  );
}
