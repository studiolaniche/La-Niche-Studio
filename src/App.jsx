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
          <Link
            to="/nouveautes"
            className="hover:text-gray-300 transition-colors"
          >
            Nouveautés
          </Link>
          <Link
            to="/catalogue"
            className="hover:text-gray-300 transition-colors"
          >
            Catalogue
          </Link>
          <Link
            to="/soutenir"
            className="hover:text-gray-300 transition-colors"
          >
            Soutenir
          </Link>
          <Link
            to="/apropos"
            className="hover:text-gray-300 transition-colors"
          >
            À propos
          </Link>
          {/* 🔥 NOUVEAU : lien vers la page Réalisateurs */}
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

      {/* ---- FOOTER ---- */}
      <footer className="text-center text-xs md:text-sm p-4 border-t border-white/10 bg-black/80">
  <div className="opacity-90">
    Accès gratuit • Dons volontaires • Une partie reversée aux ayants droits
    <Link to="/soutenir" className="underline ml-2 hover:text-gray-300">
      Comprendre / Soutenir
    </Link>
  </div>
  <div className="mt-2 opacity-70">
    © {new Date().getFullYear()} La Niche Studio — Association loi 1901
  </div>
</footer>
    </div>
  );
}
