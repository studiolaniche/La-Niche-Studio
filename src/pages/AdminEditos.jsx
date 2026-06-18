import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

export default function AdminEditos() {
  const navigate = useNavigate();

  const [editos, setEditos] = useState([]);
  const [loading, setLoading] = useState(true);

  async function loadEditos() {
    const { data, error } = await supabase
      .from("editos")
      .select("*")
      .order("poids", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Erreur éditos :", error);
      setEditos([]);
    } else {
      setEditos(data || []);
    }

    setLoading(false);
  }

  useEffect(() => {
    async function checkAccess() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        navigate("/login");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (!profile || !["admin", "communication"].includes(profile.role)) {
        navigate("/login");
        return;
      }

      loadEditos();
    }

    checkAccess();
  }, [navigate]);

  const togglePublish = async (edito) => {
    const { error } = await supabase
      .from("editos")
      .update({
        is_published: !edito.is_published,
        updated_at: new Date().toISOString(),
      })
      .eq("id", edito.id);

    if (error) {
      alert("Erreur : " + error.message);
      return;
    }

    loadEditos();
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-black px-6 py-16 text-white">
        Chargement des éditos...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black px-6 py-16 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-white/40">
              Administration
            </p>
            <h1 className="mt-2 text-4xl font-bold">Éditos</h1>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              to="/admin"
              className="rounded-full border border-white/20 px-5 py-3 text-sm transition hover:bg-white/10"
            >
              ← Retour admin
            </Link>

            <Link
              to="/admin/editos/new"
              className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-white/90"
            >
              + Nouvel édito
            </Link>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
          {editos.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/15 p-10 text-center text-white/50">
              Aucun édito pour le moment.
            </div>
          ) : (
            <div className="space-y-4">
              {editos.map((edito) => (
                <div
                  key={edito.id}
                  className="grid gap-4 rounded-2xl border border-white/10 bg-black/30 p-4 md:grid-cols-[120px_1fr_auto]"
                >
                  <div className="h-24 w-28 overflow-hidden rounded-xl bg-white/10">
                    {edito.image_url && (
                      <img
                        src={edito.image_url}
                        alt={edito.titre}
                        className="h-full w-full object-cover"
                      />
                    )}
                  </div>

                  <div>
                    <h3 className="font-semibold text-lg">{edito.titre}</h3>

                    <p className="mt-1 line-clamp-2 text-sm text-white/55">
                      {edito.texte}
                    </p>

                    <p className="mt-2 text-xs text-white/40">
                      Poids : {edito.poids || 0} ·{" "}
                      {edito.is_published ? "Publié" : "Brouillon"}
                    </p>
                  </div>

                  <div className="flex flex-col gap-2 md:items-end">
                    <button
                      type="button"
                      onClick={() => togglePublish(edito)}
                      className="rounded-full border border-white/20 px-4 py-2 text-sm transition hover:bg-white/10"
                    >
                      {edito.is_published ? "Dépublier" : "Publier"}
                    </button>

                    <Link
                      to={`/admin/editos/${edito.id}/edit`}
                      className="rounded-full border border-white/20 px-4 py-2 text-sm transition hover:bg-white/10"
                    >
                      Modifier
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}