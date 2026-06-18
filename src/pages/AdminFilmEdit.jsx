import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

function slugify(text) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export default function AdminFilmEdit() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState(null);
  const [miniature, setMiniature] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadFilm() {
      const { data, error } = await supabase
        .from("films")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error(error);
        navigate("/admin");
        return;
      }

      setForm(data);
      setLoading(false);
    }

    loadFilm();
  }, [id, navigate]);

  const updateField = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);

    let miniatureUrl = form.miniature_url || "";

    if (miniature) {
      const fileExt = miniature.name.split(".").pop();
      const fileName = `${Date.now()}-${slugify(form.titre)}.${fileExt}`;
      const filePath = `films/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("posters")
        .upload(filePath, miniature);

      if (uploadError) {
        alert("Erreur upload miniature : " + uploadError.message);
        setSaving(false);
        return;
      }

      const { data } = supabase.storage.from("posters").getPublicUrl(filePath);
      miniatureUrl = data.publicUrl;
    }

    const { error } = await supabase
      .from("films")
      .update({
        titre: form.titre,
        nom_du_film: form.titre,
        slug: slugify(form.titre),
        annee: form.annee ? Number(form.annee) : null,
        realisateur_1: form.realisateur_1,
        realisateur_2: form.realisateur_2,
        genre: form.genre,
        duree: form.duree,
        synopsis: form.synopsis,
        vimeo_id: form.vimeo_id,
        miniature_url: miniatureUrl,
        is_published: form.is_published,
        validation_status: form.is_published ? "approved" : "draft",
        valide: form.is_published,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    setSaving(false);

    if (error) {
      alert("Erreur modification : " + error.message);
      return;
    }

    navigate("/admin");
  };

  if (loading || !form) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        Chargement du film...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black px-6 py-16 text-white">
      <div className="mx-auto max-w-3xl">
        <button
          onClick={() => navigate("/admin")}
          className="mb-8 text-sm text-white/50 transition hover:text-white"
        >
          ← Retour admin
        </button>

        <h1 className="text-4xl font-bold">Modifier le film</h1>

        <form
          onSubmit={handleSubmit}
          className="mt-10 space-y-6 rounded-3xl border border-white/10 bg-white/[0.04] p-6"
        >
          <div>
            <label className="mb-2 block text-sm text-white/60">Titre</label>
            <input
              required
              value={form.titre || ""}
              onChange={(e) => updateField("titre", e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 outline-none focus:border-white/40"
            />
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm text-white/60">Année</label>
              <input
                type="number"
                value={form.annee || ""}
                onChange={(e) => updateField("annee", e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 outline-none focus:border-white/40"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-white/60">Durée</label>
              <input
                value={form.duree || ""}
                onChange={(e) => updateField("duree", e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 outline-none focus:border-white/40"
              />
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm text-white/60">
                Réalisateur 1
              </label>
              <input
                value={form.realisateur_1 || ""}
                onChange={(e) => updateField("realisateur_1", e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 outline-none focus:border-white/40"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-white/60">
                Réalisateur 2
              </label>
              <input
                value={form.realisateur_2 || ""}
                onChange={(e) => updateField("realisateur_2", e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 outline-none focus:border-white/40"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm text-white/60">Genre</label>
            <input
              value={form.genre || ""}
              onChange={(e) => updateField("genre", e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 outline-none focus:border-white/40"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-white/60">ID Vimeo</label>
            <input
              value={form.vimeo_id || ""}
              onChange={(e) => updateField("vimeo_id", e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 outline-none focus:border-white/40"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-white/60">Synopsis</label>
            <textarea
              rows={5}
              value={form.synopsis || ""}
              onChange={(e) => updateField("synopsis", e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 outline-none focus:border-white/40"
            />
          </div>

          {form.miniature_url && (
            <div>
              <p className="mb-2 text-sm text-white/60">Miniature actuelle</p>
              <img
                src={form.miniature_url}
                alt={form.titre}
                className="h-40 rounded-xl object-cover"
              />
            </div>
          )}

          <div>
            <label className="mb-2 block text-sm text-white/60">
              Remplacer la miniature
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setMiniature(e.target.files?.[0] || null)}
              className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-sm"
            />
          </div>

          <label className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/40 p-4">
            <input
              type="checkbox"
              checked={!!form.is_published}
              onChange={(e) => updateField("is_published", e.target.checked)}
            />
            <span>Film publié</span>
          </label>

          <button
            disabled={saving}
            className="w-full rounded-xl bg-white px-5 py-3 font-semibold text-black transition hover:bg-white/90 disabled:opacity-50"
          >
            {saving ? "Enregistrement..." : "Enregistrer les modifications"}
          </button>
        </form>
      </div>
    </main>
  );
}