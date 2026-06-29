import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

function getVisitorId() {
  let visitorId = localStorage.getItem("lbv_visitor_id");

  if (!visitorId) {
    visitorId = crypto.randomUUID();
    localStorage.setItem("lbv_visitor_id", visitorId);
  }

  return visitorId;
}

export default function Fenetre() {
  const [items, setItems] = useState([]);
  const [editos, setEditos] = useState([]);
  const [loading, setLoading] = useState(true);

  async function loadFenetre() {
    setLoading(true);

    const visitorId = getVisitorId();

    const { data: windowData, error: windowError } = await supabase
      .from("film_windows")
      .select(
        `
        id,
        created_at,
        films (
          id,
          titre,
          slug,
          annee,
          realisateur_1,
          realisateur_2,
          miniature_url,
          vimeo_id,
          synopsis
        )
      `
      )
      .eq("session_id", visitorId)
      .order("created_at", { ascending: false });

    if (windowError) {
      console.error("Erreur fenêtre :", windowError);
      setItems([]);
      setEditos([]);
      setLoading(false);
      return;
    }

    const windowItems = windowData || [];
    setItems(windowItems);

    const filmIds = windowItems
      .map((item) => item.films?.id)
      .filter(Boolean);

    if (filmIds.length === 0) {
      setEditos([]);
      setLoading(false);
      return;
    }

    const { data: editosData, error: editosError } = await supabase
      .from("editos")
      .select(
        `
        id,
        titre,
        texte,
        image_url,
        url,
        status,
        poids,
        created_at,
        film_id,
        films (
          id,
          titre,
          slug
        )
      `
      )
      .eq("is_published", true)
      .in("film_id", filmIds)
      .order("created_at", { ascending: false });

    if (editosError) {
      console.error("Erreur éditos fenêtre :", editosError);
      setEditos([]);
    } else {
      setEditos(editosData || []);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadFenetre();
  }, []);

  const removeFromWindow = async (windowId) => {
    const { error } = await supabase
      .from("film_windows")
      .delete()
      .eq("id", windowId);

    if (error) {
      alert("Erreur : " + error.message);
      return;
    }

    loadFenetre();
  };

  const sortedEditos = useMemo(() => {
    return editos.slice().sort((a, b) => {
      const poidsDiff = (Number(b.poids) || 0) - (Number(a.poids) || 0);
      if (poidsDiff !== 0) return poidsDiff;

      return new Date(b.created_at || 0) - new Date(a.created_at || 0);
    });
  }, [editos]);

  if (loading) {
    return (
      <main className="min-h-[calc(100vh-4rem)] bg-black px-6 py-16 text-white">
        Chargement de votre fenêtre...
      </main>
    );
  }

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-black px-6 py-16 text-white">
      <div className="mx-auto max-w-6xl">
        <p className="text-sm uppercase tracking-[0.3em] text-white/40">
          La Baie Vitrée
        </p>

        <h1 className="mt-3 text-4xl font-bold">🪟 Ma fenêtre</h1>

        <p className="mt-4 max-w-2xl text-white/60">
          Les films que vous avez choisi de garder près de vous. Revenez les voir,
          retrouvez leur parcours, ouvrez de nouvelles fenêtres.
        </p>

        {items.length === 0 ? (
          <div className="mt-10 rounded-3xl border border-dashed border-white/15 bg-white/[0.03] p-10 text-center">
            <p className="text-xl font-semibold">Votre fenêtre est encore vide.</p>
            <p className="mt-2 text-white/50">
              Ouvrez une fenêtre sur un film depuis sa page.
            </p>

            <Link
              to="/catalogue"
              className="mt-6 inline-flex rounded-full bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-white/90"
            >
              Explorer le catalogue
            </Link>
          </div>
        ) : (
          <>
            {sortedEditos.length > 0 && (
              <section className="mt-10 rounded-3xl border border-white/10 bg-white/[0.04] p-6">
                <div className="mb-6">
                  <p className="text-sm uppercase tracking-[0.25em] text-white/35">
                    Actualités
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold">
                    Des nouvelles de votre fenêtre
                  </h2>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  {sortedEditos.map((edito) => {
                    const linkedFilm = edito.films;

                    const content = (
                      <article className="group overflow-hidden rounded-2xl border border-white/10 bg-black/30 transition hover:bg-black/45">
                        {edito.image_url && (
                          <div className="aspect-video overflow-hidden bg-white/10">
                            <img
                              src={edito.image_url}
                              alt={edito.titre}
                              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                            />
                          </div>
                        )}

                        <div className="p-5">
                          <div className="mb-3 flex flex-wrap items-center gap-2">
                            <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/70">
                              {edito.status || "ÉDITO"}
                            </span>

                            {linkedFilm && (
                              <span className="rounded-full border border-white/15 px-3 py-1 text-xs text-white/45">
                                {linkedFilm.titre}
                              </span>
                            )}
                          </div>

                          <h3 className="text-lg font-semibold">{edito.titre}</h3>

                          {edito.texte && (
                            <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-white/60">
                              {edito.texte}
                            </p>
                          )}

                          <p className="mt-4 text-xs text-white/35">
                            {edito.created_at
                              ? new Date(edito.created_at).toLocaleDateString(
                                  "fr-FR"
                                )
                              : ""}
                          </p>
                        </div>
                      </article>
                    );

                    if (edito.url) {
                      return edito.url.startsWith("/") ? (
                        <Link key={edito.id} to={edito.url}>
                          {content}
                        </Link>
                      ) : (
                        <a
                          key={edito.id}
                          href={edito.url}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {content}
                        </a>
                      );
                    }

                    return (
                      <div key={edito.id}>
                        {content}
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            <section className="mt-10">
              <div className="mb-6">
                <p className="text-sm uppercase tracking-[0.25em] text-white/35">
                  Vos films
                </p>
                <h2 className="mt-2 text-2xl font-semibold">
                  Fenêtres ouvertes
                </h2>
              </div>

              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((item) => {
                  const film = item.films;

                  if (!film) return null;

                  const miniature =
                    film.miniature_url ||
                    (film.vimeo_id
                      ? `https://vumbnail.com/${film.vimeo_id}.jpg`
                      : "/miniatures/placeholder.jpg");

                  const realisateurs = [film.realisateur_1, film.realisateur_2]
                    .filter(Boolean)
                    .join(" & ");

                  return (
                    <article
                      key={item.id}
                      className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04]"
                    >
                      <Link to={`/projet/${film.slug || film.id}`}>
                        <div className="aspect-video overflow-hidden bg-white/10">
                          <img
                            src={miniature}
                            alt={film.titre}
                            className="h-full w-full object-cover transition duration-500 hover:scale-105"
                          />
                        </div>
                      </Link>

                      <div className="p-5">
                        <h2 className="text-xl font-semibold">{film.titre}</h2>

                        <p className="mt-1 text-sm text-white/50">
                          {realisateurs}
                          {film.annee ? ` — ${film.annee}` : ""}
                        </p>

                        {film.synopsis && (
                          <p className="mt-4 line-clamp-3 text-sm leading-relaxed text-white/60">
                            {film.synopsis}
                          </p>
                        )}

                        <div className="mt-5 flex flex-wrap gap-2">
                          <Link
                            to={`/projet/${film.slug || film.id}`}
                            className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-white/90"
                          >
                            Regarder
                          </Link>

                          <button
                            type="button"
                            onClick={() => removeFromWindow(item.id)}
                            className="rounded-full border border-white/20 px-4 py-2 text-sm transition hover:bg-white/10"
                          >
                            Retirer de ma fenêtre
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}