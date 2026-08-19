import admin from "firebase-admin";
import { CLUB_LOGO_PRESETS } from "../src/lib/clubLogoPresets.js";

function matchPreset(nombre) {
  if (!nombre) return null;
  const preset = CLUB_LOGO_PRESETS.find(({ match }) => match.test(nombre));
  return preset?.url ?? null;
}

async function seedClubLogos(db) {
  const snapshot = await db.collection("Clubes").get();
  let updated = 0;

  for (const docSnap of snapshot.docs) {
    const data = docSnap.data();
    const presetUrl = matchPreset(data.nombre);
    if (!presetUrl || data.logoUrl === presetUrl) continue;

    await docSnap.ref.update({
      logoUrl: presetUrl,
      logoSource: "preset",
      logoUpdatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    updated += 1;
    console.log(`✔ ${data.nombre} → ${presetUrl}`);
  }

  return { clubs: snapshot.size, updated };
}

async function main() {
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
      projectId: "app-33232",
    });
  }

  const db = admin.firestore();
  console.log("Asignando escudos preset a clubes…");
  const summary = await seedClubLogos(db);
  console.log(`Listo: ${summary.updated} club${summary.updated === 1 ? "" : "es"} actualizados de ${summary.clubs}.`);
}

main().catch((error) => {
  console.error("Error asignando escudos:", error.message);
  console.error("Configura GOOGLE_APPLICATION_CREDENTIALS o ejecuta como superadmin desde la app.");
  process.exit(1);
});
