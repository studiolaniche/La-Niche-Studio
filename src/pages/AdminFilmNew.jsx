import { useState } from "react";
import { useNavigate } from "react-router-dom";
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

export default function AdminFilmNew() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    titre: "",
    annee: "",
    realisateur_1: "",
    realisateur_2: "",
    genre: "",
    duree: "",
    synopsis: "",
    vimeo_id: "",
    featured: false,
    is_published: false,
  });

  const [miniature, setMiniature] = useState(null);
  const [heroImage, setHeroImage] = useState(null);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  function updateField(field, value) {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

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

    setLoading(true);

    try {
      const slug = slugify(form.titre);

      if (!slug) {
        throw new Error(
          "Le titre ne permet pas de générer une adresse valide."
        );
      }

      const miniatureUrl = await uploadImage({
        file: miniature,
        filmTitle: form.titre,
        suffix: "miniature",
      });

      const heroImageUrl = await uploadImage({
        file: heroImage,
        filmTitle: form.titre,
        suffix: "hero",
      });

      const filmData = {
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
          form.featured,

        is_published:
          form.is_published,

        validation_status:
          form.is_published
            ? "approved"
            : "draft",

        valide:
          form.is_published,
      };

      const { error: insertError } = await supabase
        .from("films")
        .insert(filmData);

      if (insertError) {
        throw new Error(insertError.message);
      }

      navigate("/admin");
    } catch (error) {
      console.error(
        "Erreur création film :",
        error
      );

      setMessage(
        `Erreur création film : ${
          error instanceof Error
            ? error.message
            : "erreur inconnue"
        }`
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-black px-4 py-12 text-white sm:px-6 md:py-24">
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
            Ajouter un film
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
              placeholder="123456789"
              inputMode="numeric"
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
              value={form.synopsis}
              onChange={(event) =>
                updateField(
                  "synopsis",
                  event.target.value
                )
              }
              rows={6}
              className="w-full resize-y rounded-xl border border-white/10 bg-black px-4 py-3 outline-none transition focus:border-white/40"
            />
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
            <label
              htmlFor="miniature"
              className="block text-sm font-medium"
            >
              Miniature du film
            </label>

            <p className="mt-2 text-xs leading-relaxed text-white/45">
              Utilisée dans le catalogue et les cartes.
              Format horizontal conseillé : 16:9,
              idéalement 1280 × 720 px.
            </p>

            <input
              id="miniature"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(event) =>
                setMiniature(
                  event.target.files?.[0] || null
                )
              }
              className="mt-4 w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-sm"
            />

            {miniature && (
              <div className="mt-4">
                <img
                  src={URL.createObjectURL(
                    miniature
                  )}
                  alt="Aperçu de la miniature"
                  className="aspect-video w-full rounded-xl object-cover"
                />

                <p className="mt-2 break-all text-xs text-white/45">
                  {miniature.name}
                </p>
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
            <label
              htmlFor="hero-image"
              className="block text-sm font-medium"
            >
              Image plein écran pour l’accueil
            </label>

            <p className="mt-2 text-xs leading-relaxed text-white/45">
              Utilisée lorsque le film est mis en avant
              sur l’accueil mobile. Format vertical
              conseillé : 9:16, idéalement 1080 × 1920 px.
            </p>

            <input
              id="hero-image"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(event) =>
                setHeroImage(
                  event.target.files?.[0] || null
                )
              }
              className="mt-4 w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-sm"
            />

            {heroImage && (
              <div className="mt-4">
                <img
                  src={URL.createObjectURL(
                    heroImage
                  )}
                  alt="Aperçu de l’image plein écran"
                  className="mx-auto aspect-[9/16] max-h-[34rem] w-auto rounded-xl object-cover"
                />

                <p className="mt-2 break-all text-xs text-white/45">
                  {heroImage.name}
                </p>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/10 bg-black/40 p-4">
              <input
                type="checkbox"
                checked={form.featured}
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
                  parmi les films affichés sur l’accueil.
                </span>
              </span>
            </label>

            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/10 bg-black/40 p-4">
              <input
                type="checkbox"
                checked={form.is_published}
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
                  Publier directement le film
                </span>

                <span className="mt-1 block text-xs leading-relaxed text-white/45">
                  Un film non publié ne peut pas
                  apparaître sur l’accueil public.
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
            disabled={loading}
            className="w-full rounded-xl bg-white px-5 py-3 font-semibold text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading
              ? "Enregistrement…"
              : "Enregistrer le film"}
          </button>
        </form>
      </div>
    </main>
  );
}