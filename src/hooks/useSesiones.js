import { useState, useEffect } from "react";
import { db } from "../firebase";
import {
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import { normalizarTipoSesion, sugerirFechaLibre } from "../lib/appUtils.js";
import { resetCamposSesion } from "../lib/sessionUtils.js";
import { normalizeExternasIds } from "../lib/jugadorasClub.js";
import { normalizeMotivosAusenciaMap, motivoAusenciaParaGuardar } from "../lib/motivosAusencia.js";

export function useSesiones({ equipoActivo, userData, setErrorMsg, jugadoras, tab, setTab }) {
  const [sesionCargando, setSesionCargando] = useState(false);
  const [sesionDoc, setSesionDoc] = useState(null);
  const [sesionId, setSesionId] = useState(null);
  const [tematica, setTematica] = useState("");
  const [ejercicios, setEjercicios] = useState("");
  const [asistencias, setAsistencias] = useState({});
  const [valoraciones, setValoraciones] = useState({});
  const [guardandoSesion, setGuardandoSesion] = useState(false);
  const [tipoSesion, setTipoSesion] = useState("entreno");
  const [rivalPartido, setRivalPartido] = useState("");
  const [localPartido, setLocalPartido] = useState("casa");
  const [sesionVista, setSesionVista] = useState("datos");
  const [sesionesEquipo, setSesionesEquipo] = useState([]);
  const [sesionesLoading, setSesionesLoading] = useState(false);
  const [mesActual, setMesActual] = useState(() => new Date().getMonth());
  const [anioActual, setAnioActual] = useState(() => new Date().getFullYear());
  const [fechaSesionSeleccionada, setFechaSesionSeleccionada] = useState(null);
  const [sesionGuardadaNotice, setSesionGuardadaNotice] = useState("");
  const [jugadorasExternasIds, setJugadorasExternasIds] = useState([]);
  const [motivosAusencia, setMotivosAusencia] = useState({});

  const sesionSetters = {
    setTematica,
    setEjercicios,
    setAsistencias,
    setValoraciones,
    setTipoSesion,
    setRivalPartido,
    setLocalPartido,
    setSesionVista,
    setJugadorasExternasIds,
    setMotivosAusencia,
  };

  useEffect(() => {
    let unsub;
    if (equipoActivo && (userData?.clubId || userData?.rol === "superadmin")) {
      setSesionesLoading(true);
      const sesionesCol = collection(db, "Sesiones");
      const q = query(sesionesCol, where("equipoId", "==", equipoActivo.id));
      unsub = onSnapshot(
        q,
        (snapshot) => {
          setSesionesEquipo(
            snapshot.docs.map((docSnap) => ({
              ...docSnap.data(),
              id: docSnap.id,
              fecha: docSnap.data().fecha,
            }))
          );
          setSesionesLoading(false);
        },
        (err) => {
          setSesionesEquipo([]);
          setSesionesLoading(false);
          if (err?.code === "permission-denied") {
            setErrorMsg("No tienes permiso para ver el calendario de este equipo.");
          }
        }
      );
    } else {
      setSesionesEquipo([]);
      setSesionesLoading(false);
    }
    return () => {
      if (typeof unsub === "function") unsub();
    };
  }, [equipoActivo, userData?.clubId, userData?.rol, setErrorMsg]);

  useEffect(() => {
    if (equipoActivo && fechaSesionSeleccionada && tab === "sesiones") {
      setSesionCargando(true);
      setSesionDoc(null);
      setSesionId(null);
      setTematica("");
      setEjercicios("");
      resetCamposSesion(sesionSetters);

      const fetchSesion = async () => {
        try {
          const sesionesCol = collection(db, "Sesiones");
          const qSesion = query(
            sesionesCol,
            where("equipoId", "==", equipoActivo.id),
            where("fecha", "==", fechaSesionSeleccionada)
          );
          const snap = await getDocs(qSesion);
          if (!snap.empty) {
            const docSesion = snap.docs[0];
            setSesionDoc(docSesion.data());
            setSesionId(docSesion.id);
            setTematica(docSesion.data().tematica || "");
            setEjercicios(docSesion.data().ejercicios || "");
            setAsistencias(docSesion.data().asistencias || {});
            setValoraciones(docSesion.data().valoraciones || {});
            setTipoSesion(normalizarTipoSesion(docSesion.data()));
            setRivalPartido(docSesion.data().rival || "");
            setLocalPartido(docSesion.data().local === "fuera" ? "fuera" : "casa");
            setJugadorasExternasIds(normalizeExternasIds(docSesion.data().jugadorasExternas));
            setMotivosAusencia(normalizeMotivosAusenciaMap(docSesion.data().motivosAusencia));
          } else {
            setSesionDoc(null);
            setSesionId(null);
            resetCamposSesion(sesionSetters);
          }
        } catch {
          setSesionDoc(null);
          setSesionId(null);
          resetCamposSesion(sesionSetters);
        }
        setSesionCargando(false);
      };
      fetchSesion();
    } else {
      setSesionDoc(null);
      setSesionId(null);
      resetCamposSesion(sesionSetters);
      setSesionCargando(false);
    }
  }, [equipoActivo, fechaSesionSeleccionada, tab]);

  useEffect(() => {
    if (!sesionDoc) return;
    const idsPlantilla = jugadoras.map((j) => j.id);
    const idsExternas = normalizeExternasIds(jugadorasExternasIds).filter((id) => !idsPlantilla.includes(id));
    const idsSesion = [...idsPlantilla, ...idsExternas];
    if (!idsSesion.length) return;

    setAsistencias((prevAsist) => {
      const nuevo = {};
      idsSesion.forEach((id) => {
        if (typeof prevAsist[id] !== "undefined") {
          nuevo[id] = prevAsist[id];
        } else {
          nuevo[id] = idsExternas.includes(id);
        }
      });
      return nuevo;
    });
    setValoraciones((prevVal) => {
      const nuevo = {};
      idsSesion.forEach((id) => {
        const val = prevVal[id];
        if (typeof val === "number" && val >= 1 && val <= 5) {
          nuevo[id] = val;
        }
      });
      return nuevo;
    });
    setMotivosAusencia((prevMotivos) => {
      const nuevo = {};
      idsSesion.forEach((id) => {
        const motivo = prevMotivos[id];
        if (motivo) nuevo[id] = motivo;
      });
      return nuevo;
    });
  }, [jugadoras, sesionDoc, jugadorasExternasIds]);

  useEffect(() => {
    if (!sesionDoc && jugadoras.length && fechaSesionSeleccionada && tab === "sesiones") {
      setAsistencias(() => {
        const nuevo = {};
        jugadoras.forEach((j) => {
          nuevo[j.id] = true;
        });
        return nuevo;
      });
      setValoraciones(() => {
        const nuevo = {};
        jugadoras.forEach((j) => {
          nuevo[j.id] = 3;
        });
        return nuevo;
      });
    }
  }, [jugadoras, sesionDoc, tab, fechaSesionSeleccionada]);

  useEffect(() => {
    setSesionVista("datos");
    setSesionGuardadaNotice("");
  }, [fechaSesionSeleccionada]);

  const resetSesionPanel = () => {
    setFechaSesionSeleccionada(null);
    setSesionDoc(null);
    setSesionId(null);
    resetCamposSesion(sesionSetters);
    setSesionCargando(false);
    setGuardandoSesion(false);
    setErrorMsg("");
  };

  const handleCrearSesion = async (tipo = "entreno", fechaOverride = null) => {
    const fecha = fechaOverride || fechaSesionSeleccionada;
    if (!equipoActivo || !fecha) return;
    setGuardandoSesion(true);
    setErrorMsg("");
    try {
      const asist = {};
      const vals = {};
      jugadoras.forEach((j) => {
        asist[j.id] = true;
        vals[j.id] = 3;
      });
      const sesionDocRef = doc(db, "Sesiones", `${equipoActivo.id}_${fecha}`);
      await setDoc(sesionDocRef, {
        equipoId: equipoActivo.id,
        fecha,
        tipo,
        tematica: "",
        ejercicios: "",
        rival: "",
        local: "casa",
        asistencias: asist,
        valoraciones: vals,
        jugadorasExternas: [],
        motivosAusencia: {},
        creadoEn: new Date(),
      });
      const snap = await getDoc(sesionDocRef);
      if (snap.exists()) {
        setSesionDoc(snap.data());
        setSesionId(snap.id);
        setAsistencias(asist);
        setValoraciones(vals);
        setTipoSesion(tipo);
        setRivalPartido("");
        setLocalPartido("casa");
        setTematica("");
        setEjercicios("");
        setJugadorasExternasIds([]);
        setMotivosAusencia({});
      }
    } catch {
      setErrorMsg("Error creando la sesión.");
    }
    setGuardandoSesion(false);
  };

  const handleGuardarSesion = async () => {
    if (!equipoActivo || !fechaSesionSeleccionada) return;
    setGuardandoSesion(true);
    setErrorMsg("");
    try {
      const idsPlantilla = jugadoras.map((j) => j.id);
      const idsExternas = normalizeExternasIds(jugadorasExternasIds).filter((id) => !idsPlantilla.includes(id));
      const idsSesion = [...idsPlantilla, ...idsExternas];
      const asistenciasLimpias = {};
      const valoracionesFiltradas = {};
      idsSesion.forEach((id) => {
        asistenciasLimpias[id] = !!asistencias[id];
        if (asistenciasLimpias[id] && typeof valoraciones[id] === "number") {
          valoracionesFiltradas[id] = valoraciones[id];
        }
      });
      const motivosLimpios = motivoAusenciaParaGuardar(asistenciasLimpias, motivosAusencia, idsSesion);
      const sesionDocRef = doc(db, "Sesiones", sesionId || `${equipoActivo.id}_${fechaSesionSeleccionada}`);
      const payload = {
        equipoId: equipoActivo.id,
        fecha: fechaSesionSeleccionada,
        tipo: tipoSesion,
        asistencias: asistenciasLimpias,
        valoraciones: valoracionesFiltradas,
        motivosAusencia: motivosLimpios,
        jugadorasExternas: idsExternas,
        actualizadoEn: new Date(),
      };
      if (tipoSesion === "partido") {
        payload.rival = rivalPartido.trim();
        payload.local = localPartido;
        payload.tematica = "";
        payload.ejercicios = "";
      } else {
        payload.tematica = tematica;
        payload.ejercicios = ejercicios;
        payload.rival = "";
        payload.local = "casa";
      }
      await updateDoc(sesionDocRef, payload);
      setSesionGuardadaNotice("Guardado");
      window.setTimeout(() => setSesionGuardadaNotice(""), 2500);
    } catch {
      setErrorMsg("Error guardando la sesión.");
    }
    setGuardandoSesion(false);
  };

  const handleEliminarSesion = async () => {
    if (!equipoActivo || !fechaSesionSeleccionada || !sesionDoc) return;
    setGuardandoSesion(true);
    setErrorMsg("");
    setSesionGuardadaNotice("");
    try {
      await deleteDoc(doc(db, "Sesiones", sesionId || `${equipoActivo.id}_${fechaSesionSeleccionada}`));
      setSesionDoc(null);
      setSesionId(null);
      resetCamposSesion(sesionSetters);
    } catch {
      setErrorMsg("No se pudo eliminar la sesión.");
    }
    setGuardandoSesion(false);
  };

  const handleAddJugadoraExterna = (jugadoraId) => {
    if (!jugadoraId || jugadoras.some((j) => j.id === jugadoraId)) return;
    setJugadorasExternasIds((prev) => {
      const ids = normalizeExternasIds(prev);
      if (ids.includes(jugadoraId)) return ids;
      return [...ids, jugadoraId];
    });
    setAsistencias((prev) => ({ ...prev, [jugadoraId]: true }));
    setValoraciones((prev) => ({
      ...prev,
      [jugadoraId]: typeof prev[jugadoraId] === "number" ? prev[jugadoraId] : 3,
    }));
    setMotivosAusencia((prev) => {
      const next = { ...prev };
      delete next[jugadoraId];
      return next;
    });
  };

  const handleRemoveJugadoraExterna = (jugadoraId) => {
    if (!jugadoraId) return;
    setJugadorasExternasIds((prev) => normalizeExternasIds(prev).filter((id) => id !== jugadoraId));
    setAsistencias((prev) => {
      const next = { ...prev };
      delete next[jugadoraId];
      return next;
    });
    setValoraciones((prev) => {
      const next = { ...prev };
      delete next[jugadoraId];
      return next;
    });
    setMotivosAusencia((prev) => {
      const next = { ...prev };
      delete next[jugadoraId];
      return next;
    });
  };

  const programarDesdeInicio = async (tipo) => {
    if (!equipoActivo || guardandoSesion) return;
    const fecha = sugerirFechaLibre(sesionesEquipo);
    const [y, m] = fecha.split("-").map(Number);
    setAnioActual(y);
    setMesActual(m - 1);
    setFechaSesionSeleccionada(fecha);
    setTab("sesiones");
    await handleCrearSesion(tipo, fecha);
  };

  return {
    sesionCargando,
    sesionDoc,
    sesionId,
    tematica,
    setTematica,
    ejercicios,
    setEjercicios,
    asistencias,
    setAsistencias,
    valoraciones,
    setValoraciones,
    motivosAusencia,
    setMotivosAusencia,
    guardandoSesion,
    tipoSesion,
    setTipoSesion,
    rivalPartido,
    setRivalPartido,
    localPartido,
    setLocalPartido,
    sesionVista,
    setSesionVista,
    sesionesEquipo,
    sesionesLoading,
    mesActual,
    setMesActual,
    anioActual,
    setAnioActual,
    fechaSesionSeleccionada,
    setFechaSesionSeleccionada,
    handleCrearSesion,
    handleGuardarSesion,
    handleEliminarSesion,
    handleAddJugadoraExterna,
    handleRemoveJugadoraExterna,
    jugadorasExternasIds,
    sesionGuardadaNotice,
    programarDesdeInicio,
    resetSesionPanel,
  };
}
