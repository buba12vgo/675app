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
import {
  ROL_PLANTILLA_JUGADOR,
  dorsalParaGuardar,
  esJugadorPlantilla,
  normalizeRolPlantilla,
  ordenarPlantilla,
} from "../lib/plantillaRoles.js";

export function usePlantilla({ equipoActivo, userData, setErrorMsg }) {
  const confirm = useConfirm();
  const [jugadoras, setJugadoras] = useState([]);
  const [jugadorasLoading, setJugadorasLoading] = useState(false);
  const [jugadoraNombre, setJugadoraNombre] = useState("");
  const [jugadoraDorsal, setJugadoraDorsal] = useState("");
  const [jugadoraApodo, setJugadoraApodo] = useState("");
  const [jugadoraRol, setJugadoraRol] = useState(ROL_PLANTILLA_JUGADOR);
  const [addJugadoraLoading, setAddJugadoraLoading] = useState(false);
  const [jugadoraEditandoId, setJugadoraEditandoId] = useState(null);
  const [editJugadoraNombre, setEditJugadoraNombre] = useState("");
  const [editJugadoraDorsal, setEditJugadoraDorsal] = useState("");
  const [editJugadoraApodo, setEditJugadoraApodo] = useState("");
  const [editJugadoraRol, setEditJugadoraRol] = useState(ROL_PLANTILLA_JUGADOR);
  const [editJugadoraLoading, setEditJugadoraLoading] = useState(false);

  useEffect(() => {
    setJugadoras([]);
    setJugadoraNombre("");
    setJugadoraDorsal("");
    setJugadoraApodo("");
    setJugadoraRol(ROL_PLANTILLA_JUGADOR);
    setAddJugadoraLoading(false);
    setJugadoraEditandoId(null);
    setEditJugadoraNombre("");
    setEditJugadoraDorsal("");
    setEditJugadoraApodo("");
    setEditJugadoraRol(ROL_PLANTILLA_JUGADOR);
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
          setJugadoras(ordenarPlantilla(docs));
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
      setJugadorasLoading(false);
    }
    return () => {
      if (typeof unsub === "function") unsub();
    };
  }, [equipoActivo, userData?.clubId, userData?.rol, setErrorMsg]);

  const handleAddJugadora = async (e) => {
    e.preventDefault();
    const clubIdEquipo = equipoActivo?.clubId || userData?.clubId;
    if (!equipoActivo || !clubIdEquipo) return;
    const rol = normalizeRolPlantilla(jugadoraRol);
    const esJugador = rol === ROL_PLANTILLA_JUGADOR;
    if (!jugadoraNombre.trim()) return;
    const dorsal = esJugador ? dorsalParaGuardar(rol, jugadoraDorsal) : null;
    if (esJugador && dorsal == null) return;
    if (esJugador && dorsalEstaOcupado(jugadoras, dorsal)) {
      setErrorMsg(getEquipoLabels(equipoActivo?.genero).errorDorsalDuplicado);
      return;
    }
    setAddJugadoraLoading(true);
    setErrorMsg("");
    try {
      await addDoc(collection(db, "Jugadoras"), {
        nombre: jugadoraNombre.trim(),
        dorsal,
        apodo: jugadoraApodo.trim(),
        rolPlantilla: rol,
        equipoId: equipoActivo.id,
        clubId: clubIdEquipo,
        creadoEn: new Date(),
      });
      setJugadoraNombre("");
      setJugadoraDorsal("");
      setJugadoraApodo("");
      setJugadoraRol(ROL_PLANTILLA_JUGADOR);
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
    setEditJugadoraDorsal(esJugadorPlantilla(jugadora) ? String(jugadora.dorsal ?? "") : "");
    setEditJugadoraApodo(jugadora.apodo || "");
    setEditJugadoraRol(normalizeRolPlantilla(jugadora.rolPlantilla));
    setErrorMsg("");
  };

  const handleCancelarEditJugadora = () => {
    setJugadoraEditandoId(null);
    setEditJugadoraNombre("");
    setEditJugadoraDorsal("");
    setEditJugadoraApodo("");
    setEditJugadoraRol(ROL_PLANTILLA_JUGADOR);
  };

  const handleGuardarJugadora = async (jugadoraId) => {
    if (!editJugadoraNombre.trim()) return;
    const rol = normalizeRolPlantilla(editJugadoraRol);
    const esJugador = rol === ROL_PLANTILLA_JUGADOR;
    const dorsal = esJugador ? dorsalParaGuardar(rol, editJugadoraDorsal) : null;
    if (esJugador && dorsal == null) return;
    if (esJugador && dorsalEstaOcupado(jugadoras, dorsal, jugadoraId)) {
      setErrorMsg(getEquipoLabels(equipoActivo?.genero).errorDorsalDuplicado);
      return;
    }
    setEditJugadoraLoading(true);
    setErrorMsg("");
    try {
      await updateDoc(doc(db, "Jugadoras", jugadoraId), {
        nombre: editJugadoraNombre.trim(),
        dorsal,
        apodo: editJugadoraApodo.trim(),
        rolPlantilla: rol,
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
    jugadoraRol,
    setJugadoraRol,
    addJugadoraLoading,
    jugadoraEditandoId,
    editJugadoraNombre,
    setEditJugadoraNombre,
    editJugadoraDorsal,
    setEditJugadoraDorsal,
    editJugadoraApodo,
    setEditJugadoraApodo,
    editJugadoraRol,
    setEditJugadoraRol,
    editJugadoraLoading,
    handleAddJugadora,
    handleEliminarJugadora,
    handleIniciarEditJugadora,
    handleCancelarEditJugadora,
    handleGuardarJugadora,
  };
}
