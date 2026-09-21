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

function uniqueClubIdsFromEquipos(equipos) {
  return [...new Set((equipos || []).map((equipo) => equipo.clubId).filter(Boolean))];
}

function listenDocs(queries, setData, setLoading) {
  if (!queries.length) {
    setData([]);
    setLoading(false);
    return () => {};
  }
  setLoading(true);
  const byQuery = queries.map(() => []);
  const unsubs = queries.map((q, index) =>
    onSnapshot(
      q,
      (snapshot) => {
        byQuery[index] = snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));
        const merged = [];
        const seen = new Set();
        byQuery.flat().forEach((item) => {
          if (seen.has(item.id)) return;
          seen.add(item.id);
          merged.push(item);
        });
        setData(merged);
        setLoading(false);
      },
      () => {
        byQuery[index] = [];
        setData(byQuery.flat());
        setLoading(false);
      }
    )
  );
  return () => unsubs.forEach((unsub) => unsub());
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
  const clubIdsKey = useMemo(
    () => uniqueClubIdsFromEquipos(equipos).sort().join(","),
    [equipos]
  );

  useEffect(() => {
    if (!enabled) {
      setJugadoras([]);
      setJugadorasLoading(false);
      return undefined;
    }

    if (clubId) {
      return listenDocs(
        [query(collection(db, "Jugadoras"), where("clubId", "==", clubId))],
        setJugadoras,
        setJugadorasLoading
      );
    }

    if (esSuperadmin) {
      const ids = clubIdsKey ? clubIdsKey.split(",") : [];
      if (!ids.length) {
        setJugadoras([]);
        setJugadorasLoading(false);
        return undefined;
      }
      return listenDocs(
        ids.map((id) => query(collection(db, "Jugadoras"), where("clubId", "==", id))),
        setJugadoras,
        setJugadorasLoading
      );
    }

    setJugadoras([]);
    setJugadorasLoading(false);
    return undefined;
  }, [enabled, clubId, esSuperadmin, clubIdsKey]);

  useEffect(() => {
    if (!enabled) {
      setSesiones([]);
      setSesionesLoading(false);
      return undefined;
    }

    if (clubId) {
      const equipoIds = equipoIdsKey ? equipoIdsKey.split(",") : [];
      const chunks = chunkIds(equipoIds);
      const queries = [query(collection(db, "Sesiones"), where("clubId", "==", clubId))];
      chunks.forEach((chunk) => {
        queries.push(query(collection(db, "Sesiones"), where("equipoId", "in", chunk)));
      });
      return listenDocs(queries, setSesiones, setSesionesLoading);
    }

    if (esSuperadmin) {
      const ids = clubIdsKey ? clubIdsKey.split(",") : [];
      if (!ids.length) {
        setSesiones([]);
        setSesionesLoading(false);
        return undefined;
      }
      return listenDocs(
        ids.map((id) => query(collection(db, "Sesiones"), where("clubId", "==", id))),
        setSesiones,
        setSesionesLoading
      );
    }

    const equipoIds = equipoIdsKey ? equipoIdsKey.split(",") : [];
    const chunks = chunkIds(equipoIds);
    if (!chunks.length) {
      setSesiones([]);
      setSesionesLoading(false);
      return undefined;
    }
    return listenDocs(
      chunks.map((chunk) => query(collection(db, "Sesiones"), where("equipoId", "in", chunk))),
      setSesiones,
      setSesionesLoading
    );
  }, [enabled, clubId, esSuperadmin, clubIdsKey, equipoIdsKey]);

  return { jugadoras, sesiones, loading: jugadorasLoading || sesionesLoading };
}
