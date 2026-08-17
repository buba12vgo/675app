import admin from "firebase-admin";
import {
  DEMO_CLUB_NAMES,
  TEAM_NAMES,
  TEAMS_PER_CLUB,
  PLAYERS_PER_TEAM,
  ENTRENOS_PER_TEAM,
  PARTIDOS_PER_TEAM,
  TEMATICAS,
  EJERCICIOS,
  RIVALES,
  APOYOS,
} from "../src/seedDemoData.js";

function pick(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function formatDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function buildRandomDates(count, existingDates) {
  const dates = new Set(existingDates);
  const result = [];
  let attempts = 0;

  while (result.length < count && attempts < count * 20) {
    attempts += 1;
    const daysAgo = randomInt(1, 90);
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    const key = formatDate(date);
    if (!dates.has(key)) {
      dates.add(key);
      result.push(key);
    }
  }

  return result.sort();
}

function buildPlayerName(index) {
  const firstNames = [
    "Lucía", "María", "Paula", "Sara", "Claudia", "Laura", "Elena", "Noelia",
    "Andrea", "Cristina", "Beatriz", "Irene", "Marta", "Silvia", "Raquel",
  ];
  const lastNames = [
    "García", "López", "Martínez", "Sánchez", "Pérez", "González", "Ruiz",
    "Díaz", "Hernández", "Muñoz", "Romero", "Navarro", "Torres", "Domínguez",
  ];
  const first = firstNames[(index + randomInt(0, firstNames.length - 1)) % firstNames.length];
  const last = lastNames[(index * 3 + randomInt(0, lastNames.length - 1)) % lastNames.length];
  return `${first} ${last}`;
}

function buildAsistenciasAndValoraciones(jugadoraIds) {
  const asistencias = {};
  const valoraciones = {};

  jugadoraIds.forEach((id) => {
    const presente = Math.random() > 0.25;
    asistencias[id] = presente;
    if (presente) {
      valoraciones[id] = randomInt(3, 5);
    }
  });

  return { asistencias, valoraciones };
}

function groupBy(items, key) {
  return items.reduce((map, item) => {
    const groupKey = item[key];
    if (!map.has(groupKey)) map.set(groupKey, []);
    map.get(groupKey).push(item);
    return map;
  }, new Map());
}

async function commitBatch(db, operations) {
  const chunkSize = 400;
  for (let i = 0; i < operations.length; i += chunkSize) {
    const batch = db.batch();
    operations.slice(i, i + chunkSize).forEach((op) => {
      batch.set(op.ref, op.data);
    });
    await batch.commit();
  }
}

async function seedWithAdmin(db) {
  const [clubSnap, equiposSnap, jugadorasSnap, sesionesSnap] = await Promise.all([
    db.collection("Clubes").get(),
    db.collection("Equipos").get(),
    db.collection("Jugadoras").get(),
    db.collection("Sesiones").get(),
  ]);

  let clubes = clubSnap.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));

  if (clubes.length === 0) {
    for (const nombre of DEMO_CLUB_NAMES) {
      const ref = await db.collection("Clubes").add({ nombre, creadoEn: new Date() });
      clubes.push({ id: ref.id, nombre });
    }
  }

  const equiposByClub = groupBy(
    equiposSnap.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() })),
    "clubId"
  );
  const jugadorasByEquipo = groupBy(
    jugadorasSnap.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() })),
    "equipoId"
  );
  const sesionesByEquipo = groupBy(
    sesionesSnap.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() })),
    "equipoId"
  );

  const summary = {
    clubes: clubes.length,
    equiposCreados: 0,
    jugadorasCreadas: 0,
    sesionesCreadas: 0,
  };

  const operations = [];

  for (const club of clubes) {
    let teams = [...(equiposByClub.get(club.id) || [])];
    const usedTeamNames = new Set(teams.map((team) => team.nombre));

    for (const teamName of TEAM_NAMES) {
      if (teams.length >= TEAMS_PER_CLUB) break;
      if (usedTeamNames.has(teamName)) continue;

      const teamRef = db.collection("Equipos").doc();
      operations.push({
        ref: teamRef,
        data: { nombre: teamName, clubId: club.id, creadoEn: new Date() },
      });
      teams.push({ id: teamRef.id, nombre: teamName, clubId: club.id, _pending: true });
      usedTeamNames.add(teamName);
      summary.equiposCreados += 1;
    }

    teams = teams.slice(0, TEAMS_PER_CLUB);

    for (const team of teams) {
      let players = team._pending ? [] : [...(jugadorasByEquipo.get(team.id) || [])];
      const usedDorsals = new Set(players.map((player) => Number(player.dorsal)));

      for (let dorsal = 1; dorsal <= PLAYERS_PER_TEAM; dorsal += 1) {
        if (players.length >= PLAYERS_PER_TEAM) break;
        if (usedDorsals.has(dorsal)) continue;

        const playerRef = db.collection("Jugadoras").doc();
        operations.push({
          ref: playerRef,
          data: {
            nombre: buildPlayerName(dorsal),
            dorsal,
            apodo: Math.random() > 0.45 ? pick(APOYOS) : "",
            equipoId: team.id,
            clubId: club.id,
            creadoEn: new Date(),
          },
        });
        players.push({ id: playerRef.id, dorsal });
        usedDorsals.add(dorsal);
        summary.jugadorasCreadas += 1;
      }

      const playerIds = players.map((player) => player.id);
      const existingDates = team._pending
        ? []
        : (sesionesByEquipo.get(team.id) || []).map((session) => session.fecha).filter(Boolean);
      const entrenoDates = buildRandomDates(ENTRENOS_PER_TEAM, existingDates);
      const partidoDates = buildRandomDates(PARTIDOS_PER_TEAM, [...existingDates, ...entrenoDates]);

      entrenoDates.forEach((fecha) => {
        const { asistencias, valoraciones } = buildAsistenciasAndValoraciones(playerIds);
        operations.push({
          ref: db.collection("Sesiones").doc(`${team.id}_${fecha}`),
          data: {
            equipoId: team.id,
            fecha,
            tipo: "entreno",
            tematica: pick(TEMATICAS),
            ejercicios: pick(EJERCICIOS),
            rival: "",
            local: "casa",
            asistencias,
            valoraciones,
            jugadorasExternas: [],
            creadoEn: new Date(),
          },
        });
        summary.sesionesCreadas += 1;
      });

      partidoDates.forEach((fecha) => {
        const { asistencias, valoraciones } = buildAsistenciasAndValoraciones(playerIds);
        operations.push({
          ref: db.collection("Sesiones").doc(`${team.id}_${fecha}`),
          data: {
            equipoId: team.id,
            fecha,
            tipo: "partido",
            tematica: "",
            ejercicios: "",
            rival: pick(RIVALES),
            local: Math.random() > 0.5 ? "casa" : "fuera",
            asistencias,
            valoraciones,
            jugadorasExternas: [],
            creadoEn: new Date(),
          },
        });
        summary.sesionesCreadas += 1;
      });
    }
  }

  await commitBatch(db, operations);
  return summary;
}

async function main() {
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
      projectId: "app-33232",
    });
  }

  const db = admin.firestore();
  console.log("Generando datos de prueba en Firestore…");
  const summary = await seedWithAdmin(db);
  console.log("Listo:");
  console.log(`- Clubes procesados: ${summary.clubes}`);
  console.log(`- Equipos creados: ${summary.equiposCreados}`);
  console.log(`- Jugadoras creadas: ${summary.jugadorasCreadas}`);
  console.log(`- Sesiones creadas: ${summary.sesionesCreadas}`);
}

main().catch((error) => {
  console.error("Error generando datos de prueba:", error.message);
  console.error("Usa el botón 'Generar datos de prueba' en la app como superadmin, o configura GOOGLE_APPLICATION_CREDENTIALS.");
  process.exit(1);
});
