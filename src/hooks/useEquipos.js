import { useState, useEffect } from "react";
import { db } from "../firebase";
import {
  doc,
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
import {
  canManageEquipo,
  GENERO_FEMENINO,
  GENERO_MASCULINO,
  TIPO_CANASTA_GRANDE,
  TIPO_CANASTA_MINI,
} from "../lib/appUtils.js";
import { validateLogoFile, prepareLogoDataUrl, getLogoErrorMessage } from "../lib/logoImage.js";
import { equipoLogoDocId, isInlineDataUrl, shortLogoUrl } from "../lib/logoDocs.js";
import { deleteEquipoCascade } from "../lib/deleteClubCascade.js";

export function useEquipos({ userData, superadminVista, equiposFiltroSuperadmin, setErrorMsg }) {
  const [equipos, setEquipos] = useState([]);
  const [equiposLoading, setEquiposLoading] = useState(false);
  const [nuevoEquipoNombre, setNuevoEquipoNombre] = useState("");
  const [nuevoEquipoGenero, setNuevoEquipoGenero] = useState(GENERO_FEMENINO);
  const [nuevoEquipoTipoCanasta, setNuevoEquipoTipoCanasta] = useState(TIPO_CANASTA_GRANDE);
  const [crearEquipoLoading, setCrearEquipoLoading] = useState(false);
  const [equipoEditandoId, setEquipoEditandoId] = useState(null);
  const [editEquipoNombre, setEditEquipoNombre] = useState("");
  const [editEquipoGenero, setEditEquipoGenero] = useState(GENERO_FEMENINO);
  const [editEquipoTipoCanasta, setEditEquipoTipoCanasta] = useState(TIPO_CANASTA_GRANDE);
  const [savingEquipoId, setSavingEquipoId] = useState(null);
  const [deletingEquipoId, setDeletingEquipoId] = useState(null);
  const [savingEquipoLogoId, setSavingEquipoLogoId] = useState(null);
  const [equipoActivo, setEquipoActivo] = useState(null);
  const [equipoLogos, setEquipoLogos] = useState({});

  useEffect(() => {
    setEquipoActivo(null);
  }, [userData?.clubId, userData?.rol]);

  useEffect(() => {
    if (!equipoActivo || userData?.rol === "superadmin") return;
    if (userData?.clubId && equipoActivo.clubId !== userData.clubId) {
      setEquipoActivo(null);
      setErrorMsg("No puedes acceder a equipos de otros clubes.");
    }
  }, [equipoActivo, userData?.clubId, userData?.rol, setErrorMsg]);

  useEffect(() => {
    const esSuperadmin = userData?.rol === "superadmin";
    const tieneClub = Boolean(userData?.clubId);

    if (esSuperadmin) {
      const verListaEquipos = superadminVista === "equipos" && !equipoActivo;
      if (!verListaEquipos) {
        setEquipos([]);
        return;
      }
      setEquiposLoading(true);
      const equiposCol = collection(db, "Equipos");
      const q =
        equiposFiltroSuperadmin === "propio" && tieneClub
          ? query(equiposCol, where("clubId", "==", userData.clubId))
          : equiposCol;
      const unsub = onSnapshot(
        q,
        (snapshot) => {
          const lista = snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));
          lista.sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));
          setEquipos(lista);
          setEquiposLoading(false);
        },
        () => {
          setEquipos([]);
          setEquiposLoading(false);
        }
      );
      return () => unsub();
    }

    if (tieneClub) {
      setEquiposLoading(true);
      const equiposCol = collection(db, "Equipos");
      const q = query(equiposCol, where("clubId", "==", userData.clubId));
      const unsub = onSnapshot(
        q,
        (snapshot) => {
          const lista = snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));
          lista.sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));
          setEquipos(lista);
          setEquiposLoading(false);
        },
        () => {
          setEquipos([]);
          setEquiposLoading(false);
        }
      );
      return () => unsub();
    }

    setEquipos([]);
  }, [userData?.rol, userData?.clubId, superadminVista, equiposFiltroSuperadmin, equipoActivo]);

  useEffect(() => {
    const clubId = userData?.clubId || (equipoActivo?.clubId && userData?.rol === "superadmin" ? equipoActivo.clubId : null);
    if (!clubId) {
      if (equipoActivo?.id) {
        const unsub = onSnapshot(
          doc(db, "Logos", equipoLogoDocId(equipoActivo.id)),
          (snap) => {
            const url = snap.exists() ? snap.data().logoUrl : null;
            setEquipoLogos(url ? { [equipoActivo.id]: url } : {});
          },
          () => setEquipoLogos({})
        );
        return () => unsub();
      }
      setEquipoLogos({});
      return;
    }

    const q = query(collection(db, "Logos"), where("clubId", "==", clubId));
    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const next = {};
        snapshot.docs.forEach((docSnap) => {
          const data = docSnap.data();
          if (data.tipo === "equipo" && data.entityId && data.logoUrl) {
            next[data.entityId] = data.logoUrl;
          }
        });
        setEquipoLogos(next);
      },
      () => setEquipoLogos({})
    );
    return () => unsub();
  }, [userData?.clubId, userData?.rol, equipoActivo?.id, equipoActivo?.clubId]);

  const puedeGestionarEquipo = (equipo) =>
    canManageEquipo(userData?.rol, userData?.clubId, equipo?.clubId);

  const puedeEliminarEquipo = () => userData?.rol === "superadmin";

  const handleEliminarEquipo = async (equipo) => {
    if (!equipo?.id || !puedeEliminarEquipo()) return;

    const confirmed = window.confirm(
      `¿Eliminar el equipo "${equipo.nombre}"?\n\nSe borrarán su plantilla, sesiones y escudo.`
    );
    if (!confirmed) return;

    setDeletingEquipoId(equipo.id);
    setErrorMsg("");
    try {
      await deleteEquipoCascade(db, equipo.id);
      setEquipos((prev) => prev.filter((item) => item.id !== equipo.id));
      setEquipoLogos((prev) => {
        const next = { ...prev };
        delete next[equipo.id];
        return next;
      });
      if (equipoActivo?.id === equipo.id) setEquipoActivo(null);
      if (equipoEditandoId === equipo.id) handleCancelarEditEquipo();
    } catch (err) {
      setErrorMsg(
        err?.code === "permission-denied"
          ? "No tienes permiso para eliminar este equipo."
          : "No se pudo eliminar el equipo."
      );
    } finally {
      setDeletingEquipoId(null);
    }
  };

  const handleIniciarEditEquipo = (equipo) => {
    if (!puedeGestionarEquipo(equipo)) return;
    setEquipoEditandoId(equipo.id);
    setEditEquipoNombre(equipo.nombre || "");
    setEditEquipoGenero(equipo.genero === GENERO_MASCULINO ? GENERO_MASCULINO : GENERO_FEMENINO);
    setEditEquipoTipoCanasta(
      equipo.tipoCanasta === TIPO_CANASTA_MINI ? TIPO_CANASTA_MINI : TIPO_CANASTA_GRANDE
    );
    setErrorMsg("");
  };

  const handleCancelarEditEquipo = () => {
    setEquipoEditandoId(null);
    setEditEquipoNombre("");
    setEditEquipoGenero(GENERO_FEMENINO);
    setEditEquipoTipoCanasta(TIPO_CANASTA_GRANDE);
  };

  const handleGuardarEquipo = async (equipoId) => {
    const equipo = equipos.find((e) => e.id === equipoId);
    if (!equipoId || !equipo || !puedeGestionarEquipo(equipo) || !editEquipoNombre.trim()) return;

    setSavingEquipoId(equipoId);
    setErrorMsg("");
    const payload = {
      nombre: editEquipoNombre.trim(),
      genero: editEquipoGenero,
      tipoCanasta: editEquipoTipoCanasta,
    };

    try {
      await updateDoc(doc(db, "Equipos", equipoId), payload);
      setEquipos((prev) => prev.map((e) => (e.id === equipoId ? { ...e, ...payload } : e)));
      if (equipoActivo?.id === equipoId) {
        setEquipoActivo((prev) => (prev ? { ...prev, ...payload } : prev));
      }
      handleCancelarEditEquipo();
    } catch (err) {
      setErrorMsg(
        err?.code === "permission-denied"
          ? "No tienes permiso para editar este equipo."
          : "No se pudo guardar el equipo."
      );
    } finally {
      setSavingEquipoId(null);
    }
  };

  const handleEntrarEquipo = (equipo) => {
    if (userData?.rol !== "superadmin" && userData?.clubId && equipo.clubId !== userData.clubId) {
      setErrorMsg("No puedes acceder a equipos de otros clubes.");
      return;
    }
    setEquipoActivo(equipo);
  };

  const getEquipoLogo = (equipo) => {
    if (!equipo) return null;
    return equipoLogos[equipo.id] || shortLogoUrl(equipo.logoUrl) || null;
  };

  const handleUploadEquipoLogo = async (equipoId, file) => {
    const equipo = equipos.find((e) => e.id === equipoId);
    if (!equipoId || !equipo || !puedeGestionarEquipo(equipo)) return;

    const validationError = validateLogoFile(file);
    if (validationError) {
      setErrorMsg(validationError);
      return;
    }

    setSavingEquipoLogoId(equipoId);
    setErrorMsg("");
    try {
      const logoUrl = await prepareLogoDataUrl(file);
      await setDoc(doc(db, "Logos", equipoLogoDocId(equipoId)), {
        tipo: "equipo",
        entityId: equipoId,
        clubId: equipo.clubId,
        logoUrl,
        logoSource: "inline",
        actualizadoEn: new Date(),
      });
      if (isInlineDataUrl(equipo.logoUrl)) {
        await updateDoc(doc(db, "Equipos", equipoId), {
          logoUrl: deleteField(),
          logoSource: deleteField(),
          logoUpdatedAt: deleteField(),
        });
      }
      setEquipoLogos((prev) => ({ ...prev, [equipoId]: logoUrl }));
    } catch (err) {
      setErrorMsg(getLogoErrorMessage(err));
    } finally {
      setSavingEquipoLogoId(null);
    }
  };

  const handleRemoveEquipoLogo = async (equipoId) => {
    const equipo = equipos.find((e) => e.id === equipoId);
    if (!equipoId || !equipo || !puedeGestionarEquipo(equipo)) return;

    const confirmed = window.confirm("¿Quitar el escudo del equipo?");
    if (!confirmed) return;

    setSavingEquipoLogoId(equipoId);
    setErrorMsg("");
    try {
      await deleteDoc(doc(db, "Logos", equipoLogoDocId(equipoId)));
      if (equipo.logoUrl) {
        await updateDoc(doc(db, "Equipos", equipoId), {
          logoUrl: deleteField(),
          logoSource: deleteField(),
          logoUpdatedAt: deleteField(),
        });
      }
      setEquipoLogos((prev) => {
        const next = { ...prev };
        delete next[equipoId];
        return next;
      });
    } catch (err) {
      setErrorMsg(getLogoErrorMessage(err));
    } finally {
      setSavingEquipoLogoId(null);
    }
  };

  const handleCrearEquipo = async (e) => {
    e.preventDefault();
    if (!nuevoEquipoNombre.trim() || !userData?.clubId) return false;
    if (!canManageEquipo(userData?.rol, userData.clubId, userData.clubId)) {
      setErrorMsg("Solo el coordinador o superadmin pueden crear equipos.");
      return false;
    }
    setCrearEquipoLoading(true);
    try {
      await addDoc(collection(db, "Equipos"), {
        nombre: nuevoEquipoNombre.trim(),
        clubId: userData.clubId,
        genero: nuevoEquipoGenero,
        tipoCanasta: nuevoEquipoTipoCanasta,
        creadoEn: new Date(),
      });
      setNuevoEquipoNombre("");
      setNuevoEquipoGenero(GENERO_FEMENINO);
      setNuevoEquipoTipoCanasta(TIPO_CANASTA_GRANDE);
      setCrearEquipoLoading(false);
      return true;
    } catch {
      setErrorMsg("Error creando equipo");
      setCrearEquipoLoading(false);
      return false;
    }
  };

  const equipoEditProps = {
    canEditEquipo: puedeGestionarEquipo,
    equipoEditandoId,
    editEquipoNombre,
    setEditEquipoNombre,
    editEquipoGenero,
    setEditEquipoGenero,
    editEquipoTipoCanasta,
    setEditEquipoTipoCanasta,
    savingEquipoId,
    deletingEquipoId,
    onStartEditEquipo: handleIniciarEditEquipo,
    onCancelEditEquipo: handleCancelarEditEquipo,
    onSaveEquipo: handleGuardarEquipo,
    canDeleteEquipo: puedeEliminarEquipo,
    onDeleteEquipo: handleEliminarEquipo,
    onUploadEquipoLogo: handleUploadEquipoLogo,
    onRemoveEquipoLogo: handleRemoveEquipoLogo,
    savingEquipoLogoId,
  };

  return {
    equipos,
    equiposLoading,
    equipoActivo,
    setEquipoActivo,
    nuevoEquipoNombre,
    setNuevoEquipoNombre,
    nuevoEquipoGenero,
    setNuevoEquipoGenero,
    nuevoEquipoTipoCanasta,
    setNuevoEquipoTipoCanasta,
    crearEquipoLoading,
    equipoEditandoId,
    editEquipoNombre,
    setEditEquipoNombre,
    editEquipoGenero,
    setEditEquipoGenero,
    editEquipoTipoCanasta,
    setEditEquipoTipoCanasta,
    savingEquipoId,
    deletingEquipoId,
    puedeGestionarEquipo,
    equipoEditProps,
    handleCrearEquipo,
    handleIniciarEditEquipo,
    handleCancelarEditEquipo,
    handleGuardarEquipo,
    handleEliminarEquipo,
    handleEntrarEquipo,
    handleUploadEquipoLogo,
    handleRemoveEquipoLogo,
    savingEquipoLogoId,
    getEquipoLogo,
  };
}
