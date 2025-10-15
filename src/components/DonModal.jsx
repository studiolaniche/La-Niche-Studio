import { motion, AnimatePresence } from "framer-motion";

export default function DonModal({ onClose }) {
  const HELLOASSO_URL = "https://www.helloasso.com/associations/la-niche-studio/formulaires/1";

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
          className="bg-white text-black rounded-2xl shadow-2xl max-w-lg w-full relative overflow-hidden"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* ✕ Bouton fermer */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-black text-2xl font-bold"
          >
            ✕
          </button>

          {/* 🖤 En-tête */}
          <div className="bg-black text-white px-6 py-4">
            <h2 className="text-2xl font-bold">Soutenir ce créateur</h2>
            <p className="text-sm text-white/70 mt-1">
              Vos dons aident à financer de nouveaux courts métrages indépendants 🎬
            </p>
          </div>

          {/* 🔗 Redirection HelloAsso */}
          <div className="p-8 text-center">
            <p className="mb-6 text-gray-700 text-sm">
              Cliquez ci-dessous pour accéder à notre page de don sécurisée sur HelloAsso.
            </p>

            <a
              href={HELLOASSO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-6 py-3 bg-black text-white font-semibold rounded-lg hover:bg-black/90 transition"
            >
              Faire un don 💸
            </a>

            <p className="mt-4 text-xs text-gray-500">
              Le paiement est 100% sécurisé et se fait sur la plateforme HelloAsso.
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
