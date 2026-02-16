import { Link, useNavigate } from "react-router-dom";
import Breadcrumb from "../components/Breadcrumb";

function InfoRow({ label, children }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-3">
      <div className="sm:w-44 text-white/60 text-sm">{label}</div>
      <div className="text-white/90">{children}</div>
    </div>
  );
}

export default function MentionsLegales() {
  const navigate = useNavigate();

  return (
    <main className="min-h-screen bg-black text-white">
      <Breadcrumb
        items={[
          { label: "Accueil", to: "/" },
          { label: "Mentions légales" },
        ]}
      />

      <section className="max-w-3xl mx-auto px-6 py-12">
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 md:p-10 shadow-lg backdrop-blur">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">
            Mentions légales
          </h1>

          <p className="text-sm text-white/60 mb-8">
            Dernière mise à jour : 26 décembre 2025
          </p>

          <div className="space-y-8 leading-relaxed">
            {/* Éditeur */}
            <section>
              <h2 className="text-lg font-semibold mb-3">Éditeur du site</h2>
              <div className="space-y-3">
                <InfoRow label="Nom">
                  <strong>LA NICHE STUDIO</strong> — Association loi 1901
                </InfoRow>
                <InfoRow label="Siège social">
                  46 rue Raspail, 38000 Grenoble, France
                </InfoRow>
                <InfoRow label="Email">
                  <a
                    href="mailto:studiolaniche@gmail.com"
                    className="underline underline-offset-4 hover:text-gray-300 transition"
                  >
                    studiolaniche@gmail.com
                  </a>
                </InfoRow>
                <InfoRow label="Site">
                  <a
                    href="https://laniche.studio"
                    target="_blank"
                    rel="noreferrer"
                    className="underline underline-offset-4 hover:text-gray-300 transition"
                  >
                    laniche.studio
                  </a>
                </InfoRow>
              </div>
            </section>

            {/* Directeur de publication */}
            <section>
              <h2 className="text-lg font-semibold mb-3">
                Directeur / Directrice de la publication
              </h2>
              <div className="bg-black/30 border border-white/10 rounded-lg p-4 text-sm text-white/80">
                À compléter : <strong>[Nom et prénom]</strong>,{" "}
                <strong>[fonction]</strong>
              </div>
            </section>

            {/* Hébergement */}
            <section>
              <h2 className="text-lg font-semibold mb-3">Hébergement</h2>
              <div className="bg-black/30 border border-white/10 rounded-lg p-4 space-y-2 text-sm text-white/85">
                <div>
                  Hébergeur : <strong>[Nom de l’hébergeur]</strong>
                </div>
                <div>
                  Adresse : <strong>[Adresse]</strong>
                </div>
                <div>
                  Téléphone : <strong>[Téléphone]</strong>
                </div>
                <div className="text-white/60">
                  (Remplace ces champs par les infos exactes : Vercel / Netlify /
                  OVH / etc.)
                </div>
              </div>
            </section>

            {/* Vidéo */}
            <section>
              <h2 className="text-lg font-semibold mb-3">
                Hébergement vidéo (tiers)
              </h2>
              <p className="text-white/85">
                Les œuvres sont diffusées via un service tiers d’hébergement vidéo
                (ex. Vimeo). Des interruptions ou limitations techniques peuvent
                dépendre de ce service tiers.
              </p>
            </section>

            {/* Gratuité & dons */}
            <section>
              <h2 className="text-lg font-semibold mb-3">
                Accès gratuit & dons volontaires
              </h2>
              <p className="text-white/85">
                L’accès aux œuvres sur la plateforme est <strong>entièrement gratuit</strong>.
              </p>
              <p className="text-white/85 mt-2">
                Les utilisateurs peuvent soutenir l’association par des{" "}
                <strong>dons volontaires</strong>. Les dons sont facultatifs, sans
                contrepartie, et <strong>ne constituent pas un achat</strong>.
              </p>
              <p className="text-white/60 text-sm mt-2">
                Pour plus de détails :{" "}
                <Link
                  to="/cgu"
                  className="underline underline-offset-4 hover:text-gray-300 transition"
                >
                  consulter les CGU
                </Link>
                .
              </p>
            </section>

            {/* Propriété intellectuelle */}
            <section>
              <h2 className="text-lg font-semibold mb-3">Propriété intellectuelle</h2>
              <p className="text-white/85">
                Les œuvres audiovisuelles diffusées sur la plateforme restent la
                propriété exclusive de leurs ayants droit. Toute reproduction,
                représentation, extraction, téléchargement, diffusion ou
                exploitation des œuvres en dehors de la plateforme est interdite
                sans autorisation préalable des ayants droit.
              </p>
              <p className="text-white/85 mt-2">
                Les éléments du site (nom, logo, textes, design, éléments
                graphiques, etc.) sont protégés et ne peuvent être réutilisés sans
                autorisation.
              </p>
            </section>

            {/* Signalement */}
            <section>
              <h2 className="text-lg font-semibold mb-3">Signalement & retrait</h2>
              <p className="text-white/85">
                Tout ayant droit estimant qu’un contenu porte atteinte à ses droits
                peut demander son retrait en écrivant à :{" "}
                <a
                  href="mailto:studiolaniche@gmail.com"
                  className="underline underline-offset-4 hover:text-gray-300 transition"
                >
                  studiolaniche@gmail.com
                </a>
                .
              </p>
            </section>

            {/* Données */}
            <section>
              <h2 className="text-lg font-semibold mb-3">Données personnelles</h2>
              <p className="text-white/85">
                La plateforme collecte un minimum de données personnelles,
                strictement nécessaires à son fonctionnement. Aucune donnée n’est
                vendue ni cédée à des tiers.
              </p>
              <p className="text-white/85 mt-2">
                Pour toute demande (accès, rectification, suppression), écris à :{" "}
                <a
                  href="mailto:studiolaniche@gmail.com"
                  className="underline underline-offset-4 hover:text-gray-300 transition"
                >
                  studiolaniche@gmail.com
                </a>
                .
              </p>
            </section>

            {/* Responsabilité */}
            <section>
              <h2 className="text-lg font-semibold mb-3">Responsabilité</h2>
              <p className="text-white/85">
                L’association met en œuvre les moyens raisonnables pour assurer
                l’accès au site. Elle ne saurait être tenue responsable des
                interruptions, erreurs, ou dommages résultant de l’utilisation du
                site, notamment en cas de défaillance technique d’un service tiers.
              </p>
            </section>

            {/* Droit applicable */}
            <section>
              <h2 className="text-lg font-semibold mb-3">Droit applicable</h2>
              <p className="text-white/85">
                Les présentes mentions légales sont soumises au droit français.
              </p>
            </section>
          </div>

          {/* 🔙 Boutons bas de page */}
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
