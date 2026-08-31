import { useState, useEffect, useCallback } from "react";
import { auth, googleProvider, db } from "../firebase";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { doc, getDoc, setDoc, onSnapshot, updateDoc } from "firebase/firestore";
import { getAuthErrorMessage } from "../lib/authErrors.js";
import { toggleEquipoFavorito, equiposFavoritosLlenos, isEquipoFavorito, maxEquiposFavoritosParaRol } from "../lib/equiposFavoritos.js";

export function useAuth(setErrorMsg) {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userNombreInput, setUserNombreInput] = useState("");
  const [savingUserNombre, setSavingUserNombre] = useState(false);
  const [showOpcionesPanel, setShowOpcionesPanel] = useState(false);
  const [savingFavoritos, setSavingFavoritos] = useState(false);

  useEffect(() => {
    setUserNombreInput(userData?.nombre || "");
  }, [userData?.nombre]);

  useEffect(() => {
    let unsubAuth;
    let unsubProfile;

    unsubAuth = onAuthStateChanged(auth, async (u) => {
      if (unsubProfile) {
        unsubProfile();
        unsubProfile = null;
      }

      setUser(u);
      setErrorMsg("");
      if (u) {
        try {
          const docRef = doc(db, "Usuarios", u.uid);
          const docSnap = await getDoc(docRef);
          if (!docSnap.exists()) {
            const nuevoUsuario = { email: u.email, rol: "entrenador", creadoEn: new Date() };
            await setDoc(docRef, nuevoUsuario);
          }

          unsubProfile = onSnapshot(
            docRef,
            (snap) => {
              setUserData(snap.exists() ? snap.data() : null);
            },
            () => setUserData(null)
          );
        } catch {
          setUserData(null);
        }
      } else {
        setUserData(null);
      }
    });

    return () => {
      if (typeof unsubProfile === "function") unsubProfile();
      if (typeof unsubAuth === "function") unsubAuth();
    };
  }, [setErrorMsg]);

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setEmail("");
      setPassword("");
    } catch (error) {
      setErrorMsg(getAuthErrorMessage(error));
    }
  };

  const handleGoogleLogin = async () => {
    setErrorMsg("");
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      setErrorMsg(getAuthErrorMessage(error));
    }
  };

  const logout = useCallback(async () => {
    await signOut(auth);
    setUserData(null);
  }, []);

  const handleOpenOpciones = () => {
    setErrorMsg("");
    setShowOpcionesPanel(true);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleSaveUserNombre = async (e) => {
    e.preventDefault();
    if (!user || !userNombreInput.trim()) return;
    setSavingUserNombre(true);
    setErrorMsg("");
    try {
      const nombre = userNombreInput.trim();
      await updateDoc(doc(db, "Usuarios", user.uid), { nombre });
      setUserData((prev) => ({ ...prev, nombre }));
    } catch (err) {
      setErrorMsg(err?.code === "permission-denied"
        ? "No tienes permiso para guardar tu nombre."
        : "No se pudo guardar tu nombre.");
    } finally {
      setSavingUserNombre(false);
    }
  };

  const handleToggleEquipoFavorito = async (equipoId) => {
    const rol = userData?.rol;
    if (!user || !equipoId || (rol !== "entrenador" && rol !== "preparador_fisico")) return;
    const max = maxEquiposFavoritosParaRol(rol);
    if (!isEquipoFavorito(userData?.equiposFavoritos, equipoId, max) && equiposFavoritosLlenos(userData?.equiposFavoritos, max)) {
      setErrorMsg(`Solo puedes marcar ${max} equipos como favoritos. Quita uno para cambiarlo.`);
      return;
    }
    const next = toggleEquipoFavorito(userData?.equiposFavoritos, equipoId, max);
    setSavingFavoritos(true);
    setErrorMsg("");
    try {
      await updateDoc(doc(db, "Usuarios", user.uid), { equiposFavoritos: next });
    } catch (err) {
      setErrorMsg(
        err?.code === "permission-denied"
          ? "No tienes permiso para guardar favoritos."
          : "No se pudieron guardar los equipos favoritos."
      );
    } finally {
      setSavingFavoritos(false);
    }
  };

  return {
    user,
    userData,
    setUserData,
    email,
    setEmail,
    password,
    setPassword,
    userNombreInput,
    setUserNombreInput,
    savingUserNombre,
    showOpcionesPanel,
    setShowOpcionesPanel,
    handleEmailLogin,
    handleGoogleLogin,
    logout,
    handleOpenOpciones,
    handleSaveUserNombre,
    handleToggleEquipoFavorito,
    savingFavoritos,
  };
}
