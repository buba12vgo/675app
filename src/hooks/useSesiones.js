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
import {
  buildSesionDocId,
  canCreateTipoSesion,
  diaTieneSesionTactica,
  diaTieneTipo,
  normalizarTipoSesion,
  sesionesDelDia as filtrarSesionesDelDia,
  sugerirFechaLibre,
  TIPO_SESION_ENTRENO,
  TIPO_SESION_FISICO,
  TIPO_SESION_PARTIDO,
} from "../lib/appUtils.js";
import { resetCamposSesion } from "../lib/sessionUtils.js";
import { normalizeExternasIds } from "../lib/jugadorasClub.js";
import { normalizeMotivosAusenciaMap, motivoAusenciaParaGuardar } from "../lib/motivosAusencia.js";
import {
  normalizePlanificacionSextos,
  planificacionParaGuardar,
  toggleSexto,
} from "../lib/planificacionSextos.js";

function aplicarSesionAlEstado(data, id, setters) {
  const {
    setSesionDoc,
    setSesionId,
    setTematica,
    setEjercicios,
    setAsistencias,
    setValoraciones,
    setTipoSesion,
    setRivalPartido,
    setLocalPartido,
    setJugadorasExternasIds,
    setMotivosAusencia,
    setPlanificacionSextos,
  } = setters;
  setSesionDoc(data);
  setSesionId(id);
  setTematica(data.tematica || "");
  setEjercicios(data.ejercicios || "");
  setAsistencias(data.asistencias || {});
  setValoraciones(data.valoraciones || {});
  setTipoSesion(normalizarTipoSesion(data));
  setRivalPartido(data.rival || "");
  setLocalPartido(data.local === "fuera" ? "fuera" : "casa");
  setJugadorasExternasIds(normalizeExternasIds(data.jugadorasExternas));
  setMotivosAusencia(normalizeMotivosAusenciaMap(data.motivosAusencia));
  setPlanificacionSextos(normalizePlanificacionSextos(data.planificacionSextos));
}

