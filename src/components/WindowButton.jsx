import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

function getVisitorId() {
  let visitorId = localStorage.getItem("lbv_visitor_id");

  if (!visitorId) {
    visitorId = crypto.randomUUID();
    localStorage.setItem("lbv_visitor_id", visitorId);
  }

  return visitorId;
}

export default function WindowButton({ filmId }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    async function checkWindow() {
      if (!filmId) return;

      const visitorId = getVisitorId();

      const { data } = await supabase
        .from("film_windows")
        .select("id")
        .eq("film_id", filmId)
        .eq("session_id", visitorId)
        .maybeSingle();

      setIsOpen(!!data);
      setLoading(false);
    }

    checkWindow();
  }, [filmId]);

  const toggleWindow = async () => {
    if (!filmId || loading) return;

    setAnimating(true);

    const visitorId = getVisitorId();

    if (isOpen) {
      await supabase
        .from("film_windows")
        .delete()
        .eq("film_id", filmId)
        .eq("session_id", visitorId);

      setIsOpen(false);
    } else {
      await supabase.from("film_windows").insert({
        film_id: filmId,
        session_id: visitorId,
      });

      setIsOpen(true);
    }

    setTimeout(() => setAnimating(false), 500);
  };

  return (
    <button
      type="button"
      onClick={toggleWindow}
      disabled={loading}
      className={`
        group w-full rounded-2xl border p-5 text-left transition
        ${
          isOpen
            ? "border-white/30 bg-white text-black"
            : "border-white/15 bg-white/[0.04] text-white hover:bg-white/[0.08]"
        }
      `}
    >
      <div className="flex items-center gap-4">
        <div
          className={`
            flex h-14 w-14 items-center justify-center rounded-2xl text-3xl transition-transform duration-500
            ${animating ? "scale-110 rotate-3" : ""}
            ${isOpen ? "bg-black text-white" : "bg-white/10 text-white"}
          `}
        >
          🪟
        </div>

        <div>
          <p className="text-lg font-semibold">
            {loading
              ? "Chargement..."
              : isOpen
              ? "Fenêtre ouverte"
              : "Ouvrir une fenêtre sur ce film"}
          </p>

          <p
            className={`mt-1 text-sm ${
              isOpen ? "text-black/60" : "text-white/55"
            }`}
          >
            {isOpen
              ? "Ce film fait désormais partie de votre fenêtre."
              : "Gardez ce film près de vous et retrouvez-le plus tard."}
          </p>
        </div>
      </div>
    </button>
  );
}