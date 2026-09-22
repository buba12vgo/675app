import { readFileSync } from "node:fs";
import {
  initializeTestEnvironment,
  assertFails,
  assertSucceeds,
} from "@firebase/rules-unit-testing";
import { deleteObject, getBytes, ref, uploadBytes } from "firebase/storage";

const PROJECT_ID = "app-33232-storage-rules-test";
const rules = readFileSync(new URL("../storage.rules", import.meta.url), "utf8");

const testEnv = await initializeTestEnvironment({
  projectId: PROJECT_ID,
  storage: { rules },
});

const pngBytes = Uint8Array.from([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d,
]);

let passed = 0;
let failed = 0;

async function test(name, fn) {
  try {
    await fn();
    passed += 1;
    console.log(`✔ ${name}`);
  } catch (err) {
    failed += 1;
    console.error(`✘ ${name}`);
    console.error(`  ${err?.message || err}`);
  }
}

try {
  const owner = testEnv.authenticatedContext("coord-a").storage();
  const other = testEnv.authenticatedContext("coach-b").storage();
  const guest = testEnv.unauthenticatedContext().storage();

  await test("Dueño sube su escudo PNG", async () => {
    await assertSucceeds(
      uploadBytes(ref(owner, "logos/coord-a/club_club-a.png"), pngBytes, {
        contentType: "image/png",
      })
    );
  });

  await test("Dueño lee su escudo", async () => {
    await assertSucceeds(getBytes(ref(owner, "logos/coord-a/club_club-a.png")));
  });

  await test("Otro usuario no lee el escudo ajeno", async () => {
    await assertFails(getBytes(ref(other, "logos/coord-a/club_club-a.png")));
  });

  await test("Anónimo no sube escudos", async () => {
    await assertFails(
      uploadBytes(ref(guest, "logos/coord-a/club_club-a.png"), pngBytes, {
        contentType: "image/png",
      })
    );
  });

  await test("No se sube en la carpeta de otro uid", async () => {
    await assertFails(
      uploadBytes(ref(other, "logos/coord-a/equipo_eq-a.png"), pngBytes, {
        contentType: "image/png",
      })
    );
  });

  await test("Nombre de archivo inválido se rechaza", async () => {
    await assertFails(
      uploadBytes(ref(owner, "logos/coord-a/hack.txt"), pngBytes, {
        contentType: "image/png",
      })
    );
  });

  await test("No se sube un archivo que no es imagen", async () => {
    await assertFails(
      uploadBytes(ref(owner, "logos/coord-a/club_club-a.png"), pngBytes, {
        contentType: "application/octet-stream",
      })
    );
  });

  await test("Dueño borra su escudo", async () => {
    await assertSucceeds(deleteObject(ref(owner, "logos/coord-a/club_club-a.png")));
  });

  await test("Otro usuario no borra el escudo ajeno", async () => {
    await assertSucceeds(
      uploadBytes(ref(owner, "logos/coord-a/equipo_eq-a.svg"), pngBytes, {
        contentType: "image/svg+xml",
      })
    );
    await assertFails(deleteObject(ref(other, "logos/coord-a/equipo_eq-a.svg")));
  });
} finally {
  await testEnv.cleanup();
}

console.log(`\n${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
