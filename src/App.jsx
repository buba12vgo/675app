import { useState, useEffect } from "react";
import { auth, googleProvider, db } from "./firebase";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import {
  doc,
  getDoc,
  getDocs,
  setDoc,
  collection,
  addDoc,
  onSnapshot,
  updateDoc,
  writeBatch,
  query,
  where,
  deleteDoc
} from "firebase/firestore";
import { seedDemoData } from "./seedDemoData.js";
import {
  THEMES,
  STORAGE_THEME_KEY,
  applyThemeToDocument,
  getStoredTheme,
  persistTheme,
  getGlassCardStyle,
} from "./theme.js";
import {
  formatRolLabel,
  getClubInitials,
  formatDateYYYYMMDD,
  normalizarTipoSesion,
  formatearFechaCorta,
  etiquetaDiaRelativo,
  getProximosEventosInicio,
  sugerirFechaLibre,
  getMetricasEvento,
  getRangoFechasEstadisticas,
  filtrarSesionesPorPeriodo,
  calcularEstadisticasJugadoras,
  isCoordinador,
  isClubStaff,
  canManageEquipo,
  getEquipoLabels,
  formatTipoCanasta,
  formatGeneroEquipo,
  GENERO_FEMENINO,
  GENERO_MASCULINO,
  TIPO_CANASTA_GRANDE,
  TIPO_CANASTA_MINI,
} from "./lib/appUtils.js";

import { useCompactHeader } from "./hooks/useCompactHeader.js";
import {
  IconHome,
  IconCalendar,
  IconChart,
  IconUsers,
  IconChevronLeft,
} from "./components/icons.jsx";
import { AppHeader } from "./components/AppHeader.jsx";
import { AppBrand } from "./components/AppBrand.jsx";
import { BlurredBackground } from "./components/BlurredBackground.jsx";
import { ThemeToggleButton } from "./components/ThemeToggleButton.jsx";
import { UserOptionsPanel } from "./components/UserOptionsPanel.jsx";
import { SuperadminUsuariosPanel } from "./components/SuperadminUsuariosPanel.jsx";
import { CoordinacionPanel } from "./components/CoordinacionPanel.jsx";
import { DemoSeedCard } from "./components/DemoSeedCard.jsx";

import { LoginScreen } from "./components/LoginScreen.jsx";
import { HomeTab } from "./components/HomeTab.jsx";
import { CalendarioTab } from "./components/CalendarioTab.jsx";
import { EstadisticasTab } from "./components/EstadisticasTab.jsx";
import { PlantillaTab } from "./components/PlantillaTab.jsx";
import { EquiposListaContainer } from "./components/EquiposListaContainer.jsx";
import { SuperadminPanel } from "./components/SuperadminPanel.jsx";
import { TeamLayout } from "./layouts/TeamLayout.jsx";
import { resetCamposSesion } from "./lib/sessionUtils.js";


const THEME = THEMES.dark;


