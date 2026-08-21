import { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, onSnapshot, query, where } from "firebase/firestore";

export function useJugadorasClub({ clubId, enabled, setErrorMsg }) {
  const [jugadorasClub, setJugadorasClub] = useState([]);
  const [equiposClub, setEquiposClub] = useState([]);
  const [jugadorasClubLoading, setJugadorasClubLoading] = useState(false);

  useEffect(() => {
    if (!enabled || !clubId) {
      setJugadorasClub([]);
      setEquiposClub([]);
      setJugadorasClubLoading(false);
      return;
    }

    setJugadorasClubLoading(true);
    const unsubEquipos = onSnapshot(
      query(collection(db, "Equipos"), where("clubId", "==", clubId)),
      (snapshot) => {
        const lista = snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));
        lista.sort((a, b) => (a.nombre || "").localeCompare(b.nombre || "", "es"));
        setEquiposClub(lista);
      },
      () => setEquiposClub([])
    );

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
  }, [clubId, enabled, setErrorMsg]);

  return { jugadorasClub, equiposClub, jugadorasClubLoading };
}
