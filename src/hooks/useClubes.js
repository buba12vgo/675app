import { useState, useEffect, useCallback } from "react";
import { db } from "../firebase";
import {
  doc,
  getDocs,
  collection,
  addDoc,
  onSnapshot,
  updateDoc,
  deleteField,
} from "firebase/firestore";
import { seedDemoData } from "../seedDemoData.js";
import { prepareLogoDataUrl, validateLogoFile, getLogoErrorMessage } from "../lib/logoImage.js";
import { resolveClubLogoUrl } from "../lib/clubLogoPresets.js";

export function useClubes({
  user,
  userData,
  setUserData,
  setErrorMsg,
  showOpcionesPanel,
  equipoActivo,
  equiposFiltroSuperadmin,
  setEquiposFiltroSuperadmin,
}) {
  const [clubes, setClubes] = useState([]);
  const [activeClub, setActiveClub] = useState(null);
  const [nuevoClubNombre, setNuevoClubNombre] = useState("");
  const [gestionLoading, setGestionLoading] = useState(false);
  const [selectClubLoading, setSelectClubLoading] = useState(false);
  const [solicitudesClub, setSolicitudesClub] = useState([]);
  const [solicitudesLoading, setSolicitudesLoading] = useState(false);
  const [seedingDemo, setSeedingDemo] = useState(false);
  const [seedNotice, setSeedNotice] = useState(null);
  const [savingClubLogoId, setSavingClubLogoId] = useState(null);

  const resolvedClubId = equipoActivo?.clubId || userData?.clubId || null;

  useEffect(() => {
    let unsub;
    if (userData?.rol === "superadmin") {
      setGestionLoading(true);
      const colRef = collection(db, "Clubes");
      unsub = onSnapshot(
        colRef,
        (snapshot) => {
          setClubes(snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() })));
          setGestionLoading(false);
        },
        () => setGestionLoading(false)
      );
    } else {
      setClubes([]);
    }
    return () => {
      if (typeof unsub === "function") unsub();
    };
  }, [userData?.rol]);

  useEffect(() => {
    if (!resolvedClubId) {
      setActiveClub(null);
      return;
    }

    const unsub = onSnapshot(
      doc(db, "Clubes", resolvedClubId),
      (snap) => {
        setActiveClub(snap.exists() ? { id: snap.id, ...snap.data() } : null);
      },
      () => setActiveClub(null)
    );

    return () => unsub();
  }, [resolvedClubId]);

  useEffect(() => {
    const fetchClubes = async () => {
      if (userData?.rol && userData?.rol !== "superadmin") {
        setSelectClubLoading(true);
        try {
          const clubCol = collection(db, "Clubes");
          const snap = await getDocs(clubCol);
          setClubes(snap.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() })));
        } catch {
          setClubes([]);
        }
        setSelectClubLoading(false);
      }
    };
    if (!userData?.clubId && userData?.rol && userData?.rol !== "superadmin") {
      fetchClubes();
    }
  }, [userData?.rol, userData?.clubId]);

  useEffect(() => {
    const fetchClubesParaCambio = async () => {
      if (!showOpcionesPanel || userData?.rol === "superadmin" || !userData?.clubId) return;
      try {
        const clubCol = collection(db, "Clubes");
        const snap = await getDocs(clubCol);
        setClubes(snap.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() })));
      } catch {
        setClubes([]);
      }
    };
    fetchClubesParaCambio();
  }, [showOpcionesPanel, userData?.rol, userData?.clubId]);

  useEffect(() => {
    if (userData?.rol !== "superadmin") {
      setSolicitudesClub([]);
      setSolicitudesLoading(false);
      return;
    }

    setSolicitudesLoading(true);
    const unsub = onSnapshot(
      collection(db, "Usuarios"),
      (snapshot) => {
        setSolicitudesClub(
          snapshot.docs
            .map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }))
            .filter((usuario) => usuario.solicitudClubId)
            .sort((a, b) => (a.email || "").localeCompare(b.email || "", "es"))
        );
        setSolicitudesLoading(false);
      },
      () => {
        setSolicitudesClub([]);
        setSolicitudesLoading(false);
      }
    );

    return () => unsub();
  }, [userData?.rol]);

  const getClubNombre = useCallback(
    (clubId) => {
      const fromList = clubes.find((c) => c.id === clubId)?.nombre;
      if (fromList) return fromList;
      if (activeClub?.id === clubId && activeClub?.nombre) return activeClub.nombre;
      return "Club";
    },
    [clubes, activeClub]
  );

  const handleSolicitarClub = async (club) => {
    if (!user || !club?.id || userData?.rol === "superadmin") return;
    if (userData?.clubId === club.id) {
      setErrorMsg("Ya perteneces a este club.");
      return;
    }
    setErrorMsg("");
    try {
      const userRef = doc(db, "Usuarios", user.uid);
      await updateDoc(userRef, {
        solicitudClubId: club.id,
        solicitudClubNombre: club.nombre,
      });
    } catch (err) {
      setErrorMsg(
        err?.code === "permission-denied"
          ? "No tienes permiso para solicitar este club."
          : "No se pudo enviar la solicitud de club."
      );
    }
  };

  const handleSelectClub = async (club) => {
    if (!user || !club?.id || userData?.rol !== "superadmin") return;
    setErrorMsg("");
    try {
      const userRef = doc(db, "Usuarios", user.uid);
      await updateDoc(userRef, {
        clubId: club.id,
        clubNombre: club.nombre,
        solicitudClubId: null,
        solicitudClubNombre: null,
      });
      setUserData((prev) => ({
        ...prev,
        clubId: club.id,
        clubNombre: club.nombre,
        solicitudClubId: null,
        solicitudClubNombre: null,
      }));
    } catch {
      setErrorMsg("No se pudo asignar el club.");
    }
  };

  const handleAprobarSolicitudClub = async (usuario) => {
    if (!usuario?.id || !usuario?.solicitudClubId || userData?.rol !== "superadmin") return;
    setErrorMsg("");
    try {
      await updateDoc(doc(db, "Usuarios", usuario.id), {
        clubId: usuario.solicitudClubId,
        clubNombre: usuario.solicitudClubNombre || getClubNombre(usuario.solicitudClubId),
        solicitudClubId: null,
        solicitudClubNombre: null,
      });
    } catch {
      setErrorMsg("No se pudo aprobar la solicitud de club.");
    }
  };

  const handleRechazarSolicitudClub = async (usuario) => {
    if (!usuario?.id || userData?.rol !== "superadmin") return;
    setErrorMsg("");
    try {
      await updateDoc(doc(db, "Usuarios", usuario.id), {
        solicitudClubId: null,
        solicitudClubNombre: null,
      });
    } catch {
      setErrorMsg("No se pudo rechazar la solicitud de club.");
    }
  };

  const handleQuitarMiClub = async () => {
    if (!user || userData?.rol !== "superadmin") return;
    setErrorMsg("");
    try {
      const userRef = doc(db, "Usuarios", user.uid);
      await updateDoc(userRef, { clubId: null, clubNombre: null });
      setUserData((prev) => ({ ...prev, clubId: null, clubNombre: null }));
      if (equiposFiltroSuperadmin === "propio") setEquiposFiltroSuperadmin("todos");
    } catch {
      setErrorMsg("No se pudo quitar el club.");
    }
  };

  const handleCrearClub = async (e) => {
    e.preventDefault();
    if (!nuevoClubNombre.trim()) return;
    try {
      await addDoc(collection(db, "Clubes"), { nombre: nuevoClubNombre.trim(), creadoEn: new Date() });
      setNuevoClubNombre("");
    } catch {
      setErrorMsg("Error creando club");
    }
  };

  const getClubLogo = useCallback(
    (clubId) => {
      const club = clubes.find((c) => c.id === clubId);
      const nombre =
        club?.nombre || (activeClub?.id === clubId ? activeClub?.nombre : null);
      const logoUrl =
        club?.logoUrl || (activeClub?.id === clubId ? activeClub?.logoUrl : null);
      return resolveClubLogoUrl({ logoUrl, nombre });
    },
    [clubes, activeClub]
  );

  const handleUploadClubLogo = async (clubId, file) => {
    if (!clubId) return;
    const validationError = validateLogoFile(file);
    if (validationError) {
      setErrorMsg(validationError);
      return;
    }

    setSavingClubLogoId(clubId);
    setErrorMsg("");
    try {
      const logoUrl = await prepareLogoDataUrl(file);
      await updateDoc(doc(db, "Clubes", clubId), {
        logoUrl,
        logoSource: "inline",
        logoUpdatedAt: new Date(),
      });
      setClubes((prev) => prev.map((c) => (c.id === clubId ? { ...c, logoUrl } : c)));
      if (activeClub?.id === clubId) {
        setActiveClub((prev) => (prev ? { ...prev, logoUrl } : prev));
      }
    } catch (err) {
      setErrorMsg(getLogoErrorMessage(err));
    } finally {
      setSavingClubLogoId(null);
    }
  };

  const handleRemoveClubLogo = async (clubId) => {
    if (!clubId) return;
    const confirmed = window.confirm("¿Quitar el escudo del club?");
    if (!confirmed) return;

    setSavingClubLogoId(clubId);
    setErrorMsg("");
    try {
      await updateDoc(doc(db, "Clubes", clubId), {
        logoUrl: deleteField(),
        logoSource: deleteField(),
        logoUpdatedAt: new Date(),
      });
      setClubes((prev) =>
        prev.map((c) => (c.id === clubId ? { ...c, logoUrl: undefined } : c))
      );
      if (activeClub?.id === clubId) {
        setActiveClub((prev) => (prev ? { ...prev, logoUrl: undefined } : prev));
      }
    } catch (err) {
      setErrorMsg(getLogoErrorMessage(err));
    } finally {
      setSavingClubLogoId(null);
    }
  };

  const handleSeedDemoData = async () => {
    if (userData?.rol !== "superadmin") {
      setErrorMsg("No tienes permiso para generar datos de prueba.");
      return;
    }

    const confirmed = window.confirm(
      "¿Generar datos de prueba?\n\nPor cada club: 6 equipos, 10 jugadoras por equipo y entrenamientos/partidos aleatorios de los últimos 90 días.\n\nSi no hay clubes, se crearán 3 de demo."
    );
    if (!confirmed) return;

    setSeedingDemo(true);
    setErrorMsg("");
    setSeedNotice(null);
    try {
      const summary = await seedDemoData(db, { clubIdFilter: null });
      setSeedNotice(
        `Datos generados: ${summary.clubes} club${summary.clubes === 1 ? "" : "es"} · ${summary.equiposCreados} equipos nuevos · ${summary.jugadorasCreadas} jugadoras · ${summary.sesionesCreadas} sesiones.`
      );
    } catch (err) {
      setErrorMsg(
        err?.code === "permission-denied"
          ? "No tienes permiso para generar datos de prueba."
          : err?.message || "No se pudieron generar los datos de prueba."
      );
    } finally {
      setSeedingDemo(false);
    }
  };

  return {
    clubes,
    activeClub,
    nuevoClubNombre,
    setNuevoClubNombre,
    gestionLoading,
    selectClubLoading,
    solicitudesClub,
    solicitudesLoading,
    seedingDemo,
    seedNotice,
    getClubNombre,
    getClubLogo,
    handleCrearClub,
    handleSolicitarClub,
    handleSelectClub,
    handleAprobarSolicitudClub,
    handleRechazarSolicitudClub,
    handleQuitarMiClub,
    handleSeedDemoData,
    handleUploadClubLogo,
    handleRemoveClubLogo,
    savingClubLogoId,
  };
}
