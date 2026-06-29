import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

function slugify(text) {
  return String(text || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export default function AdminEditoEdit() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState(null);
  const [films, setFilms] = useState([]);
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadData() {
      const [{ data: editoData, error: editoError }, { data: filmsData }] =
        await Promise.all([
          supabase.from("editos").select("*").eq("id", id).single(),
          supabase
            .from("films")
            .select("id, titre")
            .order("titre", { ascending: true }),
        ]);

      if (editoError) {
        navigate("/admin/editos");
        return;
      }

      setForm(editoData);
      setFilms(filmsData || []);
      setLoading(false);
    }

    loadData();
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
    setMessage("");

    let imageUrl = form.image_url || "";

    if (image) {
      const fileExt = image.name.split(".").pop();
      const fileName = `${Date.now()}-${slugify(form.titre)}.${fileExt}`;
      const filePath = `images/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("editos")
        .upload(filePath, image);

      if (uploadError) {
        setMessage("Erreur upload image : " + uploadError.message);
        setSaving(false);
        return;
      }

      const { data } = supabase.storage.from("editos").getPublicUrl(filePath);
      imageUrl = data.publicUrl;
    }

    const { error } = await supabase
      .from("editos")
      .update({
        titre: form.titre,
        texte: form.texte,
        url: form.url,
        status: form.status,
        poids: Number(form.poids) || 0,
        film_id: form.film_id || null,
        image_url: imageUrl,
        is_published: form.is_published,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    setSaving(false);

    if (error) {
      setMessage("Erreur modification édito : " + error.message);
      return;
    }

    navigate("/admin/editos");
  };

  if (loading || !form) {
    return (
      <main className="min-h-screen bg-black px-6 py-16 text-white">
        Chargement de l’édito...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black px-6 py-16 text-white">
      <div className="mx-auto max-w-3xl">
        <button
          type="button"
          onClick={() => navigate("/admin/editos")}
          className="mb-8 text-sm text-white/50 transition hover:text-white"
        >
          ← Retour éditos
        </button>

        <h1 className="text-4xl font-bold">Modifier l’édito</h1>

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

          <div>
            <label className="mb-2 block text-sm text-white/60">Texte</label>
            <textarea
              rows={5}
              value={form.texte || ""}
              onChange={(e) => updateField("texte", e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 outline-none focus:border-white/40"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-white/60">
              Film associé
            </label>

            <select
              value={form.film_id || ""}
              onChange={(e) => updateField("film_id", e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 outline-none focus:border-white/40"
            >
              <option value="">Aucun film associé</option>

              {films.map((film) => (
                <option key={film.id} value={film.id}>
                  {film.titre}
                </option>
              ))}
            </select>

            <p className="mt-2 text-xs text-white/40">
              Si un film est associé, cet édito apparaîtra dans la page Fenêtre
              des personnes qui ont ouvert une fenêtre sur ce film.
            </p>
          </div>

          <div>
            <label className="mb-2 block text-sm text-white/60">
              Lien de destination
            </label>
            <input
              value={form.url || ""}
              onChange={(e) => updateField("url", e.target.value)}
              placeholder="/catalogue ou https://..."
              className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 outline-none focus:border-white/40"
            />
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm text-white/60">Statut</label>
              <input
                value={form.status || ""}
                onChange={(e) => updateField("status", e.target.value)}
                placeholder="ÉDITO, ACTU, APPEL..."
                className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 outline-none focus:border-white/40"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-white/60">Poids</label>
              <input
                type="number"
                value={form.poids || 0}
                onChange={(e) => updateField("poids", e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 outline-none focus:border-white/40"
              />
            </div>
          </div>

          {form.image_url && (
            <div>
              <p className="mb-2 text-sm text-white/60">Image actuelle</p>
              <img
                src={form.image_url}
                alt={form.titre}
                className="h-40 rounded-xl object-cover"
              />
            </div>
          )}

          <div>
            <label className="mb-2 block text-sm text-white/60">
              Remplacer l’image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImage(e.target.files?.[0] || null)}
              className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-sm"
            />
          </div>

          <label className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/40 p-4">
            <input
              type="checkbox"
              checked={!!form.is_published}
              onChange={(e) => updateField("is_published", e.target.checked)}
            />
            <span>Édito publié</span>
          </label>

          {message && (
            <p className="rounded-xl border border-red-400/30 bg-red-500/10 p-4 text-sm text-red-200">
              {message}
            </p>
          )}

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