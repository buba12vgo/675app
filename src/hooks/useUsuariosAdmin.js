import { useState, useEffect, useMemo } from "react";
import { db } from "../firebase";
import {
  doc,
  collection,
  onSnapshot,
  updateDoc,
  writeBatch,
  query,
  where,
} from "firebase/firestore";
import { formatRolLabel, isCoordinador } from "../lib/appUtils.js";

export function useUsuariosAdmin({
  userData,
  clubes,
  getClubNombre,
  setErrorMsg,
}) {
  const [usuarios, setUsuarios] = useState([]);
  const [usuariosLoading, setUsuariosLoading] = useState(false);
  const [usuariosFiltroClub, setUsuariosFiltroClub] = useState("todos");
  const [usuariosNotice, setUsuariosNotice] = useState(null);
  const [savingUsuarioId, setSavingUsuarioId] = useState(null);
  const [clubUsuarios, setClubUsuarios] = useState([]);
  const [clubUsuariosLoading, setClubUsuariosLoading] = useState(false);

  useEffect(() => {
    if (userData?.rol !== "superadmin") {
      setUsuarios([]);
      setUsuariosLoading(false);
      return;
    }

    setUsuariosLoading(true);
    const unsub = onSnapshot(
      collection(db, "Usuarios"),
      (snapshot) => {
        setUsuarios(
          snapshot.docs
            .map((docSnap) => ({ ...docSnap.data(), id: docSnap.id }))
            .sort((a, b) => (a.email || "").localeCompare(b.email || "", "es"))
        );
        setUsuariosLoading(false);
      },
      () => {
        setUsuarios([]);
        setUsuariosLoading(false);
      }
    );

    return () => unsub();
  }, [userData?.rol]);

  useEffect(() => {
    if (!isCoordinador(userData?.rol) || !userData?.clubId) {
      setClubUsuarios([]);
      setClubUsuariosLoading(false);
      return;
    }

    setClubUsuariosLoading(true);
    const q = query(collection(db, "Usuarios"), where("clubId", "==", userData.clubId));
    const unsub = onSnapshot(
      q,
      (snapshot) => {
        setClubUsuarios(
          snapshot.docs
            .map((docSnap) => ({ ...docSnap.data(), id: docSnap.id }))
            .sort((a, b) => (a.email || "").localeCompare(b.email || "", "es"))
        );
        setClubUsuariosLoading(false);
      },
      (err) => {
        setClubUsuarios([]);
        setClubUsuariosLoading(false);
        setErrorMsg(
          err?.code === "permission-denied"
            ? "No tienes permiso para ver los entrenadores del club. Pide al administrador que publique las reglas de Firestore."
            : "No se pudieron cargar los entrenadores del club."
        );
      }
    );

    return () => unsub();
  }, [userData?.rol, userData?.clubId, setErrorMsg]);

  const solicitudesClub = useMemo(
    () =>
      usuarios
        .filter((usuario) => usuario.solicitudClubId)
        .sort((a, b) => (a.email || "").localeCompare(b.email || "", "es")),
    [usuarios]
  );

  const handleGuardarUsuarioClub = async (usuario, clubIdFromForm, rolSeleccionado) => {
    if (!usuario?.id) {
      setErrorMsg("Usuario no válido.");
      return;
    }
    if (userData?.rol !== "superadmin") {
      setErrorMsg("Solo el superadmin puede cambiar roles.");
      return;
    }

    const clubId = (clubIdFromForm || usuario.clubId || "").trim() || null;
    const rolFinal = clubId && rolSeleccionado === "coordinador" ? "coordinador" : "entrenador";

    if (rolSeleccionado === "coordinador" && !clubId) {
      setErrorMsg("El coordinador debe tener un club asignado. Elige un club en el desplegable.");
      return;
    }

    const clubNombre = clubId
      ? clubes.find((c) => c.id === clubId)?.nombre || usuario.clubNombre || getClubNombre(clubId)
      : null;

    setSavingUsuarioId(usuario.id);
    setErrorMsg("");
    setUsuariosNotice(null);
    try {
      const batch = writeBatch(db);
      const userRef = doc(db, "Usuarios", usuario.id);

      if (clubId && rolFinal === "coordinador") {
        const actual = usuarios.find(
          (u) => u.id !== usuario.id && u.clubId === clubId && u.rol === "coordinador"
        );
        if (actual) {
          batch.update(doc(db, "Usuarios", actual.id), { rol: "entrenador" });
        }
      }

      batch.update(userRef, {
        clubId,
        clubNombre,
        rol: rolFinal,
        solicitudClubId: null,
        solicitudClubNombre: null,
      });

      await batch.commit();

      setUsuarios((prev) =>
        prev.map((u) => {
          if (u.id === usuario.id) {
            return {
              ...u,
              clubId,
              clubNombre,
              rol: rolFinal,
              solicitudClubId: null,
              solicitudClubNombre: null,
            };
          }
          if (clubId && rolFinal === "coordinador" && u.clubId === clubId && u.rol === "coordinador") {
            return { ...u, rol: "entrenador" };
          }
          return u;
        })
      );
      setUsuariosNotice(
        `${usuario.nombre?.trim() || usuario.email} guardado como ${formatRolLabel(rolFinal)}${clubNombre ? ` (${clubNombre})` : ""}.`
      );
    } catch (err) {
      setErrorMsg(
        err?.code === "permission-denied"
          ? "No tienes permiso para actualizar este usuario. Comprueba que tu cuenta tenga rol superadmin en Firestore."
          : `No se pudo guardar el usuario${err?.message ? `: ${err.message}` : "."}`
      );
    } finally {
      setSavingUsuarioId(null);
    }
  };

  const handleQuitarClubUsuario = async (userId) => {
    if (!userId || userData?.rol !== "superadmin") return;
    setSavingUsuarioId(userId);
    setErrorMsg("");
    try {
      await updateDoc(doc(db, "Usuarios", userId), {
        clubId: null,
        clubNombre: null,
        rol: "entrenador",
        solicitudClubId: null,
        solicitudClubNombre: null,
      });
    } catch {
      setErrorMsg("No se pudo quitar el club del usuario.");
    } finally {
      setSavingUsuarioId(null);
    }
  };

  return {
    usuarios,
    usuariosLoading,
    solicitudesClub,
    solicitudesLoading: usuariosLoading,
    usuariosFiltroClub,
    setUsuariosFiltroClub,
    usuariosNotice,
    savingUsuarioId,
    clubUsuarios,
    clubUsuariosLoading,
    handleGuardarUsuarioClub,
    handleQuitarClubUsuario,
  };
}
