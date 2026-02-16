import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useMemo, useState } from "react";

const HELLOASSO_URL =
  "https://www.helloasso.com/associations/la-niche-studio/formulaires/2";

// On garde ce paramètre (même si HelloAsso ne pré-remplit pas), ça ne gêne pas.
const HELLOASSO_FILM_FIELD =
  "Film / projet que vous souhaitez soutenir (facultatif)";

function buildHelloAssoUrl(donationTag) {
  const url = new URL(HELLOASSO_URL);
  if (donationTag) url.searchParams.set(HELLOASSO_FILM_FIELD, donationTag);
  return url.toString();
}

function ProgressBar({ step, total }) {
  const pct = (step / total) * 100;
  return (
    <div className="w-full">
      <div className="flex justify-between text-xs text-white/70 mb-2">
        <span>Étape {step}/{total}</span>
        <span>Don</span>
      </div>
      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-white rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.25 }}
        />
      </div>
    </div>
  );
}

export default function DonModal({ onClose, donationTag }) {
  const href = useMemo(() => buildHelloAssoUrl(donationTag), [donationTag]);

  const TOTAL = 2;

  // ✅ La modale s'ouvre DIRECTEMENT sur l'étape "code"
  const [step, setStep] = useState(1);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setStep(1);
    setCopied(false);
  }, []);

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1200);
    return () => clearTimeout(t);
  }, [copied]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard?.writeText(donationTag || "");
      setCopied(true);
    } catch {
      // no-op
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        onClick={(e) => e.target === e.currentTarget && onClose()}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="bg-white text-black rounded-2xl shadow-2xl max-w-xl w-full relative overflow-hidden"
          initial={{ scale: 0.92, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.92, opacity: 0 }}
          transition={{ duration: 0.22 }}
        >
          {/* ✕ Fermer */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-black text-2xl font-bold z-10"
            aria-label="Fermer"
          >
            ✕
          </button>

          {/* Header */}
          <div className="bg-black text-white px-6 py-5">
            <h2 className="text-2xl font-bold">Soutenir ce film</h2>
            <p className="text-sm text-white/70 mt-1">
              Accès gratuit — dons volontaires via HelloAsso (ce n’est pas un achat).
            </p>

            <div className="mt-4">
              <ProgressBar step={step} total={TOTAL} />
            </div>
          </div>

          {/* Body */}
          <div className="p-6 md:p-8">
            <AnimatePresence mode="wait">
              {/* ✅ ÉTAPE 1 = CODE */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.18 }}
                  className="border border-gray-200 bg-gray-50 rounded-xl p-6 text-center"
                >
                  <h3 className="font-semibold mb-3">Étape 1 — Copier le code</h3>

                  <p className="text-sm text-gray-700 mb-4">
                    Sur HelloAsso, quand le champ <span className="font-semibold">« CODE »</span> apparaît, collez :
                  </p>

                  {/* Code en GROS */}
                  <motion.div
                    className="mx-auto inline-block font-mono font-bold text-3xl md:text-4xl bg-white border border-gray-200 rounded-xl px-6 py-4 tracking-wide"
                    initial={{ scale: 1 }}
                    animate={{ scale: [1, 1.02, 1] }}
                    transition={{ duration: 0.6 }}
                  >
                    {donationTag || "—"}
                  </motion.div>

                  <div className="mt-5 flex flex-col sm:flex-row gap-3 justify-center">
                    <motion.button
                      type="button"
                      onClick={handleCopy}
                      disabled={!donationTag}
                      whileTap={{ scale: 0.98 }}
                      className="px-6 py-3 rounded-lg bg-black text-white font-semibold hover:bg-black/90 transition disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {copied ? "Copié !" : "Copier le code"}
                    </motion.button>

                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="px-6 py-3 rounded-lg border border-gray-200 hover:bg-white transition font-semibold"
                    >
                      Étape suivante →
                    </button>
                  </div>

                  <p className="mt-4 text-xs text-gray-500">
                    Indication facultative — vous pouvez modifier ou supprimer ce code sur HelloAsso.
                  </p>
                </motion.div>
              )}

              {/* ✅ ÉTAPE 2 = ALLER SUR HELLOASSO */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.18 }}
                  className="border border-gray-200 bg-gray-50 rounded-xl p-6"
                >
                  <h3 className="font-semibold mb-2 text-center">Étape 2 — Aller sur HelloAsso</h3>
                  <p className="text-sm text-gray-700 text-center">
                    Ouvrez la page de don sécurisée, puis collez le code dans le champ “CODE” quand il apparaît.
                  </p>

                  <div className="mt-6 flex flex-col sm:flex-row gap-3">
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 text-center px-6 py-3 bg-black text-white font-semibold rounded-lg hover:bg-black/90 transition"
                    >
                      Aller sur HelloAsso →
                    </a>

                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="flex-1 px-6 py-3 border border-gray-200 rounded-lg hover:bg-white transition font-semibold"
                    >
                      ← Retour au code
                    </button>
                  </div>

                  <p className="mt-4 text-xs text-gray-500 text-center">
                    Paiement sécurisé sur HelloAsso. Les dons sont versés à l’association La Niche Studio.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
