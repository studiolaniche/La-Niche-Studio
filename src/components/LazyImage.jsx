import { useEffect, useRef, useState } from "react";

/**
 * LazyImage : charge une image seulement lorsqu'elle entre dans le viewport.
 * - `src` : URL de l'image
 * - `alt` : texte alternatif
 * - `className` : classes CSS
 * - `width` / `height` : dimensions pour réserver l'espace (important pour le CLS)
 */
export default function LazyImage({ src, alt = "", className = "", width, height }) {
  const imgRef = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const imgElement = imgRef.current;
    if (!imgElement) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: "200px", // 👈 commence à charger 200px AVANT que l'image entre dans l'écran
        threshold: 0.01,
      }
    );

    observer.observe(imgElement);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <img
      ref={imgRef}
      src={visible ? src : ""}
      alt={alt}
      width={width}
      height={height}
      loading="lazy"
      decoding="async"
      className={className}
    />
  );
}
