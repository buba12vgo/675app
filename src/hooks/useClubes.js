import { useState, useEffect, useCallback } from "react";
import { db } from "../firebase";
import {
  doc,
  getDocs,
  collection,
  addDoc,
  onSnapshot,
  updateDoc,
  deleteDoc,
  deleteField,
  setDoc,
  query,
  where,
} from "firebase/firestore";
import { seedDemoData } from "../seedDemoData.js";
import { prepareLogoDataUrl, validateLogoFile, getLogoErrorMessage } from "../lib/logoImage.js";
import { resolveClubLogoUrl } from "../lib/clubLogoPresets.js";
import { clubLogoDocId, isInlineDataUrl, shortLogoUrl } from "../lib/logoDocs.js";
import { deleteClubCascade } from "../lib/deleteClubCascade.js";
import { useConfirm } from "../components/ConfirmProvider.jsx";

export function useClubes({
  user,
  userData,
  setUserData,
  setErrorMsg,
  showOpcionesPanel,
  equipoActivo,
  setEquipoActivo,
  equiposFiltroSuperadmin,
  setEquiposFiltroSuperadmin,
}) {
  const confirm = useConfirm();
  const [clubes, setClubes] = useState([]);
  const [activeClub, setActiveClub] = useState(null);
  const [nuevoClubNombre, setNuevoClubNombre] = useState("");
  const [gestionLoading, setGestionLoading] = useState(false);
  const [selectClubLoading, setSelectClubLoading] = useState(false);
  const [seedingDemo, setSeedingDemo] = useState(false);
  const [seedNotice, setSeedNotice] = useState(null);
  const [savingClubLogoId, setSavingClubLogoId] = useState(null);
  const [clubEditandoId, setClubEditandoId] = useState(null);
  const [editClubNombre, setEditClubNombre] = useState("");
  const [savingClubId, setSavingClubId] = useState(null);
  const [deletingClubId, setDeletingClubId] = useState(null);
  const [clubLogos, setClubLogos] = useState({});

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
    if (userData?.rol === "superadmin") {
      const q = query(collection(db, "Logos"), where("tipo", "==", "club"));
      const unsub = onSnapshot(
        q,
        (snapshot) => {
          const next = {};
          snapshot.docs.forEach((docSnap) => {
            const data = docSnap.data();
            if (data.entityId && data.logoUrl) next[data.entityId] = data.logoUrl;
          });
          setClubLogos(next);
        },
        () => setClubLogos({})
      );
      return () => unsub();
    }

    if (!resolvedClubId) {
      setClubLogos({});
      return;
    }

    const unsub = onSnapshot(
      doc(db, "Logos", clubLogoDocId(resolvedClubId)),
      (snap) => {
        if (!snap.exists()) {
          setClubLogos({});
          return;
        }
        const data = snap.data();
        setClubLogos(data.logoUrl ? { [resolvedClubId]: data.logoUrl } : {});
      },
      () => setClubLogos({})
    );
    return () => unsub();
  }, [userData?.rol, resolvedClubId]);

  useEffect(() => {
    const canWrite =
      userData?.rol === "superadmin" ||
      (userData?.rol === "coordinador" && Boolean(userData?.clubId));
    if (!canWrite) return;

    const pending = [];
    clubes.forEach((club) => {
      if (isInlineDataUrl(club.logoUrl)) pending.push(club);
    });
    if (
      activeClub &&
      isInlineDataUrl(activeClub.logoUrl) &&
      !pending.some((club) => club.id === activeClub.id)
    ) {
      pending.push(activeClub);
    }
    if (!pending.length) return;

    let cancelled = false;
    (async () => {
      for (const club of pending) {
        if (cancelled) return;
        if (userData?.rol === "coordinador" && club.id !== userData.clubId) continue;
        try {
          await setDoc(doc(db, "Logos", clubLogoDocId(club.id)), {
            tipo: "club",
            entityId: club.id,
            clubId: club.id,
            logoUrl: club.logoUrl,
            logoSource: "inline",
            actualizadoEn: new Date(),
          });
          await updateDoc(doc(db, "Clubes", club.id), {
            logoUrl: deleteField(),
            logoSource: deleteField(),
            logoUpdatedAt: deleteField(),
          });
        } catch {
          /* ignore one-off migration errors */
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [clubes, activeClub, userData?.rol, userData?.clubId]);

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

  const handleIniciarEditClub = (club) => {
    if (userData?.rol !== "superadmin" || !club?.id) return;
    setClubEditandoId(club.id);
    setEditClubNombre(club.nombre || "");
    setErrorMsg("");
  };

  const handleCancelarEditClub = () => {
    setClubEditandoId(null);
    setEditClubNombre("");
  };

  const handleGuardarClub = async (clubId) => {
    const club = clubes.find((c) => c.id === clubId);
    if (!clubId || !club || userData?.rol !== "superadmin" || !editClubNombre.trim()) return;

    const nombre = editClubNombre.trim();
    setSavingClubId(clubId);
    setErrorMsg("");
    try {
      await updateDoc(doc(db, "Clubes", clubId), { nombre });
      setClubes((prev) => prev.map((c) => (c.id === clubId ? { ...c, nombre } : c)));
      if (activeClub?.id === clubId) {
        setActiveClub((prev) => (prev ? { ...prev, nombre } : prev));
      }
      if (user?.uid && userData?.clubId === clubId) {
        await updateDoc(doc(db, "Usuarios", user.uid), { clubNombre: nombre });
        setUserData((prev) => (prev ? { ...prev, clubNombre: nombre } : prev));
      }
      handleCancelarEditClub();
    } catch (err) {
      setErrorMsg(
        err?.code === "permission-denied"
          ? "No tienes permiso para editar este club."
          : "No se pudo guardar el club."
      );
    } finally {
      setSavingClubId(null);
    }
  };

  const handleEliminarClub = async (club) => {
    if (!club?.id || userData?.rol !== "superadmin") return;

    const confirmed = await confirm({
      title: `¿Eliminar el club "${club.nombre}"?`,
      text: "Se borrarán sus equipos, plantillas, sesiones y escudos. Los usuarios de este club quedarán sin club asignado.",
      confirmLabel: "Sí, eliminar club",
      steps: 2,
    });
    if (!confirmed) return;

    setDeletingClubId(club.id);
    setErrorMsg("");
    try {
      await deleteClubCascade(db, club.id);
      setClubes((prev) => prev.filter((c) => c.id !== club.id));
      if (activeClub?.id === club.id) setActiveClub(null);
      if (clubEditandoId === club.id) handleCancelarEditClub();
      if (typeof setEquipoActivo === "function" && equipoActivo?.clubId === club.id) {
        setEquipoActivo(null);
      }
      if (user?.uid && userData?.clubId === club.id) {
        await updateDoc(doc(db, "Usuarios", user.uid), { clubId: null, clubNombre: null });
        setUserData((prev) => (prev ? { ...prev, clubId: null, clubNombre: null } : prev));
        if (equiposFiltroSuperadmin === "propio") setEquiposFiltroSuperadmin("todos");
      }
    } catch (err) {
      setErrorMsg(
        err?.code === "permission-denied"
          ? "No tienes permiso para eliminar este club."
          : "No se pudo eliminar el club."
      );
    } finally {
      setDeletingClubId(null);
    }
  };

  const getClubLogo = useCallback(
    (clubId) => {
      const club = clubes.find((c) => c.id === clubId);
      const nombre =
        club?.nombre || (activeClub?.id === clubId ? activeClub?.nombre : null);
      const custom = clubLogos[clubId];
      const stored =
        shortLogoUrl(club?.logoUrl) ||
        (activeClub?.id === clubId ? shortLogoUrl(activeClub?.logoUrl) : null);
      return resolveClubLogoUrl({ logoUrl: custom || stored, nombre });
    },
    [clubes, activeClub, clubLogos]
  );

  const persistClubLogo = async (clubId, logoUrl) => {
    await setDoc(doc(db, "Logos", clubLogoDocId(clubId)), {
      tipo: "club",
      entityId: clubId,
      clubId,
      logoUrl,
      logoSource: "inline",
      actualizadoEn: new Date(),
    });
    const club = clubes.find((c) => c.id === clubId) || activeClub;
    if (isInlineDataUrl(club?.logoUrl)) {
      await updateDoc(doc(db, "Clubes", clubId), {
        logoUrl: deleteField(),
        logoSource: deleteField(),
        logoUpdatedAt: deleteField(),
      });
    }
  };

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
      await persistClubLogo(clubId, logoUrl);
      setClubLogos((prev) => ({ ...prev, [clubId]: logoUrl }));
    } catch (err) {
      setErrorMsg(getLogoErrorMessage(err));
    } finally {
      setSavingClubLogoId(null);
    }
  };

  const handleRemoveClubLogo = async (clubId) => {
    if (!clubId) return;
    const confirmed = await confirm({
      title: "¿Quitar el escudo del club?",
      text: "El club seguirá usando las iniciales hasta que subas otro.",
      confirmLabel: "Quitar escudo",
    });
    if (!confirmed) return;

    setSavingClubLogoId(clubId);
    setErrorMsg("");
    try {
      await deleteDoc(doc(db, "Logos", clubLogoDocId(clubId)));
      const club = clubes.find((c) => c.id === clubId) || activeClub;
      if (club?.logoUrl) {
        await updateDoc(doc(db, "Clubes", clubId), {
          logoUrl: deleteField(),
          logoSource: deleteField(),
          logoUpdatedAt: deleteField(),
        });
      }
      setClubLogos((prev) => {
        const next = { ...prev };
        delete next[clubId];
        return next;
      });
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

    const confirmed = await confirm({
      title: "¿Generar datos de prueba?",
      text: "Por cada club: 6 equipos, 10 jugadoras por equipo y entrenamientos/partidos aleatorios de los últimos 90 días.\n\nSi no hay clubes, se crearán 3 de demo.",
      confirmLabel: "Generar datos",
      danger: false,
    });
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
    clubEditandoId,
    editClubNombre,
    setEditClubNombre,
    savingClubId,
    deletingClubId,
    handleIniciarEditClub,
    handleCancelarEditClub,
    handleGuardarClub,
    handleEliminarClub,
  };
}
