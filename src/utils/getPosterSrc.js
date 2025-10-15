export default function getPosterSrc(film) {
  const val = (film?.MINIATURE || "").trim();

  // Si la sheet contient déjà une URL absolue (http...) ou un chemin absolu (/miniatures/...)
  if (val) {
    if (/^https?:\/\//i.test(val) || val.startsWith("/")) return val;
    // Sinon on considère que c’est un nom de fichier présent dans /public/miniatures
    return `/miniatures/${val}`;
  }

  // Fallback placeholder (à créer : public/miniatures/placeholder.jpg)
  return "/miniatures/placeholder.jpg";
}
