import { Outlet, Link } from "react-router-dom";

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-black text-white font-sans">
      {/* ---- HEADER ---- */}
      <header className="flex justify-between items-center px-6 py-4 border-b border-white/10 bg-black/80 backdrop-blur-md sticky top-0 z-50">
        <Link to="/" className="text-xl font-bold tracking-wide">
          La Niche Studio
        </Link>

        <nav className="flex space-x-6 text-sm md:text-base">
          <Link to="/" className="hover:text-gray-300 transition-colors">
            Accueil
          </Link>
          <Link to="/nouveautes" className="hover:text-gray-300 transition-colors">
            Nouveautés
          </Link>
          <Link to="/catalogue" className="hover:text-gray-300 transition-colors">
            Catalogue
          </Link>
          <Link to="/soutenir" className="hover:text-gray-300 transition-colors">
            Soutenir
          </Link>
          <Link to="/apropos" className="hover:text-gray-300 transition-colors">
            À propos
          </Link>
          <Link
            to="/realisateurs"
            className="hover:text-gray-300 transition-colors font-semibold text-yellow-300"
          >
            Réalisateurs
          </Link>
        </nav>
      </header>

      {/* ---- CONTENU DES PAGES ---- */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* ---- FOOTER (légal + éditorial) ---- */}
      <footer className="border-t border-white/10 bg-black/80 px-4 py-6 text-xs md:text-sm">
        <div className="max-w-6xl mx-auto flex flex-col gap-4 text-center">

          {/* Ligne pédagogique */}
          <p className="opacity-90 leading-relaxed">
            Accès gratuit • Dons volontaires • Une partie des dons est reversée
            aux ayants droit <br className="hidden sm:block" />
            <Link
              to="/soutenir"
              className="underline underline-offset-2 hover:text-gray-300 transition"
            >
              Comprendre / Soutenir
            </Link>
          </p>

          {/* Liens légaux */}
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 opacity-75">
            <Link to="/cgu" className="hover:text-white transition">
              CGU
            </Link>
            <Link
              to="/mentions-legales"
              className="hover:text-white transition"
            >
              Mentions légales
            </Link>
            <Link to="/realisateurs" className="hover:text-white transition">
              Réalisateurs
            </Link>
            <Link to="/soutenir" className="hover:text-white transition">
              Soutenir
            </Link>
          </div>

          {/* Copyright */}
          <p className="opacity-60">
            © {new Date().getFullYear()} La Niche Studio — Association loi 1901
          </p>
        </div>
      </footer>
    </div>
  );
}
