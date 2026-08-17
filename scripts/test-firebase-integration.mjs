import { initializeApp, deleteApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDf95t7VelZoS1GGPReM0H_soCjgDVmJ9M",
  authDomain: "app-33232.firebaseapp.com",
  projectId: "app-33232",
};

const coachEmail = process.env.TEST_COACH_EMAIL || "entrenador@test.com";
const coachPassword = process.env.TEST_COACH_PASSWORD || "123456";

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

function expectTruthy(value, msg) {
  if (!value) throw new Error(msg || "Expected truthy value");
}

function expectGte(actual, min, msg) {
  if (!(actual >= min)) throw new Error(msg || `Expected ${actual} >= ${min}`);
}

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

await signInWithEmailAndPassword(auth, coachEmail, coachPassword);
const userSnap = await getDoc(doc(db, "Usuarios", auth.currentUser.uid));
const user = userSnap.data();

await test("INT-01 entrenador tiene clubId asignado", async () => {
  expectTruthy(user?.clubId, "clubId missing on coach user");
});

await test("INT-02 entrenador lee equipos de su club", async () => {
  const equipos = await getDocs(
    query(collection(db, "Equipos"), where("clubId", "==", user.clubId))
  );
  expectGte(equipos.size, 1, "Coach should see at least one team");
});

const equiposSnap = await getDocs(
  query(collection(db, "Equipos"), where("clubId", "==", user.clubId))
);
const firstTeam = equiposSnap.docs[0];

if (firstTeam) {
  await test("INT-03 entrenador lee jugadoras del equipo", async () => {
    const jugadoras = await getDocs(
      query(collection(db, "Jugadoras"), where("equipoId", "==", firstTeam.id))
    );
    expectGte(jugadoras.size, 1, "Coach should read roster for own team");
  });

  await test("INT-04 entrenador lee sesiones del calendario", async () => {
    const sesiones = await getDocs(
      query(collection(db, "Sesiones"), where("equipoId", "==", firstTeam.id))
    );
    expectGte(sesiones.size, 1, "Coach should read sessions for own team");
  });

  await test("INT-05 entrenador no lista equipos de otro club", async () => {
    const allClubes = await getDocs(collection(db, "Clubes"));
    const otroClub = allClubes.docs.find((d) => d.id !== user.clubId);
    if (!otroClub) return;
    let denied = false;
    try {
      await getDocs(query(collection(db, "Equipos"), where("clubId", "==", otroClub.id)));
    } catch (e) {
      denied = e.code === "permission-denied";
    }
    expectTruthy(denied, "Coach must not list other club teams");
  });
}

console.log(`\n${passed} passed, ${failed} failed`);
await deleteApp(app);
process.exit(failed > 0 ? 1 : 0);
