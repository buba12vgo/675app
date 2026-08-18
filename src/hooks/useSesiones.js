import { useState, useEffect } from "react";
import { db } from "../firebase";
import {
  doc,
  getDoc,
  getDocs,
  setDoc,
  collection,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import { normalizarTipoSesion, sugerirFechaLibre } from "../lib/appUtils.js";
import { resetCamposSesion } from "../lib/sessionUtils.js";

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

  const sesionSetters = {
    setTematica,
    setEjercicios,
    setAsistencias,
    setValoraciones,
    setTipoSesion,
    setRivalPartido,
    setLocalPartido,
    setSesionVista,
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
    const lista = jugadoras;
    if (!lista.length) return;

    setAsistencias((prevAsist) => {
      const nuevo = {};
      lista.forEach((j) => {
        nuevo[j.id] = typeof prevAsist[j.id] !== "undefined" ? prevAsist[j.id] : false;
      });
      return nuevo;
    });
    setValoraciones((prevVal) => {
      const nuevo = {};
      lista.forEach((j) => {
        const val = prevVal[j.id];
        if (typeof val === "number" && val >= 1 && val <= 5) {
          nuevo[j.id] = val;
        }
      });
      return nuevo;
    });
  }, [jugadoras, sesionDoc]);

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
      const valoracionesFiltradas = {};
      jugadoras.forEach((j) => {
        if (asistencias[j.id] && typeof valoraciones[j.id] === "number") {
          valoracionesFiltradas[j.id] = valoraciones[j.id];
        }
      });
      const sesionDocRef = doc(db, "Sesiones", `${equipoActivo.id}_${fechaSesionSeleccionada}`);
      const payload = {
        equipoId: equipoActivo.id,
        fecha: fechaSesionSeleccionada,
        tipo: tipoSesion,
        asistencias,
        valoraciones: valoracionesFiltradas,
        jugadorasExternas: [],
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
      await setDoc(sesionDocRef, payload, { merge: true });
    } catch {
      setErrorMsg("Error guardando la sesión.");
    }
    setGuardandoSesion(false);
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
    programarDesdeInicio,
    resetSesionPanel,
  };
}