export function useSesiones({ equipoActivo, userData, setErrorMsg, jugadoras, tab, setTab }) {
  const [sesionCargando, setSesionCargando] = useState(false);
  const [sesionDoc, setSesionDoc] = useState(null);
  const [sesionId, setSesionId] = useState(null);
  const [tematica, setTematica] = useState("");
  const [ejercicios, setEjercicios] = useState("");
  const [asistencias, setAsistencias] = useState({});
  const [valoraciones, setValoraciones] = useState({});
  const [guardandoSesion, setGuardandoSesion] = useState(false);
  const [tipoSesion, setTipoSesion] = useState(TIPO_SESION_ENTRENO);
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
  const [planificacionSextos, setPlanificacionSextos] = useState({});
  const [pendingSelectTipo, setPendingSelectTipo] = useState(null);

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
    setPlanificacionSextos,
  };

  const formSetters = {
    setSesionDoc,
    setSesionId,
    ...sesionSetters,
  };

  const rol = userData?.rol;
  const sesionesDiaActual = fechaSesionSeleccionada
    ? filtrarSesionesDelDia(sesionesEquipo, fechaSesionSeleccionada)
    : [];

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
          const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
          const preferTipo = pendingSelectTipo;
          setPendingSelectTipo(null);
          let elegido = null;
          if (preferTipo) {
            elegido = docs.find((d) => normalizarTipoSesion(d) === preferTipo) || null;
          } else if (docs.length === 1) {
            elegido = docs[0];
          }
          if (elegido) {
            aplicarSesionAlEstado(elegido, elegido.id, formSetters);
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
    // pendingSelectTipo is consumed intentionally on fecha/tab change
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
  }, [fechaSesionSeleccionada, sesionId]);

  const seleccionarSesion = (sesion) => {
    if (!sesion) return;
    aplicarSesionAlEstado(sesion, sesion.id, formSetters);
  };

  const cerrarSesionFormulario = () => {
    setSesionDoc(null);
    setSesionId(null);
    resetCamposSesion(sesionSetters);
    setSesionGuardadaNotice("");
  };

  const resetSesionPanel = () => {
    setFechaSesionSeleccionada(null);
    setSesionDoc(null);
    setSesionId(null);
    setPendingSelectTipo(null);
    resetCamposSesion(sesionSetters);
    setSesionCargando(false);
    setGuardandoSesion(false);
    setErrorMsg("");
  };

  const handleCrearSesion = async (tipo = TIPO_SESION_ENTRENO, fechaOverride = null) => {
    const fecha = fechaOverride || fechaSesionSeleccionada;
    if (!equipoActivo || !fecha) return;
    const tipoNorm = normalizarTipoSesion({ tipo });
    if (!canCreateTipoSesion(rol, tipoNorm)) {
      setErrorMsg("No tienes permiso para crear este tipo de sesión.");
      return;
    }
    if (tipoNorm === TIPO_SESION_FISICO) {
      if (diaTieneTipo(sesionesEquipo, fecha, TIPO_SESION_FISICO)) {
        setErrorMsg("Ya hay un entrenamiento físico este día.");
        return;
      }
    } else if (diaTieneSesionTactica(sesionesEquipo, fecha)) {
      setErrorMsg("Ya hay un entreno o partido este día.");
      return;
    }

    setGuardandoSesion(true);
    setErrorMsg("");
    try {
      const asist = {};
      const vals = {};
      jugadoras.forEach((j) => {
        asist[j.id] = true;
        vals[j.id] = 3;
      });
      const docId = buildSesionDocId(equipoActivo.id, fecha, tipoNorm);
      const sesionDocRef = doc(db, "Sesiones", docId);
      await setDoc(sesionDocRef, {
        equipoId: equipoActivo.id,
        fecha,
        tipo: tipoNorm,
        tematica: "",
        ejercicios: "",
        rival: "",
        local: "casa",
        asistencias: asist,
        valoraciones: vals,
        jugadorasExternas: [],
        motivosAusencia: {},
        planificacionSextos: {},
        creadoEn: new Date(),
      });
      const snap = await getDoc(sesionDocRef);
      if (snap.exists()) {
        aplicarSesionAlEstado(snap.data(), snap.id, formSetters);
        if (!fechaSesionSeleccionada) setFechaSesionSeleccionada(fecha);
      }
    } catch {
      setErrorMsg("Error creando la sesión.");
    }
    setGuardandoSesion(false);
  };

  const handleGuardarSesion = async () => {
    if (!equipoActivo || !fechaSesionSeleccionada || !sesionId) return;
    const tipoNorm = normalizarTipoSesion({ tipo: tipoSesion });
    if (!canCreateTipoSesion(rol, tipoNorm)) {
      setErrorMsg("No tienes permiso para editar esta sesión.");
      return;
    }
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
      const idsConvocadas = idsSesion.filter((id) => asistenciasLimpias[id]);
      const planificacionLimpia = planificacionParaGuardar(planificacionSextos, idsConvocadas);
      const sesionDocRef = doc(db, "Sesiones", sesionId);
      const payload = {
        equipoId: equipoActivo.id,
        fecha: fechaSesionSeleccionada,
        tipo: tipoNorm,
        asistencias: asistenciasLimpias,
        valoraciones: valoracionesFiltradas,
        motivosAusencia: motivosLimpios,
        jugadorasExternas: idsExternas,
        actualizadoEn: new Date(),
      };
      if (tipoNorm === TIPO_SESION_PARTIDO) {
        payload.rival = rivalPartido.trim();
        payload.local = localPartido;
        payload.tematica = "";
        payload.ejercicios = "";
        payload.planificacionSextos = planificacionLimpia;
      } else {
        payload.tematica = tematica;
        payload.ejercicios = ejercicios;
        payload.rival = "";
        payload.local = "casa";
        if (tipoNorm === TIPO_SESION_FISICO) {
          payload.planificacionSextos = {};
        }
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
    if (!equipoActivo || !fechaSesionSeleccionada || !sesionDoc || !sesionId) return;
    if (!canCreateTipoSesion(rol, normalizarTipoSesion(sesionDoc))) {
      setErrorMsg("No tienes permiso para eliminar esta sesión.");
      return;
    }
    setGuardandoSesion(true);
    setErrorMsg("");
    setSesionGuardadaNotice("");
    try {
      await deleteDoc(doc(db, "Sesiones", sesionId));
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
    setPlanificacionSextos((prev) => {
      const next = { ...prev };
      delete next[jugadoraId];
      return next;
    });
  };

  const handleToggleSexto = (jugadoraId, sexto) => {
    setPlanificacionSextos((prev) => toggleSexto(prev, jugadoraId, sexto));
  };

  const programarDesdeInicio = async (tipo) => {
    if (!equipoActivo || guardandoSesion) return;
    const tipoNorm = normalizarTipoSesion({ tipo });
    if (!canCreateTipoSesion(rol, tipoNorm)) {
      setErrorMsg("No tienes permiso para programar este tipo de sesión.");
      return;
    }
    const fecha = sugerirFechaLibre(sesionesEquipo, tipoNorm);
    const [y, m] = fecha.split("-").map(Number);
    setAnioActual(y);
    setMesActual(m - 1);
    setPendingSelectTipo(tipoNorm);
    setFechaSesionSeleccionada(fecha);
    setTab("sesiones");
    await handleCrearSesion(tipoNorm, fecha);
  };

  const abrirSesionEnCalendario = (fecha, tipoPreferido = null) => {
    if (!fecha) return;
    const [y, m] = fecha.split("-").map(Number);
    setAnioActual(y);
    setMesActual(m - 1);
    setPendingSelectTipo(tipoPreferido ? normalizarTipoSesion({ tipo: tipoPreferido }) : null);
    setFechaSesionSeleccionada(fecha);
    setTab("sesiones");
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
    sesionesDiaActual,
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
    planificacionSextos,
    handleToggleSexto,
    sesionGuardadaNotice,
    programarDesdeInicio,
    resetSesionPanel,
    seleccionarSesion,
    cerrarSesionFormulario,
    abrirSesionEnCalendario,
  };
}
