import { Outlet, Link } from "react-router-dom";

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-black text-white font-sans">
      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-white/10 bg-black/80 px-6 py-4 backdrop-blur-md">
        <Link to="/" className="text-xl font-bold tracking-wide">
          
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

          <Link to="/a-propos" className="hover:text-gray-300 transition-colors">
            À propos
          </Link>
          <Link to="/fenetre">
            Ma fenêtre
          </Link>
          <Link
            to="/participer"
            className="font-semibold text-yellow-300 hover:text-yellow-200 transition-colors"
          >
            Participer
          </Link>
        </nav>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-white/10 bg-black/80 px-4 py-6 text-xs md:text-sm">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 text-center">
          <p className="opacity-90 leading-relaxed">
            Accès gratuit • Dons volontaires • Une partie des dons est reversée
            aux ayants droit <br className="hidden sm:block" />
            <Link
              to="/participer"
              className="underline underline-offset-2 hover:text-gray-300 transition"
            >
              Comprendre / Participer
            </Link>
          </p>

          <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 opacity-75">
            <Link to="/cgu" className="hover:text-white transition">
              CGU
            </Link>

            <Link to="/mentions-legales" className="hover:text-white transition">
              Mentions légales
            </Link>

            <Link to="/a-propos" className="hover:text-white transition">
              À propos
            </Link>

            <Link to="/participer" className="hover:text-white transition">
              Participer
            </Link>
          </div>

          <p className="opacity-60">
            © {new Date().getFullYear()} La Niche Studio — Association loi 1901
          </p>
        </div>
      </footer>
    </div>
  );
}