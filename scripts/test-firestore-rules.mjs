import { readFileSync } from "node:fs";
import {
  initializeTestEnvironment,
  assertFails,
  assertSucceeds,
} from "@firebase/rules-unit-testing";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";

const PROJECT_ID = "app-33232-rules-test";
const rules = readFileSync(new URL("../firestore.rules", import.meta.url), "utf8");

const testEnv = await initializeTestEnvironment({
  projectId: PROJECT_ID,
  firestore: { rules },
});

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
  await testEnv.withSecurityRulesDisabled(async (context) => {
    const db = context.firestore();
    await setDoc(doc(db, "Usuarios/coach-a"), {
      email: "coach-a@test.com",
      rol: "entrenador",
      clubId: "club-a",
      clubNombre: "Club A",
    });
    await setDoc(doc(db, "Usuarios/coord-a"), {
      email: "coord-a@test.com",
      rol: "coordinador",
      clubId: "club-a",
      clubNombre: "Club A",
    });
    await setDoc(doc(db, "Usuarios/coach-new"), {
      email: "coach-new@test.com",
      rol: "entrenador",
    });
    await setDoc(doc(db, "Usuarios/superadmin"), {
      email: "admin@test.com",
      rol: "superadmin",
    });
    await setDoc(doc(db, "Equipos/eq-a"), { nombre: "Senior A", clubId: "club-a" });
    await setDoc(doc(db, "Equipos/eq-a2"), { nombre: "Junior A", clubId: "club-a" });
    await setDoc(doc(db, "Equipos/eq-b"), { nombre: "Senior B", clubId: "club-b" });
    await setDoc(doc(db, "Jugadoras/j-a"), { nombre: "Ana", clubId: "club-a", equipoId: "eq-a", dorsal: 1 });
    await setDoc(doc(db, "Jugadoras/j-a2"), { nombre: "Carla", clubId: "club-a", equipoId: "eq-a2", dorsal: 3 });
    await setDoc(doc(db, "Jugadoras/j-b"), { nombre: "Bea", clubId: "club-b", equipoId: "eq-b", dorsal: 2 });
    await setDoc(doc(db, "Sesiones/eq-a_2026-08-01"), {
      equipoId: "eq-a",
      fecha: "2026-08-01",
      tipo: "entreno",
    });
    await setDoc(doc(db, "Sesiones/eq-b_2026-08-01"), {
      equipoId: "eq-b",
      fecha: "2026-08-01",
      tipo: "entreno",
    });
    await setDoc(doc(db, "Logos/equipo_eq-b"), {
      tipo: "equipo",
      entityId: "eq-b",
      clubId: "club-b",
      logoUrl: "/logos/eq-b.png",
    });
  });

  const coachA = testEnv.authenticatedContext("coach-a").firestore();
  const coachNew = testEnv.authenticatedContext("coach-new").firestore();
  const coordA = testEnv.authenticatedContext("coord-a").firestore();
  const superadmin = testEnv.authenticatedContext("superadmin").firestore();

  await test("Entrenador lee equipos de su club", async () => {
    await assertSucceeds(getDoc(doc(coachA, "Equipos/eq-a")));
  });

  await test("Entrenador no lee equipos de otro club", async () => {
    await assertFails(getDoc(doc(coachA, "Equipos/eq-b")));
  });

  await test("Entrenador no lista equipos de otro club", async () => {
    await assertFails(getDocs(collection(coachA, "Equipos")));
  });

  await test("Entrenador lee jugadora de su equipo", async () => {
    await assertSucceeds(getDoc(doc(coachA, "Jugadoras/j-a")));
  });

  await test("Entrenador no lee jugadoras de otro club", async () => {
    await assertFails(getDoc(doc(coachA, "Jugadoras/j-b")));
  });

  await test("Entrenador lista jugadoras filtrando por equipo", async () => {
    const q = query(collection(coachA, "Jugadoras"), where("equipoId", "==", "eq-a"));
    await assertSucceeds(getDocs(q));
  });

  await test("Entrenador puede leer jugadora de otro equipo de su club por id", async () => {
    await assertSucceeds(getDoc(doc(coachA, "Jugadoras/j-a2")));
  });

  await test("Entrenador no lista todas las jugadoras", async () => {
    await assertFails(getDocs(collection(coachA, "Jugadoras")));
  });

  await test("Entrenador lista jugadoras de su club", async () => {
    const q = query(collection(coachA, "Jugadoras"), where("clubId", "==", "club-a"));
    await assertSucceeds(getDocs(q));
  });

  await test("Entrenador no lista jugadoras de otro club", async () => {
    const q = query(collection(coachA, "Jugadoras"), where("clubId", "==", "club-b"));
    await assertFails(getDocs(q));
  });

  await test("Entrenador puede solicitar club", async () => {
    await assertSucceeds(
      updateDoc(doc(coachNew, "Usuarios/coach-new"), {
        solicitudClubId: "club-a",
        solicitudClubNombre: "Club A",
      })
    );
  });

  await test("Entrenador no puede asignarse club directamente", async () => {
    await assertFails(
      updateDoc(doc(coachNew, "Usuarios/coach-new"), {
        clubId: "club-a",
        clubNombre: "Club A",
      })
    );
  });

  await test("Superadmin aprueba solicitud de club", async () => {
    await assertSucceeds(
      updateDoc(doc(superadmin, "Usuarios/coach-new"), {
        clubId: "club-a",
        clubNombre: "Club A",
        solicitudClubId: null,
        solicitudClubNombre: null,
      })
    );
  });

  await test("Entrenador no puede editar equipos", async () => {
    await assertFails(
      updateDoc(doc(coachA, "Equipos/eq-a"), {
        nombre: "Senior editado",
      })
    );
  });

  await test("Entrenador no puede crear equipos", async () => {
    await assertFails(
      setDoc(doc(coachA, "Equipos/eq-coach-new"), {
        nombre: "Cadete",
        clubId: "club-a",
      })
    );
  });

  await test("Entrenador actualiza sesión de su equipo", async () => {
    await assertSucceeds(
      updateDoc(doc(coachA, "Sesiones/eq-a_2026-08-01"), {
        tematica: "Tiro",
      })
    );
  });

  await test("Entrenador no reasigna sesión a equipo de otro club", async () => {
    await assertFails(
      updateDoc(doc(coachA, "Sesiones/eq-a_2026-08-01"), {
        equipoId: "eq-b",
      })
    );
  });

  await test("Entrenador actualiza jugadora de su equipo", async () => {
    await assertSucceeds(
      updateDoc(doc(coachA, "Jugadoras/j-a"), {
        nombre: "Ana",
      })
    );
  });

  await test("Entrenador no reasigna jugadora a equipo de otro club", async () => {
    await assertFails(
      updateDoc(doc(coachA, "Jugadoras/j-a"), {
        equipoId: "eq-b",
      })
    );
  });

  await test("Entrenador no cambia el clubId de una jugadora", async () => {
    await assertFails(
      updateDoc(doc(coachA, "Jugadoras/j-a"), {
        clubId: "club-b",
      })
    );
  });

  await test("Entrenador guarda equipos favoritos", async () => {
    await assertSucceeds(
      updateDoc(doc(coachA, "Usuarios/coach-a"), {
        equiposFavoritos: ["eq-a", "eq-a2", "eq-b", "eq-c"],
      })
    );
  });

  await test("Entrenador no guarda más de cuatro favoritos", async () => {
    await assertFails(
      updateDoc(doc(coachA, "Usuarios/coach-a"), {
        equiposFavoritos: ["eq-a", "eq-a2", "eq-b", "eq-c", "eq-d"],
      })
    );
  });

  await test("Coordinador asigna favoritos a un entrenador de su club", async () => {
    await assertSucceeds(
      updateDoc(doc(coordA, "Usuarios/coach-a"), {
        equiposFavoritos: ["eq-a"],
      })
    );
  });

  await test("Entrenador no asigna favoritos a otro usuario", async () => {
    await assertFails(
      updateDoc(doc(coachNew, "Usuarios/coach-a"), {
        equiposFavoritos: ["eq-a2"],
      })
    );
  });

  await test("Coordinador no cambia el rol de un entrenador", async () => {
    await assertFails(
      updateDoc(doc(coordA, "Usuarios/coach-a"), {
        rol: "coordinador",
      })
    );
  });

  await test("Coordinador puede crear equipos de su club", async () => {
    await assertSucceeds(
      setDoc(doc(coordA, "Equipos/eq-coord-new"), {
        nombre: "Infantil",
        clubId: "club-a",
      })
    );
  });

  await test("Superadmin asigna rol coordinador", async () => {
    await assertSucceeds(
      updateDoc(doc(superadmin, "Usuarios/coach-a"), {
        rol: "coordinador",
      })
    );
  });

  await test("Coordinador lista entrenadores de su club", async () => {
    const q = query(collection(coordA, "Usuarios"), where("clubId", "==", "club-a"));
    const snap = await assertSucceeds(getDocs(q));
    if (snap.size < 1) throw new Error("Expected at least one club user");
  });

  await test("Coordinador edita equipos de su club", async () => {
    await assertSucceeds(
      updateDoc(doc(coordA, "Equipos/eq-a"), {
        nombre: "Senior A",
        genero: "femenino",
        tipoCanasta: "grande",
      })
    );
  });

  await test("Coordinador no mueve un equipo a otro club", async () => {
    await assertFails(
      updateDoc(doc(coordA, "Equipos/eq-a"), {
        clubId: "club-b",
      })
    );
  });

  await test("Coordinador escribe escudo de su equipo", async () => {
    await assertSucceeds(
      setDoc(doc(coordA, "Logos/equipo_eq-a"), {
        tipo: "equipo",
        entityId: "eq-a",
        clubId: "club-a",
        logoUrl: "/logos/eq-a.png",
      })
    );
  });

  await test("Coordinador no pisa el escudo de un equipo de otro club", async () => {
    await assertFails(
      setDoc(doc(coordA, "Logos/equipo_eq-b"), {
        tipo: "equipo",
        entityId: "eq-b",
        clubId: "club-a",
        logoUrl: "/logos/hack.png",
      })
    );
  });

  await test("Coordinador no crea escudo con el id de otro equipo", async () => {
    await assertFails(
      setDoc(doc(coordA, "Logos/equipo_eq-b"), {
        tipo: "equipo",
        entityId: "eq-a",
        clubId: "club-a",
        logoUrl: "/logos/hack.png",
      })
    );
  });

  await test("Superadmin lee equipos de cualquier club", async () => {
    await assertSucceeds(getDoc(doc(superadmin, "Equipos/eq-b")));
  });

  await test("Entrenador no puede eliminar equipos", async () => {
    await assertFails(deleteDoc(doc(coachNew, "Equipos/eq-a")));
  });

  await test("Superadmin puede eliminar equipos", async () => {
    await assertSucceeds(deleteDoc(doc(superadmin, "Equipos/eq-b")));
  });

  await test("Superadmin lista jugadoras sin filtro", async () => {
    await assertSucceeds(getDocs(collection(superadmin, "Jugadoras")));
  });

  await test("Nuevo usuario se crea solo como entrenador", async () => {
    const newbie = testEnv.authenticatedContext("newbie").firestore();
    await assertSucceeds(
      setDoc(doc(newbie, "Usuarios/newbie"), {
        email: "newbie@test.com",
        rol: "entrenador",
        creadoEn: new Date(),
      })
    );
  });

  await test("Nuevo usuario no puede crearse como superadmin", async () => {
    const evil = testEnv.authenticatedContext("evil").firestore();
    await assertFails(
      setDoc(doc(evil, "Usuarios/evil"), {
        email: "evil@test.com",
        rol: "superadmin",
        creadoEn: new Date(),
      })
    );
  });

  await test("Nuevo usuario no puede asignarse club al crearse", async () => {
    const sneaky = testEnv.authenticatedContext("sneaky").firestore();
    await assertFails(
      setDoc(doc(sneaky, "Usuarios/sneaky"), {
        email: "sneaky@test.com",
        rol: "entrenador",
        clubId: "club-a",
        creadoEn: new Date(),
      })
    );
  });

  await test("Coordinador escribe escudo de su club en Logos", async () => {
    await assertSucceeds(
      setDoc(doc(coordA, "Logos/club_club-a"), {
        tipo: "club",
        entityId: "club-a",
        clubId: "club-a",
        logoUrl: "/logos/celta-femenino.png",
      })
    );
  });

  await test("Entrenador no escribe Logos", async () => {
    await assertFails(
      setDoc(doc(coachNew, "Logos/club_club-a"), {
        tipo: "club",
        entityId: "club-a",
        clubId: "club-a",
        logoUrl: "/logos/otro.png",
      })
    );
  });
} finally {
  await testEnv.cleanup();
}

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
