import { useState, useEffect } from "react";
import { db } from "../firebase";
import {
  doc,
  collection,
  addDoc,
  onSnapshot,
  updateDoc,
  deleteDoc,
  query,
  where,
} from "firebase/firestore";
import { getEquipoLabels, dorsalEstaOcupado } from "../lib/appUtils.js";
import { useConfirm } from "../components/ConfirmProvider.jsx";

export function usePlantilla({ equipoActivo, userData, setErrorMsg }) {
  const confirm = useConfirm();
  const [jugadoras, setJugadoras] = useState([]);
  const [jugadorasLoading, setJugadorasLoading] = useState(false);
  const [jugadoraNombre, setJugadoraNombre] = useState("");
  const [jugadoraDorsal, setJugadoraDorsal] = useState("");
  const [jugadoraApodo, setJugadoraApodo] = useState("");
  const [addJugadoraLoading, setAddJugadoraLoading] = useState(false);
  const [jugadoraEditandoId, setJugadoraEditandoId] = useState(null);
  const [editJugadoraNombre, setEditJugadoraNombre] = useState("");
  const [editJugadoraDorsal, setEditJugadoraDorsal] = useState("");
  const [editJugadoraApodo, setEditJugadoraApodo] = useState("");
  const [editJugadoraLoading, setEditJugadoraLoading] = useState(false);

  useEffect(() => {
    setJugadoras([]);
    setJugadoraNombre("");
    setJugadoraDorsal("");
    setJugadoraApodo("");
    setAddJugadoraLoading(false);
    setJugadoraEditandoId(null);
    setEditJugadoraNombre("");
    setEditJugadoraDorsal("");
    setEditJugadoraApodo("");
    setEditJugadoraLoading(false);
  }, [equipoActivo]);

  useEffect(() => {
    let unsub;
    if (equipoActivo && (userData?.clubId || userData?.rol === "superadmin")) {
      setJugadorasLoading(true);
      const jugadorasCol = collection(db, "Jugadoras");
      const q = query(jugadorasCol, where("equipoId", "==", equipoActivo.id));

      unsub = onSnapshot(
        q,
        (snapshot) => {
          const docs = snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));
          docs.sort((a, b) => a.dorsal - b.dorsal);
          setJugadoras(docs);
          setJugadorasLoading(false);
        },
        (err) => {
          setJugadoras([]);
          setJugadorasLoading(false);
          if (err?.code === "permission-denied") {
            setErrorMsg("No tienes permiso para ver la plantilla de este equipo.");
          } else if (err?.message) {
            setErrorMsg(`Error cargando plantilla: ${err.message}`);
          }
        }
      );
    } else {
      setJugadoras([]);
    }
    return () => {
      if (typeof unsub === "function") unsub();
    };
  }, [equipoActivo, userData?.clubId, userData?.rol, setErrorMsg]);

  const handleAddJugadora = async (e) => {
    e.preventDefault();
    const clubIdEquipo = equipoActivo?.clubId || userData?.clubId;
    if (!equipoActivo || !clubIdEquipo) return;
    if (!jugadoraNombre.trim() || !jugadoraDorsal.trim()) return;
    if (dorsalEstaOcupado(jugadoras, jugadoraDorsal)) {
      setErrorMsg(getEquipoLabels(equipoActivo?.genero).errorDorsalDuplicado);
      return;
    }
    setAddJugadoraLoading(true);
    setErrorMsg("");
    try {
      await addDoc(collection(db, "Jugadoras"), {
        nombre: jugadoraNombre.trim(),
        dorsal: Number(jugadoraDorsal),
        apodo: jugadoraApodo.trim(),
        equipoId: equipoActivo.id,
        clubId: clubIdEquipo,
        creadoEn: new Date(),
      });
      setJugadoraNombre("");
      setJugadoraDorsal("");
      setJugadoraApodo("");
    } catch {
      setErrorMsg(getEquipoLabels(equipoActivo?.genero).errorAnadirJugador);
    }
    setAddJugadoraLoading(false);
  };

  const handleEliminarJugadora = async (jugadora) => {
    const confirmar = await confirm({
      title: `¿Eliminar a ${jugadora.nombre} de la plantilla?`,
      text: "Desaparecerá de las próximas sesiones. El historial de estadísticas se queda.",
      confirmLabel: "Sí, eliminar",
    });
    if (!confirmar) return;
    setErrorMsg("");
    if (jugadoraEditandoId === jugadora.id) {
      setJugadoraEditandoId(null);
    }
    try {
      await deleteDoc(doc(db, "Jugadoras", jugadora.id));
    } catch {
      setErrorMsg(getEquipoLabels(equipoActivo?.genero).errorEliminarJugador);
    }
  };

  const handleIniciarEditJugadora = (jugadora) => {
    setJugadoraEditandoId(jugadora.id);
    setEditJugadoraNombre(jugadora.nombre || "");
    setEditJugadoraDorsal(String(jugadora.dorsal ?? ""));
    setEditJugadoraApodo(jugadora.apodo || "");
    setErrorMsg("");
  };

  const handleCancelarEditJugadora = () => {
    setJugadoraEditandoId(null);
    setEditJugadoraNombre("");
    setEditJugadoraDorsal("");
    setEditJugadoraApodo("");
  };

  const handleGuardarJugadora = async (jugadoraId) => {
    if (!editJugadoraNombre.trim() || !editJugadoraDorsal.trim()) return;
    if (dorsalEstaOcupado(jugadoras, editJugadoraDorsal, jugadoraId)) {
      setErrorMsg(getEquipoLabels(equipoActivo?.genero).errorDorsalDuplicado);
      return;
    }
    setEditJugadoraLoading(true);
    setErrorMsg("");
    try {
      await updateDoc(doc(db, "Jugadoras", jugadoraId), {
        nombre: editJugadoraNombre.trim(),
        dorsal: Number(editJugadoraDorsal),
        apodo: editJugadoraApodo.trim(),
      });
      handleCancelarEditJugadora();
    } catch {
      setErrorMsg("No se pudo guardar los cambios.");
    }
    setEditJugadoraLoading(false);
  };

  return {
    jugadoras,
    jugadorasLoading,
    jugadoraNombre,
    setJugadoraNombre,
    jugadoraDorsal,
    setJugadoraDorsal,
    jugadoraApodo,
    setJugadoraApodo,
    addJugadoraLoading,
    jugadoraEditandoId,
    editJugadoraNombre,
    setEditJugadoraNombre,
    editJugadoraDorsal,
    setEditJugadoraDorsal,
    editJugadoraApodo,
    setEditJugadoraApodo,
    editJugadoraLoading,
    handleAddJugadora,
    handleEliminarJugadora,
    handleIniciarEditJugadora,
    handleCancelarEditJugadora,
    handleGuardarJugadora,
  };
}
