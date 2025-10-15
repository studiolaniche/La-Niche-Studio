import { motion } from "framer-motion";
import CountUp from "react-countup";
import { useState } from "react";

export default function Apropos() {
  return (
    <div className="bg-black text-white">
      {/* Hero */}
      <section className="relative h-[80vh] flex flex-col items-center justify-center text-center bg-[url('/photos/phototournagegum1.jpg')] bg-cover bg-center">
        <div className="bg-black/60 absolute inset-0"></div>
        <div className="relative z-10">
          <h1 className="text-5xl font-bold mb-4">La Niche Studio</h1>
          <p className="max-w-2xl mx-auto text-lg opacity-90">
            Une association qui soutient la création indépendante et propulse les talents émergents.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="max-w-5xl mx-auto py-20 px-4 text-center">
        <h2 className="text-3xl font-semibold mb-4">Notre mission</h2>
        <p className="opacity-80 leading-relaxed">
          La Niche Studio accompagne les créateurs de courts métrages depuis 2023. 
          Nous produisons, diffusons et soutenons des œuvres libres et accessibles, 
          portées par la collaboration, l’entraide et la passion du cinéma.
        </p>
      </section>

      {/* Stats */}
      <section className="bg-white/5 py-20">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <CountUp end={524} duration={3} suffix=" h" className="text-4xl font-bold" />
            <p className="opacity-70">Temps de visionnage</p>
          </div>
          <div>
            <CountUp end={12} duration={3} className="text-4xl font-bold" />
            <p className="opacity-70">Membres actifs</p>
          </div>
          <div>
            <CountUp end={6} duration={3} className="text-4xl font-bold" />
            <p className="opacity-70">Tournages 2024</p>
          </div>
          <div>
            <CountUp end={5500} duration={3} suffix=" €" className="text-4xl font-bold" />
            <p className="opacity-70">Dons récoltés</p>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="max-w-5xl mx-auto py-20 px-4">
        <h2 className="text-3xl font-semibold mb-8 text-center">Notre histoire</h2>
        <div className="space-y-8 border-l-2 border-white/20 pl-8">
          <div>
            <h3 className="text-xl font-bold">2023 — Fondation</h3>
            <p className="opacity-80">Lancement de La Niche Studio et premiers projets pilotes.</p>
          </div>
          <div>
            <h3 className="text-xl font-bold">2024 — Expansion</h3>
            <p className="opacity-80">Sortie de 3 fictions, développement de notre réseau et premières avant-premières.</p>
          </div>
          <div>
            <h3 className="text-xl font-bold">2025 — Professionnalisation</h3>
            <p className="opacity-80">Début des financements CNC, nouveaux partenariats, 4 à 6 tournages prévus.</p>
          </div>
        </div>
      </section>

      {/* Galerie photo */}
      <section className="bg-white/5 py-20 px-4">
        <h2 className="text-3xl font-semibold mb-8 text-center">En images</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-w-5xl mx-auto">
          <img src="/photos/phototournagegum1.jpg" className="object-cover w-full h-64 rounded-lg" />
          <img src="/photos/phototournagegum2.jpg" className="object-cover w-full h-64 rounded-lg" />
          <img src="/photos/phototournageopium1.jpg" className="object-cover w-full h-64 rounded-lg" />
        </div>
      </section>
    </div>
  );
}
