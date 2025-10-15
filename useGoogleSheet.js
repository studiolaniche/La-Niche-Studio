import { useEffect, useState } from "react";

/** Lit un Google Sheet publié via l’API gviz et renvoie un tableau d’objets. */
export default function useGoogleSheet(sheetId, sheetName = "Films") {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sheetId) return;
    let cancelled = false;

    async function run() {
      try {
        const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(sheetName)}`;
        const res = await fetch(url);
        const txt = await res.text();                           // google.visualization.Query.setResponse(...)
        const json = JSON.parse(txt.substr(47).slice(0, -2));   // on “dé-emballe” le JSON
        const rows = json.table.rows || [];
        const films = rows.map(r => ({
          id: r.c[0]?.v?.toString() || "",
          title: r.c[1]?.v || "",
          director: r.c[2]?.v || "",
          vimeoId: r.c[3]?.v?.toString() || "",
          description: r.c[4]?.v || "",
        }));
        if (!cancelled) setData(films);
      } catch (e) {
        console.error("Erreur lecture Google Sheet :", e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    run();
    return () => { cancelled = true; };
  }, [sheetId, sheetName]);

  return { data, loading };
}