function App() {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  
  // SaaS state
  const [clubes, setClubes] = useState([]);
  const [activeClub, setActiveClub] = useState(null);
  const [nuevoClubNombre, setNuevoClubNombre] = useState("");
  const [gestionLoading, setGestionLoading] = useState(false);
  const [selectClubLoading, setSelectClubLoading] = useState(false);
  const [superadminVista, setSuperadminVista] = useState("clubes"); // "clubes" | "equipos" | "usuarios"
  const [equiposFiltroSuperadmin, setEquiposFiltroSuperadmin] = useState("todos"); // "todos" | "propio"
  const [usuarios, setUsuarios] = useState([]);
  const [usuariosLoading, setUsuariosLoading] = useState(false);
  const [usuariosFiltroClub, setUsuariosFiltroClub] = useState("todos");
  const [usuariosNotice, setUsuariosNotice] = useState(null);
  const [savingUsuarioId, setSavingUsuarioId] = useState(null);
  const [clubUsuarios, setClubUsuarios] = useState([]);
  const [clubUsuariosLoading, setClubUsuariosLoading] = useState(false);
  const [coordinadorVista, setCoordinadorVista] = useState("equipos"); // "equipos" | "coordinacion"
  const [userNombreInput, setUserNombreInput] = useState("");
  const [savingUserNombre, setSavingUserNombre] = useState(false);
  const [showOpcionesPanel, setShowOpcionesPanel] = useState(false);
  const [seedingDemo, setSeedingDemo] = useState(false);
  const [seedNotice, setSeedNotice] = useState(null);
  const [solicitudesClub, setSolicitudesClub] = useState([]);
  const [solicitudesLoading, setSolicitudesLoading] = useState(false);

  // Equipos state
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

  // Equipo activo y tabs
  const [equipoActivo, setEquipoActivo] = useState(null);
  const [tab, setTab] = useState("home");
  const [devicePreview, setDevicePreview] = useState("mobile");
  const [colorMode, setColorMode] = useState(() => getStoredTheme());

  useEffect(() => {
    applyThemeToDocument(colorMode);
    persistTheme(colorMode);
  }, [colorMode]);

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (event) => {
      try {
        if (localStorage.getItem(STORAGE_THEME_KEY)) return;
      } catch {
        /* ignore */
      }
      setColorMode(event.matches ? "dark" : "light");
    };
    media.addEventListener("change", handleChange);
    return () => media.removeEventListener("change", handleChange);
  }, []);

  const toggleColorMode = () => {
    setColorMode(prev => (prev === "dark" ? "light" : "dark"));
  };

  const compactHeader = useCompactHeader();

  const theme = THEMES[colorMode];
  const glassCardStyle = getGlassCardStyle(colorMode);
  const isDarkMode = colorMode === "dark";

  // Estado de jugadoras
  const [jugadoras, setJugadoras] = useState([]);
  const [jugadorasLoading, setJugadorasLoading] = useState(false);

  // Formulario plantilla
  const [jugadoraNombre, setJugadoraNombre] = useState("");
  const [jugadoraDorsal, setJugadoraDorsal] = useState("");
  const [jugadoraApodo, setJugadoraApodo] = useState("");
  const [addJugadoraLoading, setAddJugadoraLoading] = useState(false);
  const [jugadoraEditandoId, setJugadoraEditandoId] = useState(null);
  const [editJugadoraNombre, setEditJugadoraNombre] = useState("");
  const [editJugadoraDorsal, setEditJugadoraDorsal] = useState("");
  const [editJugadoraApodo, setEditJugadoraApodo] = useState("");
  const [editJugadoraLoading, setEditJugadoraLoading] = useState(false);

  // Sesiones state
  const [fechaSesion, setFechaSesion] = useState(() => {
    const d = new Date();
    return d.toISOString().slice(0, 10);
  });
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
  const [sesionVista, setSesionVista] = useState("datos"); // "datos" | "asistencia" (móvil)

  // Estadísticas — filtros de periodo
  const [statsPeriodo, setStatsPeriodo] = useState("mensual");
  const [statsVista, setStatsVista] = useState("todo"); // "entrenos" | "partidos" | "todo"
  const [statsDesde, setStatsDesde] = useState(() => {
    const d = new Date();
    return formatDateYYYYMMDD(new Date(d.getFullYear(), d.getMonth(), 1));
  });
  const [statsHasta, setStatsHasta] = useState(() => formatDateYYYYMMDD(new Date()));

  // Calendario sesiones (nuevo estados)
  const [sesionesEquipo, setSesionesEquipo] = useState([]); // [{fecha, ...}]
  const [sesionesLoading, setSesionesLoading] = useState(false);
  const [mesActual, setMesActual] = useState(() => {
    const d = new Date();
    return d.getMonth();
  });
  const [anioActual, setAnioActual] = useState(() => {
    return new Date().getFullYear();
  });
  const [fechaSesionSeleccionada, setFechaSesionSeleccionada] = useState(null); // Si está en panel de sesión, guarda la fecha string "YYYY-MM-DD"

  // Colores
  const bgDark = theme.bg;
  const accent = theme.accent;
  const accentSoft = theme.accentSoft;
  const accentLight = theme.accentLight;
  const accentShadow = theme.accentShadow;
  const accentBorder = theme.accentBorder;
  const accentBgSubtle = theme.accentBgSubtle;
  const tableHeader = theme.tableHeader;
  const tableHeaderAccent = theme.tableHeaderAccent;
  const cardBg = theme.cardBg;
  const cardBgElevated = theme.cardBgElevated;
  const surface = theme.surface;
  const cardShadow = theme.cardShadow;
  const inputBg = theme.inputBg;
  const inputBorder = theme.inputBorder;
  const text = theme.text;
  const textSecondary = theme.textSecondary;
  const textMuted = theme.textMuted;
  const success = theme.success;
  const error = theme.error;
  const colorPartido = theme.colorPartido;
  const colorPartidoLight = theme.colorPartidoLight;
  const colorPartidoSoft = theme.colorPartidoSoft;
  const colorPartidoBorder = theme.colorPartidoBorder;
  const onAccent = theme.onAccent;
  const sesionSetters = {
    setTematica, setEjercicios, setAsistencias, setValoraciones,
    setTipoSesion, setRivalPartido, setLocalPartido, setSesionVista,
  };

  const jugadorasSesion = jugadoras;

  const tabsMenu = [
    { key: "home", label: "Inicio", Icon: IconHome },
    { key: "sesiones", label: "Calendario", Icon: IconCalendar },
    { key: "players", label: "Estadísticas", Icon: IconChart },
    { key: "plantilla", label: "Plantilla", Icon: IconUsers },
  ];

  useEffect(() => {
    setUserNombreInput(userData?.nombre || "");
  }, [userData?.nombre]);

  // Escucha auth y datos de usuario
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
        } catch (err) {
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
  }, []);
  // Escucha clubes para superadmin
  useEffect(() => {
    let unsub;
    if (userData?.rol === "superadmin") {
      setGestionLoading(true);
      const colRef = collection(db, "Clubes");
      unsub = onSnapshot(
        colRef,
        (snapshot) => {
          setClubes(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
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

  const resolvedClubId = equipoActivo?.clubId || userData?.clubId || null;

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

  // Reseteos al cambiar de contexto
  useEffect(() => {
    setEquipoActivo(null);
    setTab("home");
    setShowOpcionesPanel(false);
  }, [userData?.clubId, userData?.rol]);

  useEffect(() => {
    setJugadoras([]);
    setJugadoraNombre("");
    setJugadoraDorsal("");
    setJugadoraApodo("");
    setAddJugadoraLoading(false);
    setJugadoraEditandoId(null);
    setEditJugadoraNombre("");
    setEditJugadoraDorsal("");
    setEditJugadoraApodo("");
    setEditJugadoraLoading(false);
  }, [equipoActivo]);

  // Fetch de clubes para usuarios sin club
  useEffect(() => {
    const fetchClubes = async () => {
      if (userData?.rol && userData?.rol !== "superadmin") {
        setSelectClubLoading(true);
        try {
          const clubCol = collection(db, "Clubes");
          const snap = await getDocs(clubCol);
          setClubes(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        } catch (err) {
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
        setClubes(snap.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() })));
      } catch (err) {
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

  useEffect(() => {
    if (userData?.rol !== "superadmin" || superadminVista !== "usuarios") {
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
  }, [userData?.rol, superadminVista]);

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
        console.error("Error cargando usuarios del club:", err);
        setClubUsuarios([]);
        setClubUsuariosLoading(false);
        setErrorMsg(err?.code === "permission-denied"
          ? "No tienes permiso para ver los entrenadores del club. Pide al administrador que publique las reglas de Firestore."
          : "No se pudieron cargar los entrenadores del club.");
      }
    );

    return () => unsub();
  }, [userData?.rol, userData?.clubId]);

  useEffect(() => {
    if (!equipoActivo || userData?.rol === "superadmin") return;
    if (userData?.clubId && equipoActivo.clubId !== userData.clubId) {
      setEquipoActivo(null);
      setErrorMsg("No puedes acceder a equipos de otros clubes.");
    }
  }, [equipoActivo, userData?.clubId, userData?.rol]);

  // Leer equipos según rol y contexto
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
      const q = equiposFiltroSuperadmin === "propio" && tieneClub
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

  // Escucha en vivo las jugadoras del equipoActivo (SIN ORDERBY PARA EVITAR ERROR DE ÍNDICES)
  useEffect(() => {
    let unsub;
    if (equipoActivo && (userData?.clubId || userData?.rol === "superadmin")) {
      setJugadorasLoading(true);
      const jugadorasCol = collection(db, "Jugadoras");
      const q = query(jugadorasCol, where("equipoId", "==", equipoActivo.id));
      
      unsub = onSnapshot(
        q,
        (snapshot) => {
          const docs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
          docs.sort((a, b) => a.dorsal - b.dorsal);
          setJugadoras(docs);
          setJugadorasLoading(false);
        },
        (err) => {
          setJugadoras([]);
          setJugadorasLoading(false);
          if (err?.code === "permission-denied") {
            setErrorMsg("No tienes permiso para ver la plantilla de este equipo.");
          } else if (err?.message) {
            setErrorMsg(`Error cargando plantilla: ${err.message}`);
          }
        }
      );
    } else {
      setJugadoras([]);
    }
    return () => {
      if (typeof unsub === "function") unsub();
    };
  }, [equipoActivo, userData?.clubId, userData?.rol]);

  // --- CALENDARIO SESIONES equipoActivo (en vivo) ---
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
            snapshot.docs.map((doc) => ({
              ...doc.data(),
              id: doc.id,
              fecha: doc.data().fecha, // string "YYYY-MM-DD"
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
    return () => { if (typeof unsub === "function") unsub(); };
  }, [equipoActivo, userData?.clubId, userData?.rol]);
  // END calendario snapshot

  // Estado y consulta de Sesion para la pestaña 'sesiones' (ahora sólo usada en Panel Sesión, por fecha seleccionada)
  useEffect(() => {
    if (equipoActivo && fechaSesionSeleccionada && tab === "sesiones") {
      setSesionCargando(true);
      setSesionDoc(null);
      setSesionId(null);
      setTematica("");
      setEjercicios("");
      resetCamposSesion(sesionSetters);
      // Buscar sesión por equipoId y fecha seleccionada
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
        } catch (e) {
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

  // Refiltra asistencias y valoraciones cuando cambia la lista de la sesión
  useEffect(() => {
    if (!sesionDoc) return;
    const lista = jugadoras;
    if (!lista.length) return;

    setAsistencias(prevAsist => {
      const nuevo = {};
      lista.forEach(j => {
        nuevo[j.id] = typeof prevAsist[j.id] !== "undefined" ? prevAsist[j.id] : false;
      });
      return nuevo;
    });
    setValoraciones(prevVal => {
      const nuevo = {};
      lista.forEach(j => {
        const val = prevVal[j.id];
        if (typeof val === "number" && val >= 1 && val <= 5) {
          nuevo[j.id] = val;
        }
      });
      return nuevo;
    });
  }, [jugadoras, sesionDoc]);

  // Actualiza asistencias cuando cambia listado y NO hay sesión ya creada
  useEffect(() => {
    if (!sesionDoc && jugadorasSesion.length && fechaSesionSeleccionada && tab === "sesiones") {
      setAsistencias(() => {
        const nuevo = {};
        jugadorasSesion.forEach(j => {
          nuevo[j.id] = true;
        });
        return nuevo;
      });
      setValoraciones(() => {
        const nuevo = {};
        jugadorasSesion.forEach(j => {
          nuevo[j.id] = 3;
        });
        return nuevo;
      });
    }
  }, [jugadorasSesion, sesionDoc, tab, fechaSesionSeleccionada]);

  useEffect(() => {
    setSesionVista("datos");
  }, [fechaSesionSeleccionada]);

  // Funciones de acción
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
      setErrorMsg(err?.code === "permission-denied"
        ? "No tienes permiso para solicitar este club."
        : "No se pudo enviar la solicitud de club.");
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
      setUserData(prev => ({
        ...prev,
        clubId: club.id,
        clubNombre: club.nombre,
        solicitudClubId: null,
        solicitudClubNombre: null,
      }));
    } catch (err) {
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
    } catch (err) {
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
    } catch (err) {
      setErrorMsg("No se pudo rechazar la solicitud de club.");
    }
  };

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
      ? (clubes.find((c) => c.id === clubId)?.nombre || usuario.clubNombre || getClubNombre(clubId))
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
      console.error("Error guardando usuario:", err);
      setErrorMsg(err?.code === "permission-denied"
        ? "No tienes permiso para actualizar este usuario. Comprueba que tu cuenta tenga rol superadmin en Firestore."
        : `No se pudo guardar el usuario${err?.message ? `: ${err.message}` : "."}`);
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
    } catch (err) {
      setErrorMsg("No se pudo quitar el club del usuario.");
    } finally {
      setSavingUsuarioId(null);
    }
  };

  const handleEntrarEquipo = (equipo) => {
    if (userData?.rol !== "superadmin" && userData?.clubId && equipo.clubId !== userData.clubId) {
      setErrorMsg("No puedes acceder a equipos de otros clubes.");
      return;
    }
    setEquipoActivo(equipo);
  };

  const handleQuitarMiClub = async () => {
    if (!user || userData?.rol !== "superadmin") return;
    setErrorMsg("");
    try {
      const userRef = doc(db, "Usuarios", user.uid);
      await updateDoc(userRef, { clubId: null, clubNombre: null });
      setUserData(prev => ({ ...prev, clubId: null, clubNombre: null }));
      if (equiposFiltroSuperadmin === "propio") setEquiposFiltroSuperadmin("todos");
    } catch (err) {
      setErrorMsg("No se pudo quitar el club.");
    }
  };

  const getClubNombre = (clubId) => {
    const fromList = clubes.find(c => c.id === clubId)?.nombre;
    if (fromList) return fromList;
    if (activeClub?.id === clubId && activeClub?.nombre) return activeClub.nombre;
    return "Club";
  };

  const handleGoHome = () => {
    setShowOpcionesPanel(false);
    if (equipoActivo) {
      setTab("home");
    }
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

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
      setUserData(prev => ({ ...prev, nombre }));
    } catch (err) {
      setErrorMsg(err?.code === "permission-denied"
        ? "No tienes permiso para guardar tu nombre."
        : "No se pudo guardar tu nombre.");
    } finally {
      setSavingUserNombre(false);
    }
  };

  const userOptionsProps = {
    userNombre: userNombreInput,
    onNombreChange: setUserNombreInput,
    onSubmit: handleSaveUserNombre,
    saving: savingUserNombre,
    email: user?.email,
    accent,
    accentLight,
    accentSoft,
    accentBorder,
    text,
    textSecondary,
    textMuted,
    inputBorder,
    inputBg,
    cardBgElevated,
    clubNombre: userData?.clubNombre,
    clubId: userData?.clubId,
    solicitudClubNombre: userData?.solicitudClubNombre,
    solicitudClubId: userData?.solicitudClubId,
    clubes,
    onSolicitarClub: handleSolicitarClub,
    esEntrenador: userData?.rol === "entrenador",
  };

  const superadminUsuariosProps = {
    usuarios,
    usuariosLoading,
    clubes,
    filtroClub: usuariosFiltroClub,
    onFiltroClubChange: setUsuariosFiltroClub,
    onGuardarUsuario: handleGuardarUsuarioClub,
    onQuitarClub: handleQuitarClubUsuario,
    savingUserId: savingUsuarioId,
    notice: usuariosNotice,
    accent,
    accentLight,
    accentSoft,
    text,
    textSecondary,
    textMuted,
    inputBorder,
    inputBg,
    cardBgElevated,
  };

  const puedeGestionarEquipo = (equipo) => canManageEquipo(userData?.rol, userData?.clubId, equipo?.clubId);

  const handleIniciarEditEquipo = (equipo) => {
    if (!puedeGestionarEquipo(equipo)) return;
    setEquipoEditandoId(equipo.id);
    setEditEquipoNombre(equipo.nombre || "");
    setEditEquipoGenero(equipo.genero === GENERO_MASCULINO ? GENERO_MASCULINO : GENERO_FEMENINO);
    setEditEquipoTipoCanasta(equipo.tipoCanasta === TIPO_CANASTA_MINI ? TIPO_CANASTA_MINI : TIPO_CANASTA_GRANDE);
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
      setErrorMsg(err?.code === "permission-denied"
        ? "No tienes permiso para editar este equipo."
        : "No se pudo guardar el equipo.");
    } finally {
      setSavingEquipoId(null);
    }
  };

  const coordinacionProps = {
    clubNombre: userData?.clubNombre,
    usuarios: clubUsuarios,
    usuariosLoading: clubUsuariosLoading,
    equipos,
    equiposLoading,
    onEntrarEquipo: handleEntrarEquipo,
    canEditEquipos: isCoordinador(userData?.rol),
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
    accent,
    accentLight,
    accentSoft,
    text,
    textSecondary,
    textMuted,
    inputBorder,
    inputBg,
    cardBgElevated,
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
      setErrorMsg(err?.code === "permission-denied"
        ? "No tienes permiso para generar datos de prueba."
        : err?.message || "No se pudieron generar los datos de prueba.");
    } finally {
      setSeedingDemo(false);
    }
  };

  const canSeedDemoData = userData?.rol === "superadmin";
  const demoSeedProps = {
    onSeed: handleSeedDemoData,
    seeding: seedingDemo,
    notice: seedNotice,
    accent,
    text,
    textSecondary,
    inputBorder,
    cardBgElevated,
  };

  const handleCrearClub = async (e) => {
    e.preventDefault();
    if (!nuevoClubNombre.trim()) return;
    try {
      await addDoc(collection(db, "Clubes"), { nombre: nuevoClubNombre.trim(), creadoEn: new Date() });
      setNuevoClubNombre("");
    } catch (err) {
      setErrorMsg("Error creando club");
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
    } catch (err) {
      setErrorMsg("Error creando equipo");
    }
    setCrearEquipoLoading(false);
  };

  const handleAddJugadora = async (e) => {
    e.preventDefault();
    const clubIdEquipo = equipoActivo?.clubId || userData?.clubId;
    if (!equipoActivo || !clubIdEquipo) return;
    if (!jugadoraNombre.trim() || !jugadoraDorsal.trim()) return;
    setAddJugadoraLoading(true);
    setErrorMsg("");
    try {
      await addDoc(collection(db, "Jugadoras"), {
        nombre: jugadoraNombre.trim(),
        dorsal: Number(jugadoraDorsal),
        apodo: jugadoraApodo.trim(),
        equipoId: equipoActivo.id,
        clubId: clubIdEquipo,
        creadoEn: new Date()
      });
      setJugadoraNombre("");
      setJugadoraDorsal("");
      setJugadoraApodo("");
    } catch (err) {
      setErrorMsg(getEquipoLabels(equipoActivo?.genero).errorAnadirJugador);
    }
    setAddJugadoraLoading(false);
  };

  const handleEliminarJugadora = async (jugadora) => {
    const confirmar = window.confirm(`¿Eliminar a ${jugadora.nombre} de la plantilla?`);
    if (!confirmar) return;
    setErrorMsg("");
    if (jugadoraEditandoId === jugadora.id) {
      setJugadoraEditandoId(null);
    }
    try {
      await deleteDoc(doc(db, "Jugadoras", jugadora.id));
    } catch (err) {
      setErrorMsg(getEquipoLabels(equipoActivo?.genero).errorEliminarJugador);
    }
  };

  const handleIniciarEditJugadora = (jugadora) => {
    setJugadoraEditandoId(jugadora.id);
    setEditJugadoraNombre(jugadora.nombre || "");
    setEditJugadoraDorsal(String(jugadora.dorsal ?? ""));
    setEditJugadoraApodo(jugadora.apodo || "");
    setErrorMsg("");
  };

  const handleCancelarEditJugadora = () => {
    setJugadoraEditandoId(null);
    setEditJugadoraNombre("");
    setEditJugadoraDorsal("");
    setEditJugadoraApodo("");
  };

  const handleGuardarJugadora = async (jugadoraId) => {
    if (!editJugadoraNombre.trim() || !editJugadoraDorsal.trim()) return;
    setEditJugadoraLoading(true);
    setErrorMsg("");
    try {
      await updateDoc(doc(db, "Jugadoras", jugadoraId), {
        nombre: editJugadoraNombre.trim(),
        dorsal: Number(editJugadoraDorsal),
        apodo: editJugadoraApodo.trim(),
      });
      handleCancelarEditJugadora();
    } catch (err) {
      setErrorMsg("No se pudo guardar los cambios.");
    }
    setEditJugadoraLoading(false);
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setEmail("");
      setPassword("");
    } catch (error) {
      setErrorMsg(error.message);
    }
  };

  const handleGoogleLogin = async () => {
    setErrorMsg("");
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      setErrorMsg(error.message);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setUserData(null);
    setEquipoActivo(null);
    setTab("home");
  };

  // Crear sesión si no existe (usada en panel sesión)
  const handleCrearSesion = async (tipo = "entreno", fechaOverride = null) => {
    const fecha = fechaOverride || fechaSesionSeleccionada;
    if (!equipoActivo || !fecha) return;
    setGuardandoSesion(true);
    setErrorMsg("");
    try {
      let asist = {};
      const vals = {};
      jugadoras.forEach(j => {
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
    } catch (err) {
      setErrorMsg("Error creando la sesión.");
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

  // Guardar sesión actual
  const handleGuardarSesion = async () => {
    if (!equipoActivo || !fechaSesionSeleccionada) return;
    setGuardandoSesion(true);
    setErrorMsg("");
    try {
      const valoracionesFiltradas = {};
      jugadorasSesion.forEach(j => {
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
    } catch (err) {
      setErrorMsg("Error guardando la sesión.");
    }
    setGuardandoSesion(false);
  };

  // --- UI login ---
  if (!user) {
    return (
      <LoginScreen
        isDarkMode={isDarkMode}
        colorMode={colorMode}
        onToggleColorMode={toggleColorMode}
        glassCardStyle={glassCardStyle}
        inputBorder={inputBorder}
        cardShadow={cardShadow}
        accent={accent}
        text={text}
        textSecondary={textSecondary}
        textMuted={textMuted}
        inputBg={inputBg}
        surface={surface}
        error={error}
        email={email}
        onEmailChange={setEmail}
        password={password}
        onPasswordChange={setPassword}
        onEmailLogin={handleEmailLogin}
        onGoogleLogin={handleGoogleLogin}
        errorMsg={errorMsg}
      />
    );
  }

  // --- Generación de contenido para las pestañas ---
  let tabContent = null;
  if (equipoActivo) {
    const equipoLabels = getEquipoLabels(equipoActivo.genero);
    if (tab === "home") {
      const { proximoEntreno, proximoPartido, hoyStr, mananaStr } = getProximosEventosInicio(sesionesEquipo);
      const abrirEnCalendario = (fecha) => {
        if (!fecha) return;
        const [y, m] = fecha.split("-").map(Number);
        setAnioActual(y);
        setMesActual(m - 1);
        setFechaSesionSeleccionada(fecha);
        setTab("sesiones");
      };
      const programarEntreno = () => programarDesdeInicio("entreno");
      const programarPartido = () => programarDesdeInicio("partido");

      tabContent = (
        <HomeTab
          equipoActivo={equipoActivo}
          sesionesLoading={sesionesLoading}
          proximoEntreno={proximoEntreno}
          proximoPartido={proximoPartido}
          hoyStr={hoyStr}
          mananaStr={mananaStr}
          accent={accent}
          accentLight={accentLight}
          accentSoft={accentSoft}
          accentBorder={accentBorder}
          colorPartido={colorPartido}
          colorPartidoLight={colorPartidoLight}
          colorPartidoSoft={colorPartidoSoft}
          colorPartidoBorder={colorPartidoBorder}
          text={text}
          textMuted={textMuted}
          textSecondary={textSecondary}
          success={success}
          onOpenCalendar={abrirEnCalendario}
          onScheduleEntreno={programarEntreno}
          onSchedulePartido={programarPartido}
          guardandoSesion={guardandoSesion}
        />
      );
    } else if (tab === "sesiones") {
      const handlePrevMonth = () => {
        if (mesActual === 0) {
          setMesActual(11);
          setAnioActual(anioActual - 1);
        } else {
          setMesActual(mesActual - 1);
        }
      };
      const handleNextMonth = () => {
        if (mesActual === 11) {
          setMesActual(0);
          setAnioActual(anioActual + 1);
        } else {
          setMesActual(mesActual + 1);
        }
      };
      const handleVolverCalendario = () => {
        setFechaSesionSeleccionada(null);
        setSesionDoc(null);
        setSesionId(null);
        resetCamposSesion(sesionSetters);
        setSesionCargando(false);
        setGuardandoSesion(false);
        setErrorMsg("");
      };

      tabContent = (
        <CalendarioTab
          text={text}
          textMuted={textMuted}
          accent={accent}
          colorPartido={colorPartido}
          fechaSesionSeleccionada={fechaSesionSeleccionada}
          anioActual={anioActual}
          mesActual={mesActual}
          onPrevMonth={handlePrevMonth}
          onNextMonth={handleNextMonth}
          sesionesEquipo={sesionesEquipo}
          onSelectDate={setFechaSesionSeleccionada}
          sessionDayPanelProps={{
            fechaSesionSeleccionada,
            onVolver: handleVolverCalendario,
            sesionDoc,
            tipoSesion,
            sesionCargando,
            guardandoSesion,
            onCrearEntreno: () => handleCrearSesion("entreno"),
            onCrearPartido: () => handleCrearSesion("partido"),
            accent,
            accentSoft,
            accentLight,
            colorPartido,
            surface,
            inputBorder,
            sessionFormProps: {
              tipoSesion,
              sesionVista,
              onSesionVistaChange: setSesionVista,
              rivalPartido,
              onRivalPartidoChange: setRivalPartido,
              localPartido,
              onLocalPartidoChange: setLocalPartido,
              tematica,
              onTematicaChange: setTematica,
              ejercicios,
              onEjerciciosChange: setEjercicios,
              jugadorasSesion,
              jugadorasLoading,
              asistencias,
              valoraciones,
              setAsistencias,
              setValoraciones,
              onSubmit: handleGuardarSesion,
              guardandoSesion,
              onGoToPlantilla: () => setTab("plantilla"),
              accent,
              colorPartido,
              inputBorder,
              textMuted,
              textSecondary,
              text,
              success,
              error,
              cardBgElevated,
              equipoLabels,
            },
          }}
        />
      );
    } else if (tab === "players") {
      const sesionesFiltradas = filtrarSesionesPorPeriodo(sesionesEquipo, statsPeriodo, statsDesde, statsHasta);
      const rango = getRangoFechasEstadisticas(statsPeriodo, statsDesde, statsHasta);
      const estadisticas = calcularEstadisticasJugadoras(jugadoras, sesionesFiltradas);
      const totalEntrenos = sesionesFiltradas.filter(s => normalizarTipoSesion(s) === "entreno").length;
      const totalPartidos = sesionesFiltradas.filter(s => normalizarTipoSesion(s) === "partido").length;
      tabContent = (
        <EstadisticasTab
          equipoActivo={equipoActivo}
          text={text}
          textSecondary={textSecondary}
          textMuted={textMuted}
          accent={accent}
          accentLight={accentLight}
          accentSoft={accentSoft}
          colorPartido={colorPartido}
          colorPartidoLight={colorPartidoLight}
          inputBorder={inputBorder}
          inputBg={inputBg}
          cardBgElevated={cardBgElevated}
          surface={surface}
          error={error}
          success={success}
          tableHeader={tableHeader}
          tableHeaderAccent={tableHeaderAccent}
          statsPeriodo={statsPeriodo}
          onStatsPeriodoChange={setStatsPeriodo}
          statsDesde={statsDesde}
          onStatsDesdeChange={setStatsDesde}
          statsHasta={statsHasta}
          onStatsHastaChange={setStatsHasta}
          rango={rango}
          totalEntrenos={totalEntrenos}
          totalPartidos={totalPartidos}
          jugadorasLoading={jugadorasLoading}
          sesionesLoading={sesionesLoading}
          jugadoras={jugadoras}
          sesionesFiltradas={sesionesFiltradas}
          statsVista={statsVista}
          onStatsVistaChange={setStatsVista}
          estadisticas={estadisticas}
          equipoLabels={equipoLabels}
          onGoToPlantilla={() => setTab("plantilla")}
        />
      );
    } else if (tab === "plantilla") {
      tabContent = (
        <PlantillaTab
          equipoLabels={equipoLabels}
          text={text}
          accent={accent}
          plantillaFormProps={{
            handleAddJugadora: handleAddJugadora,
            jugadoraNombre,
            setJugadoraNombre,
            jugadoraDorsal,
            setJugadoraDorsal,
            jugadoraApodo,
            setJugadoraApodo,
            addJugadoraLoading,
            accent,
            accentShadow,
            inputBorder,
            inputBg,
            surface,
            text,
            labels: equipoLabels,
          }}
          jugadorasLoading={jugadorasLoading}
          jugadoras={jugadoras}
          plantillaRowProps={{
            isEditingId: jugadoraEditandoId,
            editNombre: editJugadoraNombre,
            setEditNombre: setEditJugadoraNombre,
            editDorsal: editJugadoraDorsal,
            setEditDorsal: setEditJugadoraDorsal,
            editApodo: editJugadoraApodo,
            setEditApodo: setEditJugadoraApodo,
            editLoading: editJugadoraLoading,
            onStartEdit: handleIniciarEditJugadora,
            onCancelEdit: handleCancelarEditJugadora,
            onSaveEdit: handleGuardarJugadora,
            onDelete: handleEliminarJugadora,
            accent,
            accentShadow,
            inputBorder,
            inputBg,
            surface,
            text,
            textSecondary,
            error,
            labels: equipoLabels,
          }}
        />
      );
    }
  }

  // --- Render Principal ---
  const showTeamNav = equipoActivo && (userData?.clubId || userData?.rol === "superadmin");
  const esSuperadmin = userData?.rol === "superadmin";
  const esCoordinador = isCoordinador(userData?.rol);

  const getNombreClubActivo = () => {
    if (userData?.clubNombre && (!equipoActivo?.clubId || equipoActivo.clubId === userData.clubId)) {
      return userData.clubNombre;
    }
    if (equipoActivo?.clubId) {
      const nombre = getClubNombre(equipoActivo.clubId);
      if (nombre !== "Club") return nombre;
    }
    return userData?.clubNombre || "Club";
  };

  const equiposListaProps = {
    esSuperadmin,
    equipos,
    userClubId: userData?.clubId,
    equiposLoading,
    permitirCrearForm: !!userData?.clubId,
    nuevoEquipoNombre,
    onNuevoEquipoNombreChange: setNuevoEquipoNombre,
    nuevoEquipoTipoCanasta,
    onNuevoEquipoTipoCanastaChange: setNuevoEquipoTipoCanasta,
    nuevoEquipoGenero,
    onNuevoEquipoGeneroChange: setNuevoEquipoGenero,
    crearEquipoLoading,
    onCrearEquipo: handleCrearEquipo,
    equipoEditProps,
    onEntrarEquipo: handleEntrarEquipo,
    getClubNombre,
    accent,
    accentLight,
    onAccent,
    text,
    textSecondary,
    textMuted,
    inputBorder,
    inputBg,
    cardBgElevated,
  };

  const superadminClubesPanelProps = {
    userData,
    accent,
    accentLight,
    accentSoft,
    text,
    textSecondary,
    textMuted,
    inputBorder,
    inputBg,
    onAccent,
    cardBgElevated,
    onQuitarMiClub: handleQuitarMiClub,
    demoSeedProps,
    solicitudesLoading,
    solicitudesClub,
    onAprobarSolicitud: handleAprobarSolicitudClub,
    onRechazarSolicitud: handleRechazarSolicitudClub,
    nuevoClubNombre,
    onNuevoClubNombreChange: setNuevoClubNombre,
    onCrearClub: handleCrearClub,
    gestionLoading,
    clubes,
    onSelectClub: handleSelectClub,
  };

  const superadminEquiposPanelProps = {
    userData,
    demoSeedProps,
    equiposFiltroSuperadmin,
    onEquiposFiltroChange: setEquiposFiltroSuperadmin,
    accent,
    accentLight,
    accentSoft,
    textMuted,
    inputBorder,
    equiposListaProps,
  };

  const headerBarStyle = {
    ...glassCardStyle,
    borderRadius: compactHeader ? 12 : 16,
    boxShadow: cardShadow,
    border: `1px solid ${inputBorder}`,
  };

  return (
    <div
      className="app-shell"
      data-device-preview={devicePreview}
      data-user-role={userData?.rol || ""}
      data-compact-header={compactHeader ? "true" : "false"}
      style={{ fontFamily: "'Inter',system-ui,sans-serif" }}
    >
      <BlurredBackground isDark={isDarkMode} />
      <div className="device-preview-viewport">
        <div className="device-preview-frame">
      <AppHeader
        compact={compactHeader}
        barStyle={headerBarStyle}
        inputBorder={inputBorder}
        accent={accent}
        text={text}
        textMuted={textMuted}
        accentLight={accentLight}
        cardBgElevated={cardBgElevated}
        userData={userData}
        canSeedDemoData={canSeedDemoData}
        seedingDemo={seedingDemo}
        onSeedDemo={handleSeedDemoData}
        devicePreview={devicePreview}
        onDevicePreviewChange={setDevicePreview}
        colorMode={colorMode}
        onToggleColorMode={toggleColorMode}
        onOpenOpciones={handleOpenOpciones}
        onLogout={handleLogout}
        onGoHome={handleGoHome}
      />
      <main className="app-main">
        <div className={`app-card${showTeamNav ? " app-card--with-nav" : ""}`} style={{ ...glassCardStyle, boxShadow: cardShadow, border: `1px solid ${inputBorder}`, display: "flex", flexDirection: "column", justifyContent: "flex-start", alignItems: showTeamNav ? "stretch" : "center", width: "100%" }}>
          {showOpcionesPanel ? (
            <>
              <button
                type="button"
                onClick={() => setShowOpcionesPanel(false)}
                className="user-options-back"
                style={{ color: textMuted, borderColor: inputBorder, background: cardBgElevated }}
              >
                <IconChevronLeft size={16} color={textMuted} />
                <span>Volver</span>
              </button>
              <UserOptionsPanel {...userOptionsProps} />
            </>
          ) : esSuperadmin ? (
            equipoActivo ? (
              <TeamLayout
                clubNombre={getNombreClubActivo()}
                equipoNombre={equipoActivo.nombre}
                equipoMeta={`${formatTipoCanasta(equipoActivo.tipoCanasta)} · ${formatGeneroEquipo(equipoActivo.genero)}`}
                onCambiarEquipo={() => setEquipoActivo(null)}
                accentLight={accentLight}
                accentSoft={accentSoft}
                accentBorder={accentBorder}
                text={text}
                textSecondary={textSecondary}
                textMuted={textMuted}
                tabsMenu={tabsMenu}
                tab={tab}
                setTab={setTab}
                accent={accent}
                inputBorder={inputBorder}
                tabContent={tabContent}
              />
            ) : (
              <SuperadminPanel
                superadminVista={superadminVista}
                onSuperadminVistaChange={setSuperadminVista}
                accent={accent}
                accentLight={accentLight}
                accentSoft={accentSoft}
                textMuted={textMuted}
                inputBorder={inputBorder}
                cardBgElevated={cardBgElevated}
                userData={userData}
                clubesPanelProps={superadminClubesPanelProps}
                equiposPanelProps={superadminEquiposPanelProps}
                superadminUsuariosProps={superadminUsuariosProps}
              />
            )
          ) : (
            <>
              {userData?.clubId ? (
                equipoActivo ? (
                  <TeamLayout
                clubNombre={getNombreClubActivo()}
                equipoNombre={equipoActivo.nombre}
                equipoMeta={`${formatTipoCanasta(equipoActivo.tipoCanasta)} · ${formatGeneroEquipo(equipoActivo.genero)}`}
                onCambiarEquipo={() => setEquipoActivo(null)}
                accentLight={accentLight}
                accentSoft={accentSoft}
                accentBorder={accentBorder}
                text={text}
                textSecondary={textSecondary}
                textMuted={textMuted}
                tabsMenu={tabsMenu}
                tab={tab}
                setTab={setTab}
                accent={accent}
                inputBorder={inputBorder}
                tabContent={tabContent}
              />
                ) : esCoordinador ? (
                  <>
                    <div style={{ display: "flex", gap: 8, marginBottom: 24, padding: 4, background: cardBgElevated, borderRadius: 12, border: `1px solid ${inputBorder}`, width: "100%", maxWidth: 420 }}>
                      {[
                        { key: "equipos", label: "Equipos" },
                        { key: "coordinacion", label: "Coordinación" },
                      ].map(({ key, label }) => (
                        <button
                          key={key}
                          type="button"
                          onClick={() => setCoordinadorVista(key)}
                          style={{
                            flex: 1,
                            padding: "10px 14px",
                            borderRadius: 9,
                            border: coordinadorVista === key ? `1px solid rgba(42, 101, 112, 0.35)` : "1px solid transparent",
                            background: coordinadorVista === key ? accentSoft : "transparent",
                            color: coordinadorVista === key ? accentLight : textMuted,
                            fontWeight: 600,
                            fontSize: 14,
                            cursor: "pointer",
                            fontFamily: "inherit",
                          }}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                    {coordinadorVista === "coordinacion" ? (
                      <CoordinacionPanel {...coordinacionProps} />
                    ) : (
                      <EquiposListaContainer
                        {...equiposListaProps}
                        titulo={<>Equipos del Club: <span style={{ color: text }}>{userData.clubNombre}</span></>}
                        mostrarClub={false}
                        permitirCrear={true}
                      />
                    )}
                  </>
                ) : (
                  <>
                    <EquiposListaContainer
                      {...equiposListaProps}
                      titulo={<>Equipos del Club: <span style={{ color: text }}>{userData.clubNombre}</span></>}
                      mostrarClub={false}
                      permitirCrear={true}
                    />
                  </>
                )
              ) : (
                <div className="section-heading" style={{ marginTop: 65, fontSize: 23, fontWeight: 800 }}>
                  <div>Paso 1:<br /><span style={{ color: accent }}>Solicita unirte a tu Club</span></div>
                  {userData?.solicitudClubId && !userData?.clubId && (
                    <div
                      style={{
                        marginTop: 20,
                        width: "98%",
                        padding: "14px 16px",
                        borderRadius: 12,
                        background: accentSoft,
                        border: `1px solid ${accentBorder}`,
                        color: text,
                        fontSize: 14,
                        lineHeight: 1.5,
                        fontWeight: 500,
                      }}
                    >
                      Tu solicitud para <span style={{ color: accentLight, fontWeight: 700 }}>{userData.solicitudClubNombre}</span> está pendiente de aprobación por el superadmin.
                    </div>
                  )}
                  <div style={{ marginTop: 35, width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: 15 }}>
                    {selectClubLoading ? (
                      <div className="empty-state-text" style={{ fontSize: 18 }}>Cargando clubes...</div>
                    ) : clubes.length === 0 ? (
                      <div className="empty-state-text" style={{ fontSize: 16.5 }}>No hay clubes disponibles.</div>
                    ) : (
                      <div className="content-medium responsive-grid-list" style={{ width: "98%" }}>
                        {clubes.map(club => (
                          <div key={club.id} className="entity-list-card">
                            <div className="entity-list-card__body">
                              <div className="entity-list-card__title-row">
                                <span className="entity-list-card__dot">●</span>
                                <span className="entity-list-card__title">{club.nombre}</span>
                              </div>
                            </div>
                            <button
                              type="button"
                              className="entity-list-card__action"
                              onClick={() => handleSolicitarClub(club)}
                              disabled={userData?.solicitudClubId === club.id}
                            >
                              {userData?.solicitudClubId === club.id ? "Solicitado" : "Solicitar"}
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
          {errorMsg && <div style={{ color: error, background: "rgba(248,113,113,0.1)", border: `1px solid rgba(248,113,113,0.25)`, marginTop: 28, fontSize: 14, padding: "12px 16px", borderRadius: 12, width: "98%", textAlign: "center", fontWeight: 600 }}>{errorMsg}</div>}
        </div>
      </main>
        </div>
      </div>
    </div>
  );
}

export default App;