import { useState, useEffect, useMemo } from "react";
import { db } from "../firebase";
import { collection, onSnapshot, query, where } from "firebase/firestore";

function sortEquipos(lista) {
  return [...(lista || [])].sort((a, b) =>
    (a.nombre || "").localeCompare(b.nombre || "", "es")
  );
}

export function useJugadorasClub({ clubId, enabled, equipos = null, setErrorMsg }) {
  const [jugadorasClub, setJugadorasClub] = useState([]);
  const [equiposLocal, setEquiposLocal] = useState([]);
  const [jugadorasClubLoading, setJugadorasClubLoading] = useState(false);
  const usaEquiposPadre = Array.isArray(equipos);

  const equiposClub = useMemo(() => {
    if (!usaEquiposPadre) return equiposLocal;
    return sortEquipos((equipos || []).filter((equipo) => !clubId || equipo.clubId === clubId));
  }, [usaEquiposPadre, equipos, equiposLocal, clubId]);

  useEffect(() => {
    if (!enabled || !clubId) {
      setJugadorasClub([]);
      setEquiposLocal([]);
      setJugadorasClubLoading(false);
      return;
    }

    setJugadorasClubLoading(true);
    let unsubEquipos = () => {};
    if (!usaEquiposPadre) {
      unsubEquipos = onSnapshot(
        query(collection(db, "Equipos"), where("clubId", "==", clubId)),
        (snapshot) => {
          const lista = snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));
          setEquiposLocal(sortEquipos(lista));
        },
        () => setEquiposLocal([])
      );
    }

    const unsubJugadoras = onSnapshot(
      query(collection(db, "Jugadoras"), where("clubId", "==", clubId)),
      (snapshot) => {
        const lista = snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));
        lista.sort((a, b) => (a.nombre || "").localeCompare(b.nombre || "", "es"));
        setJugadorasClub(lista);
        setJugadorasClubLoading(false);
      },
      (err) => {
        setJugadorasClub([]);
        setJugadorasClubLoading(false);
        if (err?.code === "permission-denied") {
          setErrorMsg?.("No tienes permiso para buscar jugadoras del club.");
        }
      }
    );

    return () => {
      unsubEquipos();
      unsubJugadoras();
    };
  }, [clubId, enabled, setErrorMsg, usaEquiposPadre]);

  return { jugadorasClub, equiposClub, jugadorasClubLoading };
}
