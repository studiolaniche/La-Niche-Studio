// scripts/build-films.mjs
// 🧠 Ce script télécharge ta Google Sheet en CSV et crée un fichier public/films.json
// 👉 Il sera exécuté automatiquement AVANT chaque build grâce à "prebuild" dans package.json

import fs from "node:fs";
import path from "node:path";
import Papa from "papaparse";

// 📥 URL de ta Google Sheet exportée en CSV
const SHEET_CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vQx2hJ88sGP3uqDFVQnZ9Nxm6yebaDSD_ogphypXSvocInkKFRF3L3N3Q7ujFbtgNVJ0m8VrTgBG9ae/pub?output=csv";

// ✅ Télécharge la Google Sheet
async function downloadCSV(url) {
  console.log("⬇️  Téléchargement de la Google Sheet...");
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`❌ Erreur de téléchargement : ${res.status} ${res.statusText}`);
  }
  return await res.text();
}

// 🧹 Nettoie et normalise chaque ligne
function normalizeRow(row) {
  const norm = {};
  for (const [k, v] of Object.entries(row)) {
    const key = String(k || "").trim();
    const val = typeof v === "string" ? v.trim() : v ?? "";
    norm[key] = val;
  }
  // Petit bonus : convertir ANNEE et DUREE en nombre
  if (norm.ANNEE) norm.ANNEE = parseInt(norm.ANNEE);
  if (norm.DUREE) norm.DUREE = parseInt(norm.DUREE);
  return norm;
}

async function main() {
  try {
    // 1️⃣ Télécharger le CSV brut
    const csv = await downloadCSV(SHEET_CSV_URL);

    // 2️⃣ Parser le CSV avec PapaParse
    console.log("📊 Parsing du CSV...");
    const parsed = Papa.parse(csv, { header: true, skipEmptyLines: true });
    if (parsed.errors?.length) {
      console.warn("⚠️  Quelques erreurs de parsing :", parsed.errors.slice(0, 3));
    }

    // 3️⃣ Normaliser les lignes
    const films = parsed.data.map(normalizeRow);

    // 4️⃣ Créer public/films.json
    const outDir = path.resolve("public");
    const outFile = path.join(outDir, "films.json");
    fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(
      outFile,
      JSON.stringify({ generatedAt: new Date().toISOString(), films }, null, 2),
      "utf-8"
    );

    console.log(`✅ Fichier généré : ${outFile}`);
    console.log(`📁 ${films.length} films exportés depuis la Google Sheet.`);
  } catch (err) {
    console.error("❌ Erreur :", err);
    process.exit(1);
  }
}

main();
