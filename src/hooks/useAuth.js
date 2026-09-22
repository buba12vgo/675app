import { useState, useEffect, useCallback } from "react";
import { auth, googleProvider, db } from "../firebase";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { doc, getDoc, setDoc, onSnapshot, updateDoc } from "firebase/firestore";
import { getAuthErrorMessage } from "../lib/authErrors.js";
import {
  googleLoginUsesRedirect,
  markGoogleRedirectPending,
  clearGoogleRedirectPending,
} from "../lib/authGoogle.js";
import { toggleEquipoFavorito, equiposFavoritosLlenos, isEquipoFavorito, maxEquiposFavoritosParaRol } from "../lib/equiposFavoritos.js";

const GOOGLE_REDIRECT_FALLBACK = new Set([
  "auth/popup-blocked",
  "auth/operation-not-supported-in-this-environment",
  "auth/web-storage-unsupported",
  "auth/cancelled-popup-request",
  "auth/internal-error",
  "auth/timeout",
  "auth/missing-iframe-start",
]);

export function useAuth(setErrorMsg) {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userNombreInput, setUserNombreInput] = useState("");
  const [savingUserNombre, setSavingUserNombre] = useState(false);
  const [showOpcionesPanel, setShowOpcionesPanel] = useState(false);
  const [savingFavoritos, setSavingFavoritos] = useState(false);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    setUserNombreInput(userData?.nombre || "");
  }, [userData?.nombre]);

  useEffect(() => {
    let unsubAuth;
    let unsubProfile;
    let authGen = 0;

    unsubAuth = onAuthStateChanged(auth, async (u) => {
      const gen = ++authGen;
      if (unsubProfile) {
        unsubProfile();
        unsubProfile = null;
      }

      setUser(u);
      if (u) setErrorMsg("");
      if (u) {
        try {
          const docRef = doc(db, "Usuarios", u.uid);
          const docSnap = await getDoc(docRef);
          if (gen !== authGen) return;
          if (!docSnap.exists()) {
            if (!u.email) {
              setUserData(null);
              setErrorMsg("No se pudo leer el correo de la cuenta.");
              return;
            }
            const nuevoUsuario = { email: u.email, rol: "entrenador", creadoEn: new Date() };
            await setDoc(docRef, nuevoUsuario);
            if (gen !== authGen) return;
          }

          unsubProfile = onSnapshot(
            docRef,
            (snap) => {
              if (gen !== authGen) return;
              setUserData(snap.exists() ? snap.data() : null);
            },
            () => {
              if (gen !== authGen) return;
              setUserData(null);
            }
          );
        } catch {
          if (gen !== authGen) return;
          setUserData(null);
        }
      } else {
        setUserData(null);
      }
    });

    const readyTimeout = setTimeout(() => setAuthReady(true), 4000);
    Promise.all([
      typeof auth.authStateReady === "function" ? auth.authStateReady() : Promise.resolve(),
      getRedirectResult(auth).catch((error) => {
        const code = error?.code || "";
        if (!code || code === "auth/no-auth-event") return;
        setErrorMsg(getAuthErrorMessage(error));
      }),
    ]).finally(() => {
      clearTimeout(readyTimeout);
      clearGoogleRedirectPending();
      setAuthReady(true);
    });

    return () => {
      authGen += 1;
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
    const useRedirect = googleLoginUsesRedirect();
    try {
      if (useRedirect) {
        markGoogleRedirectPending();
        await signInWithRedirect(auth, googleProvider);
        return;
      }
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      if (!useRedirect && GOOGLE_REDIRECT_FALLBACK.has(error?.code)) {
        try {
          markGoogleRedirectPending();
          await signInWithRedirect(auth, googleProvider);
          return;
        } catch (redirectError) {
          setErrorMsg(getAuthErrorMessage(redirectError));
          return;
        }
      }
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
    authReady,
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
