import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

const IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

function slugify(text) {
  return String(text || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

function getFileExtension(file) {
  const extension = file?.name?.split(".").pop();

  return extension
    ? extension.toLowerCase()
    : "jpg";
}

function validateImage(file, label) {
  if (!file) {
    return null;
  }

  if (!IMAGE_TYPES.includes(file.type)) {
    return `${label} : utilise une image JPEG, PNG ou WebP.`;
  }

  if (file.size > MAX_IMAGE_SIZE) {
    return `${label} : l’image ne doit pas dépasser 5 Mo.`;
  }

  return null;
}

async function uploadImage({
  file,
  filmTitle,
  suffix,
}) {
  if (!file) {
    return "";
  }

  const safeTitle = slugify(filmTitle) || "film";
  const extension = getFileExtension(file);

  const uniquePart = `${Date.now()}-${crypto.randomUUID()}`;
  const fileName = `${safeTitle}-${suffix}-${uniquePart}.${extension}`;
  const filePath = `films/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from("posters")
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type || undefined,
    });

  if (uploadError) {
    throw new Error(uploadError.message);
  }

  const { data } = supabase.storage
    .from("posters")
    .getPublicUrl(filePath);

  if (!data?.publicUrl) {
    throw new Error(
      "Impossible de récupérer l’URL publique de l’image."
    );
  }

  return data.publicUrl;
}

export default function AdminFilmEdit() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState(null);

  const [miniature, setMiniature] = useState(null);
  const [heroImage, setHeroImage] = useState(null);

  const [miniaturePreview, setMiniaturePreview] = useState("");
  const [heroImagePreview, setHeroImagePreview] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadFilm() {
      setLoading(true);
      setMessage("");

      const { data, error } = await supabase
        .from("films")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Erreur chargement film :", error);

        if (!cancelled) {
          setMessage(
            `Impossible de charger le film : ${error.message}`
          );
          setLoading(false);
        }

        return;
      }

      if (!cancelled) {
        setForm({
          ...data,
          titre: data.titre || "",
          annee: data.annee || "",
          realisateur_1: data.realisateur_1 || "",
          realisateur_2: data.realisateur_2 || "",
          genre: data.genre || "",
          duree: data.duree || "",
          synopsis: data.synopsis || "",
          vimeo_id: data.vimeo_id || "",
          miniature_url: data.miniature_url || "",
          hero_image_url: data.hero_image_url || "",
          featured: Boolean(data.featured),
          is_published: Boolean(data.is_published),
        });

        setLoading(false);
      }
    }

    loadFilm();

    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    if (!miniature) {
      setMiniaturePreview("");
      return;
    }

    const previewUrl = URL.createObjectURL(miniature);
    setMiniaturePreview(previewUrl);

    return () => {
      URL.revokeObjectURL(previewUrl);
    };
  }, [miniature]);

  useEffect(() => {
    if (!heroImage) {
      setHeroImagePreview("");
      return;
    }

    const previewUrl = URL.createObjectURL(heroImage);
    setHeroImagePreview(previewUrl);

    return () => {
      URL.revokeObjectURL(previewUrl);
    };
  }, [heroImage]);

  function updateField(field, value) {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!form) {
      return;
    }

    setMessage("");

    if (!form.titre.trim()) {
      setMessage("Le titre du film est obligatoire.");
      return;
    }

    const miniatureError = validateImage(
      miniature,
      "Miniature"
    );

    if (miniatureError) {
      setMessage(miniatureError);
      return;
    }

    const heroImageError = validateImage(
      heroImage,
      "Image plein écran"
    );

    if (heroImageError) {
      setMessage(heroImageError);
      return;
    }

    setSaving(true);

    try {
      let miniatureUrl = form.miniature_url || "";
      let heroImageUrl = form.hero_image_url || "";

      if (miniature) {
        miniatureUrl = await uploadImage({
          file: miniature,
          filmTitle: form.titre,
          suffix: "miniature",
        });
      }

      if (heroImage) {
        heroImageUrl = await uploadImage({
          file: heroImage,
          filmTitle: form.titre,
          suffix: "hero",
        });
      }

      const slug = slugify(form.titre);

      if (!slug) {
        throw new Error(
          "Le titre ne permet pas de générer une adresse valide."
        );
      }

      const updatedFilm = {
        titre: form.titre.trim(),
        nom_du_film: form.titre.trim(),
        slug,

        annee: form.annee
          ? Number(form.annee)
          : null,

        realisateur_1:
          form.realisateur_1.trim() || null,

        realisateur_2:
          form.realisateur_2.trim() || null,

        genre:
          form.genre.trim() || null,

        duree:
          form.duree.trim() || null,

        synopsis:
          form.synopsis.trim() || null,

        vimeo_id:
          form.vimeo_id.trim() || null,

        miniature_url:
          miniatureUrl || null,

        hero_image_url:
          heroImageUrl || null,

        featured:
          Boolean(form.featured),

        is_published:
          Boolean(form.is_published),

        validation_status:
          form.is_published
            ? "approved"
            : "draft",

        valide:
          Boolean(form.is_published),

        updated_at:
          new Date().toISOString(),
      };

      const { error: updateError } = await supabase
        .from("films")
        .update(updatedFilm)
        .eq("id", id);

      if (updateError) {
        throw new Error(updateError.message);
      }

      navigate("/admin");
    } catch (error) {
      console.error(
        "Erreur modification film :",
        error
      );

      setMessage(
        `Erreur modification : ${
          error instanceof Error
            ? error.message
            : "erreur inconnue"
        }`
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black px-6 text-center text-white">
        Chargement du film…
      </main>
    );
  }

  if (!form) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black px-6 text-center text-white">
        <div>
          <p className="text-white/70">
            {message || "Film introuvable."}
          </p>

          <button
            type="button"
            onClick={() => navigate("/admin")}
            className="mt-6 rounded-xl bg-white px-5 py-3 font-semibold text-black"
          >
            Retour à l’administration
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black px-4 py-12 text-white sm:px-6 md:py-16">
      <div className="mx-auto max-w-3xl">
        <button
          type="button"
          onClick={() => navigate("/admin")}
          className="mb-8 text-sm text-white/50 transition hover:text-white"
        >
          ← Retour admin
        </button>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-white/40">
            Administration
          </p>

          <h1 className="mt-3 text-3xl font-bold sm:text-4xl">
            Modifier le film
          </h1>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-10 space-y-6 rounded-3xl border border-white/10 bg-white/[0.04] p-5 sm:p-6"
        >
          <div>
            <label
              htmlFor="titre"
              className="mb-2 block text-sm text-white/60"
            >
              Titre
            </label>

            <input
              id="titre"
              required
              value={form.titre}
              onChange={(event) =>
                updateField(
                  "titre",
                  event.target.value
                )
              }
              className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 outline-none transition focus:border-white/40"
            />
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label
                htmlFor="annee"
                className="mb-2 block text-sm text-white/60"
              >
                Année
              </label>

              <input
                id="annee"
                type="number"
                min="1900"
                max="2100"
                value={form.annee}
                onChange={(event) =>
                  updateField(
                    "annee",
                    event.target.value
                  )
                }
                className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 outline-none transition focus:border-white/40"
              />
            </div>

            <div>
              <label
                htmlFor="duree"
                className="mb-2 block text-sm text-white/60"
              >
                Durée
              </label>

              <input
                id="duree"
                value={form.duree}
                onChange={(event) =>
                  updateField(
                    "duree",
                    event.target.value
                  )
                }
                placeholder="12 min"
                className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 outline-none transition focus:border-white/40"
              />
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label
                htmlFor="realisateur-1"
                className="mb-2 block text-sm text-white/60"
              >
                Réalisateur·ice 1
              </label>

              <input
                id="realisateur-1"
                value={form.realisateur_1}
                onChange={(event) =>
                  updateField(
                    "realisateur_1",
                    event.target.value
                  )
                }
                className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 outline-none transition focus:border-white/40"
              />
            </div>

            <div>
              <label
                htmlFor="realisateur-2"
                className="mb-2 block text-sm text-white/60"
              >
                Réalisateur·ice 2
              </label>

              <input
                id="realisateur-2"
                value={form.realisateur_2}
                onChange={(event) =>
                  updateField(
                    "realisateur_2",
                    event.target.value
                  )
                }
                className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 outline-none transition focus:border-white/40"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="genre"
              className="mb-2 block text-sm text-white/60"
            >
              Genre
            </label>

            <input
              id="genre"
              value={form.genre}
              onChange={(event) =>
                updateField(
                  "genre",
                  event.target.value
                )
              }
              placeholder="Fiction, documentaire, expérimental…"
              className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 outline-none transition focus:border-white/40"
            />
          </div>

          <div>
            <label
              htmlFor="vimeo-id"
              className="mb-2 block text-sm text-white/60"
            >
              ID Vimeo
            </label>

            <input
              id="vimeo-id"
              value={form.vimeo_id}
              onChange={(event) =>
                updateField(
                  "vimeo_id",
                  event.target.value
                )
              }
              inputMode="numeric"
              placeholder="123456789"
              className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 outline-none transition focus:border-white/40"
            />
          </div>

          <div>
            <label
              htmlFor="synopsis"
              className="mb-2 block text-sm text-white/60"
            >
              Synopsis
            </label>

            <textarea
              id="synopsis"
              rows={6}
              value={form.synopsis}
              onChange={(event) =>
                updateField(
                  "synopsis",
                  event.target.value
                )
              }
              className="w-full resize-y rounded-xl border border-white/10 bg-black px-4 py-3 outline-none transition focus:border-white/40"
            />
          </div>

          <section className="rounded-2xl border border-white/10 bg-black/40 p-4">
            <h2 className="text-sm font-medium">
              Miniature du film
            </h2>

            <p className="mt-2 text-xs leading-relaxed text-white/45">
              Format horizontal conseillé : 16:9,
              idéalement 1280 × 720 px.
            </p>

            {form.miniature_url && !miniaturePreview && (
              <div className="mt-4">
                <p className="mb-2 text-xs uppercase tracking-[0.15em] text-white/40">
                  Image actuelle
                </p>

                <img
                  src={form.miniature_url}
                  alt={`Miniature actuelle de ${form.titre}`}
                  className="aspect-video w-full rounded-xl object-cover"
                />
              </div>
            )}

            {miniaturePreview && (
              <div className="mt-4">
                <p className="mb-2 text-xs uppercase tracking-[0.15em] text-white/40">
                  Nouvelle image
                </p>

                <img
                  src={miniaturePreview}
                  alt="Aperçu de la nouvelle miniature"
                  className="aspect-video w-full rounded-xl object-cover"
                />

                <button
                  type="button"
                  onClick={() => setMiniature(null)}
                  className="mt-3 text-xs text-white/50 underline underline-offset-4 hover:text-white"
                >
                  Annuler le remplacement
                </button>
              </div>
            )}

            <label
              htmlFor="miniature"
              className="mt-4 block text-sm text-white/60"
            >
              Remplacer la miniature
            </label>

            <input
              id="miniature"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(event) =>
                setMiniature(
                  event.target.files?.[0] || null
                )
              }
              className="mt-2 w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-sm"
            />
          </section>

          <section className="rounded-2xl border border-white/10 bg-black/40 p-4">
            <h2 className="text-sm font-medium">
              Image plein écran pour l’accueil
            </h2>

            <p className="mt-2 text-xs leading-relaxed text-white/45">
              Utilisée lorsque le film est tiré au
              hasard sur l’accueil mobile. Format
              vertical conseillé : 9:16,
              idéalement 1080 × 1920 px.
            </p>

            {form.hero_image_url && !heroImagePreview && (
              <div className="mt-4">
                <p className="mb-2 text-xs uppercase tracking-[0.15em] text-white/40">
                  Image actuelle
                </p>

                <img
                  src={form.hero_image_url}
                  alt={`Image plein écran actuelle de ${form.titre}`}
                  className="mx-auto aspect-[9/16] max-h-[34rem] w-auto rounded-xl object-cover"
                />
              </div>
            )}

            {heroImagePreview && (
              <div className="mt-4">
                <p className="mb-2 text-xs uppercase tracking-[0.15em] text-white/40">
                  Nouvelle image
                </p>

                <img
                  src={heroImagePreview}
                  alt="Aperçu de la nouvelle image plein écran"
                  className="mx-auto aspect-[9/16] max-h-[34rem] w-auto rounded-xl object-cover"
                />

                <button
                  type="button"
                  onClick={() => setHeroImage(null)}
                  className="mt-3 text-xs text-white/50 underline underline-offset-4 hover:text-white"
                >
                  Annuler le remplacement
                </button>
              </div>
            )}

            <label
              htmlFor="hero-image"
              className="mt-4 block text-sm text-white/60"
            >
              Remplacer l’image plein écran
            </label>

            <input
              id="hero-image"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(event) =>
                setHeroImage(
                  event.target.files?.[0] || null
                )
              }
              className="mt-2 w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-sm"
            />
          </section>

          <div className="space-y-3">
            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/10 bg-black/40 p-4">
              <input
                type="checkbox"
                checked={Boolean(form.featured)}
                onChange={(event) =>
                  updateField(
                    "featured",
                    event.target.checked
                  )
                }
                className="mt-1 h-4 w-4"
              />

              <span>
                <span className="block font-medium">
                  Autoriser la mise en avant
                </span>

                <span className="mt-1 block text-xs leading-relaxed text-white/45">
                  Le film pourra être tiré au hasard
                  parmi les trois grands films de
                  l’accueil mobile.
                </span>
              </span>
            </label>

            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/10 bg-black/40 p-4">
              <input
                type="checkbox"
                checked={Boolean(form.is_published)}
                onChange={(event) =>
                  updateField(
                    "is_published",
                    event.target.checked
                  )
                }
                className="mt-1 h-4 w-4"
              />

              <span>
                <span className="block font-medium">
                  Film publié
                </span>

                <span className="mt-1 block text-xs leading-relaxed text-white/45">
                  Un film non publié ne peut pas
                  apparaître sur le site public.
                </span>
              </span>
            </label>
          </div>

          {message && (
            <p
              role="alert"
              className="rounded-xl border border-red-400/30 bg-red-500/10 p-4 text-sm text-red-200"
            >
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-xl bg-white px-5 py-3 font-semibold text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving
              ? "Enregistrement…"
              : "Enregistrer les modifications"}
          </button>
        </form>
      </div>
    </main>
  );
}