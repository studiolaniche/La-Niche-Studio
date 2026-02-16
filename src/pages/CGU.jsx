import { Link, useNavigate } from "react-router-dom";
import Breadcrumb from "../components/Breadcrumb";

export default function CGU() {
  const navigate = useNavigate();

  return (
    <main className="min-h-screen bg-black text-white">
      <Breadcrumb
        items={[
          { label: "Accueil", to: "/" },
          { label: "Conditions Générales d’Utilisation" },
        ]}
      />

      <section className="max-w-3xl mx-auto px-6 py-12">
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 md:p-10 shadow-lg backdrop-blur">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">
            Conditions Générales d’Utilisation
          </h1>

          <p className="text-sm text-white/60 mb-8">
            Dernière mise à jour : 26 décembre 2025
          </p>

          <div className="space-y-8 text-white/90 leading-relaxed">

            <section>
              <h2 className="text-lg font-semibold mb-2">1. Objet de la plateforme</h2>
              <p>
                La Baie Vitrée est une plateforme gérée par l'Associon La Niche Studio à but non lucratif
                dédiée à la diffusion d’œuvres audiovisuelles dans un cadre
                culturel, associatif et non commercial.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-2">2. Accès aux œuvres</h2>
              <p>
                L’accès aux œuvres est entièrement gratuit. Aucun paiement ni
                inscription obligatoire n’est requis.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-2">
                3. Dons volontaires – Absence d’achat
              </h2>
              <p>
                Les dons sont facultatifs, sans contrepartie, et ne conditionnent
                en aucun cas l’accès ou le visionnage des œuvres.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-2">
                4. Dispositif de soutien associatif
              </h2>
              <p>
                Les dons soutiennent le fonctionnement de la plateforme et, dans
                la mesure du possible, la création indépendante.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-2">
                5. Absence de lien entre dons et œuvres
              </h2>
              <p>
                Les dons ne sont pas individualisés par œuvre et ne sont pas liés
                au nombre de vues.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-2">
                6. Absence de garantie financière
              </h2>
              <p>
                Aucune rémunération minimale, automatique ou garantie n’est
                promise.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-2">
                7. Propriété intellectuelle
              </h2>
              <p>
                Les œuvres restent la propriété exclusive de leurs ayants droit.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-2">
                8. Droit applicable
              </h2>
              <p>Les présentes CGU sont soumises au droit français.</p>
            </section>

          </div>

          <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-between items-center border-t border-white/10 pt-6">
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 rounded border border-white/30 hover:bg-white/10 transition text-sm"
            >
              ← Retour
            </button>

            <Link
              to="/"
              className="text-sm underline underline-offset-4 hover:text-gray-300 transition"
            >
              Retour à l’accueil
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
