import { useState } from "react";
import { Outlet, Link, NavLink } from "react-router-dom";

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  const navClass = ({ isActive }) =>
    `transition-colors ${
      isActive ? "text-yellow-300" : "text-white/85 hover:text-white"
    }`;

  return (
    <div className="min-h-screen flex flex-col bg-black text-white font-sans overflow-x-hidden">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-black/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-6">
          <Link
            to="/"
            onClick={closeMenu}
            className="text-sm font-bold tracking-[0.25em] uppercase text-white/90"
          >
            La Baie Vitrée
          </Link>

          {/* Menu desktop */}
          <nav className="hidden items-center space-x-6 text-sm md:flex">
            <NavLink to="/" className={navClass}>
              Accueil
            </NavLink>

            <NavLink to="/nouveautes" className={navClass}>
              Nouveautés
            </NavLink>

            <NavLink to="/catalogue" className={navClass}>
              Catalogue
            </NavLink>

            <NavLink to="/a-propos" className={navClass}>
              À propos
            </NavLink>

            <NavLink to="/fenetre" className={navClass}>
              Ma fenêtre
            </NavLink>

            <NavLink
              to="/participer"
              className={({ isActive }) =>
                `font-semibold transition-colors ${
                  isActive
                    ? "text-yellow-200"
                    : "text-yellow-300 hover:text-yellow-200"
                }`
              }
            >
              Participer
            </NavLink>
          </nav>

          {/* Bouton mobile */}
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden rounded-full border border-white/15 px-4 py-2 text-xs uppercase tracking-[0.2em] text-white/90"
            aria-label="Ouvrir le menu"
            aria-expanded={menuOpen}
          >
            {menuOpen ? "Fermer" : "Menu"}
          </button>
        </div>

        {/* Menu mobile */}
        {menuOpen && (
          <nav className="md:hidden border-t border-white/10 bg-black/95 px-4 py-5">
            <div className="flex flex-col gap-4 text-base">
              <NavLink to="/" onClick={closeMenu} className={navClass}>
                Accueil
              </NavLink>

              <NavLink
                to="/nouveautes"
                onClick={closeMenu}
                className={navClass}
              >
                Nouveautés
              </NavLink>

              <NavLink
                to="/catalogue"
                onClick={closeMenu}
                className={navClass}
              >
                Catalogue
              </NavLink>

              <NavLink
                to="/a-propos"
                onClick={closeMenu}
                className={navClass}
              >
                À propos
              </NavLink>

              <NavLink
                to="/fenetre"
                onClick={closeMenu}
                className={navClass}
              >
                Ma fenêtre
              </NavLink>

              <NavLink
                to="/participer"
                onClick={closeMenu}
                className="mt-2 rounded-full border border-yellow-300/40 px-5 py-3 text-center font-semibold text-yellow-300"
              >
                Participer
              </NavLink>
            </div>
          </nav>
        )}
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-white/10 bg-black/80 px-4 py-6 text-xs md:text-sm">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 text-center">
          <p className="mx-auto max-w-2xl opacity-90 leading-relaxed">
            Accès gratuit • Dons volontaires • Une partie des dons est reversée
            aux ayants droit
            <br className="hidden sm:block" />
            <Link
              to="/participer"
              className="ml-1 underline underline-offset-2 hover:text-gray-300 transition"
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