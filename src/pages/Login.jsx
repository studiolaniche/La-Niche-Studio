import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleLogin = async (event) => {
    event.preventDefault();

    setLoading(true);
    setMessage("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setMessage("Erreur : " + error.message);
      return;
    }

    navigate("/mon-espace");
  };

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-black px-6 py-24 text-white">
      <div className="mx-auto max-w-md rounded-3xl border border-white/10 bg-white/[0.04] p-8 shadow-2xl">
        <p className="mb-2 text-sm uppercase tracking-[0.3em] text-white/50">
          La Baie Vitrée
        </p>

        <h1 className="text-3xl font-bold">Connexion</h1>

        <p className="mt-3 text-sm leading-relaxed text-white/60">
          Connectez-vous pour accéder à votre espace réalisateur ou administrateur.
        </p>

        <form onSubmit={handleLogin} className="mt-8 space-y-5">
          <div>
            <label className="mb-2 block text-sm text-white/70">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none transition focus:border-white/40"
              placeholder="email@exemple.com"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-white/70">
              Mot de passe
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none transition focus:border-white/40"
              placeholder="••••••••"
            />
          </div>

          {message && (
            <p className="rounded-xl border border-white/10 bg-white/[0.04] p-3 text-sm text-white/70">
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-white px-4 py-3 font-semibold text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </form>
      </div>
    </main>
  );
}