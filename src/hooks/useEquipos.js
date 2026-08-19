import { useState, useEffect } from "react";
import { db } from "../firebase";
import {
  doc,
  collection,
  addDoc,
  onSnapshot,
  updateDoc,
  deleteField,
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
import { validateLogoFile, uploadEquipoLogo, removeStoragePrefix } from "../lib/logoStorage.js";

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
  const [savingEquipoLogoId, setSavingEquipoLogoId] = useState(null);
  const [equipoActivo, setEquipoActivo] = useState(null);

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
          setEquipos(snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() })));
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

  const puedeGestionarEquipo = (equipo) =>
    canManageEquipo(userData?.rol, userData?.clubId, equipo?.clubId);

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
      const logoUrl = await uploadEquipoLogo(equipoId, file);
      await updateDoc(doc(db, "Equipos", equipoId), {
        logoUrl,
        logoUpdatedAt: new Date(),
      });
      setEquipos((prev) => prev.map((e) => (e.id === equipoId ? { ...e, logoUrl } : e)));
      if (equipoActivo?.id === equipoId) {
        setEquipoActivo((prev) => (prev ? { ...prev, logoUrl } : prev));
      }
    } catch (err) {
      setErrorMsg(
        err?.code === "permission-denied"
          ? "No tienes permiso para subir el escudo del equipo."
          : err?.message || "No se pudo subir el escudo del equipo."
      );
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
      await removeStoragePrefix(`equipos/${equipoId}`);
      await updateDoc(doc(db, "Equipos", equipoId), {
        logoUrl: deleteField(),
        logoUpdatedAt: new Date(),
      });
      setEquipos((prev) =>
        prev.map((e) => (e.id === equipoId ? { ...e, logoUrl: undefined } : e))
      );
      if (equipoActivo?.id === equipoId) {
        setEquipoActivo((prev) => (prev ? { ...prev, logoUrl: undefined } : prev));
      }
    } catch (err) {
      setErrorMsg(
        err?.code === "permission-denied"
          ? "No tienes permiso para quitar el escudo del equipo."
          : err?.message || "No se pudo quitar el escudo del equipo."
      );
    } finally {
      setSavingEquipoLogoId(null);
    }
  };

  const handleCrearEquipo = async (e) => {
    e.preventDefault();
    if (!nuevoEquipoNombre.trim() || !userData?.clubId) return;
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
    } catch {
      setErrorMsg("Error creando equipo");
    }
    setCrearEquipoLoading(false);
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
    onStartEditEquipo: handleIniciarEditEquipo,
    onCancelEditEquipo: handleCancelarEditEquipo,
    onSaveEquipo: handleGuardarEquipo,
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
    puedeGestionarEquipo,
    equipoEditProps,
    handleCrearEquipo,
    handleIniciarEditEquipo,
    handleCancelarEditEquipo,
    handleGuardarEquipo,
    handleEntrarEquipo,
    handleUploadEquipoLogo,
    handleRemoveEquipoLogo,
    savingEquipoLogoId,
  };
}
