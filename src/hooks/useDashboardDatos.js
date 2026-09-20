import { useEffect, useMemo, useState } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "../firebase";

const IN_LIMIT = 30;

function chunkIds(ids) {
  const unique = [...new Set((ids || []).filter(Boolean))];
  const chunks = [];
  for (let i = 0; i < unique.length; i += IN_LIMIT) chunks.push(unique.slice(i, i + IN_LIMIT));
  return chunks;
}

export function useDashboardDatos({ enabled, equipos = [], clubId = "", esSuperadmin = false }) {
  const [jugadoras, setJugadoras] = useState([]);
  const [sesiones, setSesiones] = useState([]);
  const [jugadorasLoading, setJugadorasLoading] = useState(false);
  const [sesionesLoading, setSesionesLoading] = useState(false);

  const equipoIdsKey = useMemo(
    () => (equipos || []).map((equipo) => equipo.id).filter(Boolean).sort().join(","),
    [equipos]
  );

  useEffect(() => {
    if (!enabled) {
      setJugadoras([]);
      setJugadorasLoading(false);
      return undefined;
    }

    const qJugadoras = esSuperadmin
      ? collection(db, "Jugadoras")
      : clubId
        ? query(collection(db, "Jugadoras"), where("clubId", "==", clubId))
        : null;

    if (!qJugadoras) {
      setJugadoras([]);
      setJugadorasLoading(false);
      return undefined;
    }

    setJugadorasLoading(true);
    const unsub = onSnapshot(
      qJugadoras,
      (snapshot) => {
        setJugadoras(snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() })));
        setJugadorasLoading(false);
      },
      () => {
        setJugadoras([]);
        setJugadorasLoading(false);
      }
    );
    return () => unsub();
  }, [enabled, clubId, esSuperadmin]);

  useEffect(() => {
    if (!enabled) {
      setSesiones([]);
      setSesionesLoading(false);
      return undefined;
    }

    if (esSuperadmin) {
      setSesionesLoading(true);
      const unsub = onSnapshot(
        collection(db, "Sesiones"),
        (snapshot) => {
          setSesiones(snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() })));
          setSesionesLoading(false);
        },
        () => {
          setSesiones([]);
          setSesionesLoading(false);
        }
      );
      return () => unsub();
    }

    const ids = equipoIdsKey ? equipoIdsKey.split(",") : [];
    const chunks = chunkIds(ids);
    if (chunks.length === 0) {
      setSesiones([]);
      setSesionesLoading(false);
      return undefined;
    }

    setSesionesLoading(true);
    const byChunk = chunks.map(() => []);
    const unsubs = chunks.map((chunk, index) =>
      onSnapshot(
        query(collection(db, "Sesiones"), where("equipoId", "in", chunk)),
        (snapshot) => {
          byChunk[index] = snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));
          setSesiones(byChunk.flat());
          setSesionesLoading(false);
        },
        () => {
          byChunk[index] = [];
          setSesiones(byChunk.flat());
          setSesionesLoading(false);
        }
      )
    );
    return () => unsubs.forEach((unsub) => unsub());
  }, [enabled, equipoIdsKey, esSuperadmin]);

  return { jugadoras, sesiones, loading: jugadorasLoading || sesionesLoading };
}
