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
  getCalendarMatrix,
  dayNames,
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
  IconGear,
  IconX,
} from "./components/icons.jsx";
import { AppHeader } from "./components/AppHeader.jsx";
import { AppBrand } from "./components/AppBrand.jsx";
import { BlurredBackground } from "./components/BlurredBackground.jsx";
import { ThemeToggleButton } from "./components/ThemeToggleButton.jsx";
import { UserOptionsPanel } from "./components/UserOptionsPanel.jsx";
import { SuperadminUsuariosPanel } from "./components/SuperadminUsuariosPanel.jsx";
import { EquipoListRow } from "./components/EquipoListRow.jsx";
import { CoordinacionPanel } from "./components/CoordinacionPanel.jsx";
import { DemoSeedCard } from "./components/DemoSeedCard.jsx";
import { TeamContextHeader } from "./components/TeamContextHeader.jsx";
import { TabNav } from "./components/TabNav.jsx";
import { AsistenciaValoracionPanel } from "./components/AsistenciaValoracionPanel.jsx";
import { HomeEventCard } from "./components/HomeEventCard.jsx";
import { EstadisticasTablaTipo } from "./components/EstadisticasTablaTipo.jsx";


const THEME = THEMES.dark;

// ----------- PlantillaForm extraído a componente estable --------------
function PlantillaForm({
  handleAddJugadora,
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
  labels,
}) {
  const playerLabels = labels || getEquipoLabels(GENERO_FEMENINO);
  return (
    <form
      onSubmit={handleAddJugadora}
      style={{
        background: surface,
        padding: "18px 24px",
        borderRadius: 16,
        boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
        border: `1px solid ${inputBorder}`,
        display: "flex",
        flexDirection: "column",
        gap: 14,
        width: "100%",
        maxWidth: 560
      }}
      autoComplete="off"
    >
      <div className="plantilla-form-row plantilla-form-row--inputs">
        <input
          type="text"
          placeholder="Nombre"
          value={jugadoraNombre}
          onChange={e => setJugadoraNombre(e.target.value)}
          required
          style={{
            flex: 1,
            padding: "10px 13px",
            fontSize: 16.5,
            border: `1px solid ${inputBorder}`,
            borderRadius: 10,
            background: inputBg,
            color: text,
            outline: "none",
            fontWeight: 500,
            minWidth: 0
          }}
        />
        <input
          type="number"
          placeholder="Dorsal"
          value={jugadoraDorsal}
          onChange={e => setJugadoraDorsal(e.target.value.replace(/^0+/, ""))}
          min={1}
          required
          style={{
            width: 64,
            padding: "10px 10px",
            fontSize: 16.5,
            border: `1px solid ${inputBorder}`,
            borderRadius: 10,
            background: inputBg,
            color: text,
            outline: "none",
            fontWeight: 500
          }}
        />
        <input
          type="text"
          placeholder="Apodo"
          value={jugadoraApodo}
          onChange={e => setJugadoraApodo(e.target.value)}
          style={{
            flex: 1,
            padding: "10px 13px",
            fontSize: 16.5,
            border: `1px solid ${inputBorder}`,
            borderRadius: 10,
            background: inputBg,
            color: text,
            outline: "none",
            fontWeight: 500,
            minWidth: 0
          }}
        />
      </div>
      <button
        type="submit"
        style={{
          background: accent,
          color: "#fff",
          border: "none",
          borderRadius: 10,
          padding: "11px 0",
          fontWeight: 600,
          fontSize: 16,
          cursor: "pointer",
          marginTop: 5,
          boxShadow: `0 4px 14px ${accentShadow}`,
          transition: "all .16s",
          letterSpacing: "0.013em"
        }}
        disabled={addJugadoraLoading || !jugadoraNombre.trim() || !jugadoraDorsal.trim()}
        tabIndex={0}
      >
        {playerLabels.anadirJugador}
      </button>
    </form>
  );
}

function PlantillaJugadoraRow({
  jugadora,
  isEditing,
  editNombre,
  setEditNombre,
  editDorsal,
  setEditDorsal,
  editApodo,
  setEditApodo,
  editLoading,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onDelete,
  accent,
  accentShadow,
  inputBorder,
  inputBg,
  surface,
  text,
  textSecondary,
  error,
  labels,
}) {
  const playerLabels = labels || getEquipoLabels(GENERO_FEMENINO);
  const inputStyle = {
    padding: "8px 10px",
    fontSize: 15,
    border: `1px solid ${inputBorder}`,
    borderRadius: 8,
    background: inputBg,
    color: text,
    outline: "none",
    fontWeight: 500,
    minWidth: 0,
  };

  if (isEditing) {
    return (
      <div className="plantilla-jugadora-row plantilla-jugadora-row--editing" style={{ background: surface, borderLeftColor: accent }}>
        <div className="plantilla-jugadora-row__edit-fields">
          <input
            type="text"
            placeholder="Nombre"
            value={editNombre}
            onChange={e => setEditNombre(e.target.value)}
            required
            style={{ ...inputStyle, flex: 1 }}
          />
          <input
            type="number"
            placeholder="Dorsal"
            value={editDorsal}
            onChange={e => setEditDorsal(e.target.value.replace(/^0+/, ""))}
            min={1}
            required
            style={{ ...inputStyle, width: 64 }}
          />
          <input
            type="text"
            placeholder="Apodo"
            value={editApodo}
            onChange={e => setEditApodo(e.target.value)}
            style={{ ...inputStyle, flex: 1 }}
          />
        </div>
        <div className="plantilla-jugadora-row__edit-actions">
          <button
            type="button"
            className="plantilla-jugadora-row__btn plantilla-jugadora-row__btn--save"
            style={{ background: accent, boxShadow: `0 2px 10px ${accentShadow}` }}
            onClick={() => onSaveEdit(jugadora.id)}
            disabled={editLoading || !editNombre.trim() || !editDorsal.trim()}
          >
            {editLoading ? "Guardando…" : "Guardar"}
          </button>
          <button
            type="button"
            className="plantilla-jugadora-row__btn plantilla-jugadora-row__btn--cancel"
            onClick={onCancelEdit}
            disabled={editLoading}
          >
            Cancelar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="plantilla-jugadora-row" style={{ background: surface, borderLeftColor: accent }}>
      <div className="plantilla-jugadora-row__info">
        <div className="plantilla-jugadora-row__dorsal" style={{ color: accent }}>{jugadora.dorsal}</div>
        <div className="plantilla-jugadora-row__name-block">
          <span className="plantilla-jugadora-row__name" style={{ color: text }}>{jugadora.nombre}</span>
          {jugadora.apodo?.trim() && (
            <span className="plantilla-jugadora-row__apodo" style={{ color: textSecondary }}>"{jugadora.apodo}"</span>
          )}
        </div>
      </div>
      <div className="plantilla-jugadora-row__actions">
        <button
          type="button"
          className="plantilla-jugadora-row__icon-btn plantilla-jugadora-row__icon-btn--edit"
          onClick={() => onStartEdit(jugadora)}
          aria-label={`Editar ${jugadora.nombre}`}
          title={playerLabels.editarJugador}
          style={{ color: accent, borderColor: `${accent}55`, background: `${accent}14` }}
        >
          <IconGear size={18} />
        </button>
        <button
          type="button"
          className="plantilla-jugadora-row__icon-btn plantilla-jugadora-row__icon-btn--delete"
          onClick={() => onDelete(jugadora)}
          aria-label={`Eliminar ${jugadora.nombre}`}
          title={playerLabels.eliminarJugador}
          style={{ color: error }}
        >
          <IconX size={18} />
        </button>
      </div>
    </div>
  );
}

function resetCamposSesion(setters) {
  const {
    setTematica, setEjercicios, setAsistencias, setValoraciones,
    setTipoSesion, setRivalPartido, setLocalPartido, setSesionVista,
  } = setters;
  setTematica("");
  setEjercicios("");
  setAsistencias({});
  setValoraciones({});
  setTipoSesion("entreno");
  setRivalPartido("");
  setLocalPartido("casa");
  setSesionVista("datos");
}

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
      <div className="login-page" style={{ fontFamily: "'Inter',system-ui,sans-serif" }}>
        <BlurredBackground isDark={isDarkMode} />
        <div className="login-page__toolbar">
          <ThemeToggleButton colorMode={colorMode} onToggle={toggleColorMode} />
        </div>
        <div className="login-card" style={{ ...glassCardStyle, display: "flex", flexDirection: "column", gap: 18, border: `1px solid ${inputBorder}`, boxShadow: cardShadow }}>
          <AppBrand accent={accent} text={text} fontSize={26} />
          <div style={{ color: textSecondary, fontSize: 16, marginTop: 4, fontWeight: 500 }}>Inicia sesión para continuar</div>
          <form onSubmit={handleEmailLogin} style={{ display: "flex", flexDirection: "column", gap: 14, width: "100%" }} autoComplete="off">
            <input type="email" placeholder="Correo electrónico" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="username" style={{ padding: "13px 16px", fontSize: 15, background: inputBg, color: text, border: `1px solid ${inputBorder}`, borderRadius: 12, outline: "none", transition: "border .18s" }} onFocus={e => (e.target.style.border = `1.5px solid ${accent}`)} onBlur={e => (e.target.style.border = `1px solid ${inputBorder}`)} />
            <input type="password" placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" style={{ padding: "13px 16px", fontSize: 15, background: inputBg, color: text, border: `1px solid ${inputBorder}`, borderRadius: 12, outline: "none", transition: "border .18s" }} onFocus={e => (e.target.style.border = `1.5px solid ${accent}`)} onBlur={e => (e.target.style.border = `1px solid ${inputBorder}`)} />
            <button type="submit" style={{ marginTop: 4, padding: "13px 0", background: accent, color: "#fff", fontWeight: 600, fontSize: 16, border: "none", borderRadius: 12, cursor: "pointer", transition: "all .12s", boxShadow: "0 4px 16px rgba(42, 101, 112, 0.35)", letterSpacing: ".2px" }}>Ingresar</button>
          </form>
          <div style={{ textAlign: "center", color: textMuted, margin: "4px 0", fontSize: 12, fontWeight: 500 }}>— o continúa con —</div>
          <button onClick={handleGoogleLogin} style={{ background: surface, color: text, border: `1px solid ${inputBorder}`, padding: "12px 0", borderRadius: 12, fontWeight: 600, fontSize: 15, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 12 }}>
            <svg width="22" height="22" viewBox="0 0 48 48">
              <g>
                <path fill="#4285F4" d="M45.34 24.49c0-1.59-.14-3.16-.41-4.66H24v8.84h12.06c-.52 2.72-2.18 5.04-4.72 6.59v5.47h7.62c4.47-4.11 7.05-10.16 7.05-16.24z"/>
                <path fill="#34A853" d="M24 47c6.17 0 11.39-2.05 15.18-5.56l-7.62-5.47c-2.12 1.43-4.84 2.26-7.56 2.26-5.8 0-10.72-3.92-12.5-9.2h-7.7v5.75C7.5 42.09 15.17 47 24 47z"/>
                <path fill="#FBBC05" d="M11.5 28.03A13.63 13.63 0 0 1 10 24c0-1.39.24-2.75.5-4.03v-5.75h-7.7A23.77 23.77 0 0 0 0 24c0 3.74.9 7.29 2.5 10.3l7.7-5.75z"/>
                <path fill="#EA4335" d="M24 9.5c3.36 0 6.37 1.15 8.75 3.42l6.56-6.41C35.37 2.05 30.15 0 24 0 15.17 0 7.5 4.91 2.5 13.7l7.7 5.75c1.78-5.28 6.7-9.2 12.5-9.2z"/>
              </g>
            </svg>
            Iniciar sesión con Google
          </button>
          {errorMsg && <div style={{ color: error, marginTop: 8, background: "rgba(248,113,113,0.1)", border: `1px solid rgba(248,113,113,0.25)`, padding: "10px 12px", borderRadius: 10, fontWeight: 500, fontSize: 14, textAlign: "center" }}>{errorMsg}</div>}
        </div>
      </div>
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
        <div className="home-dashboard" style={{ margin: "0 auto", padding: "16px 0 8px" }}>
          <div className="home-dashboard__intro">
            <div style={{ color: text, fontSize: 20, fontWeight: 700, letterSpacing: "-0.02em" }}>
              {equipoActivo.nombre}
            </div>
            <div style={{ marginTop: 4, fontSize: 13, fontWeight: 600, color: textMuted }}>
              {formatTipoCanasta(equipoActivo.tipoCanasta)} · {formatGeneroEquipo(equipoActivo.genero)}
            </div>
            <div style={{ marginTop: 4, fontSize: 14, fontWeight: 500, color: textSecondary }}>
              Resumen del equipo
            </div>
          </div>

          {sesionesLoading ? (
            <div style={{ color: textMuted, fontSize: 15, fontStyle: "italic", textAlign: "center" }}>
              Cargando calendario…
            </div>
          ) : (
            <div className="home-dashboard__cards">
              <HomeEventCard
                tipo="entreno"
                sesion={proximoEntreno}
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
                onOpen={abrirEnCalendario}
                onSchedule={proximoEntreno ? undefined : programarEntreno}
                scheduling={guardandoSesion}
              />
              <HomeEventCard
                tipo="partido"
                sesion={proximoPartido}
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
                onOpen={abrirEnCalendario}
                onSchedule={proximoPartido ? undefined : programarPartido}
                scheduling={guardandoSesion}
              />
            </div>
          )}
        </div>
      );
    } else if (tab === "sesiones") {
      // --- CALENDARIO VISUAL SESIONES ---
      const monthNames = [
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
      ];

      // Para lookup rápido de fechas con sesión
      const sesionesPorFecha = {};
      sesionesEquipo.forEach(s => {
        sesionesPorFecha[s.fecha] = s;
      });

      // Pasar view de mes actual y año actual
      const weeksMatrix = getCalendarMatrix(anioActual, mesActual);

      tabContent = (
        <div className="content-block" style={{ display: "flex", flexDirection: "column", gap: 27, width: "100%", alignItems: "center", padding: "13px 0 33px 0" }}>
          <h2 style={{ color: text, fontWeight: 700, fontSize: 22, letterSpacing: "-0.02em", marginBottom: 2, textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
            <IconCalendar size={22} color={accent} />
            Gestión de Calendario
          </h2>
          {!fechaSesionSeleccionada && (
            <div style={{ display: "flex", gap: 16, fontSize: 12.5, color: textMuted, marginBottom: -8 }}>
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 10, height: 10, borderRadius: 99, background: accent, display: "inline-block" }} />
                Entreno
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 10, height: 10, borderRadius: 99, background: colorPartido, display: "inline-block" }} />
                Partido
              </span>
            </div>
          )}
          {/* Panel mensual */}
          {!fechaSesionSeleccionada && (
            <div className="content-wide calendar-panel">
              <div className="calendar-nav">
                <button
                  type="button"
                  className="calendar-nav-btn"
                  onClick={() => {
                    if (mesActual === 0) {
                      setMesActual(11);
                      setAnioActual(anioActual - 1);
                    } else {
                      setMesActual(mesActual - 1);
                    }
                  }}
                  tabIndex={0}
                  aria-label="Mes anterior"
                >{"‹"}</button>
                <span className="calendar-month-title">
                  {monthNames[mesActual]} {anioActual}
                </span>
                <button
                  type="button"
                  className="calendar-nav-btn"
                  onClick={() => {
                    if (mesActual === 11) {
                      setMesActual(0);
                      setAnioActual(anioActual + 1);
                    } else {
                      setMesActual(mesActual + 1);
                    }
                  }}
                  tabIndex={0}
                  aria-label="Mes siguiente"
                >{"›"}</button>
              </div>
              <div className="calendar-weekdays">
                {dayNames.map(d => (
                  <div key={d} className="calendar-weekday">{d}</div>
                ))}
              </div>
              <div
                className="calendar-grid"
                style={{ gridTemplateRows: `repeat(${weeksMatrix.length}, 1fr)` }}
              >
                {weeksMatrix.map((semana, widx) =>
                  semana.map(({ date, otherMonth }, didx) => {
                    const ymd = formatDateYYYYMMDD(date);
                    const sesionDia = sesionesPorFecha[ymd];
                    const tieneSesion = !!sesionDia;
                    const esPartido = tieneSesion && normalizarTipoSesion(sesionDia) === "partido";
                    const hoy = formatDateYYYYMMDD(new Date());
                    const colorEvento = esPartido ? colorPartido : accent;
                    return (
                      <button
                        key={widx + "-" + didx}
                        type="button"
                        disabled={otherMonth}
                        onClick={() => setFechaSesionSeleccionada(ymd)}
                        className={`calendar-day${otherMonth ? " calendar-day--other" : ""}${ymd === hoy ? " calendar-day--today" : ""}`}
                        style={{
                          borderColor: tieneSesion ? colorEvento : undefined,
                        }}
                        tabIndex={otherMonth ? -1 : 0}
                      >
                        {date.getDate()}
                        {tieneSesion && (
                          <span
                            className="calendar-day__dot"
                            style={{ background: colorEvento }}
                          />
                        )}
                        {ymd === hoy && (
                          <span className="calendar-day__today-mark" title="Hoy" />
                        )}
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* Panel de sesión (por día) */}
          {fechaSesionSeleccionada && (
            <div className="session-day-panel" style={{
              width: "100%",
              background: surface,
              borderRadius: 16,
              boxShadow: "0 2px 15px 0 rgba(0,0,0,0.10)",
              border: `1px solid ${inputBorder}`,
              margin: "auto",
              padding: "23px 22px 26px",
              display: "flex",
              flexDirection: "column",
              gap: 15,
              alignItems: "stretch",
              position: "relative"
            }}>
              {/* Botón volver */}
              <button
                style={{
                  background: "transparent",
                  color: accent,
                  border: `1.3px solid ${accent}`,
                  borderRadius: 10,
                  fontWeight: "bold",
                  fontSize: 15.7,
                  padding: "9px 18px",
                  marginBottom: 18,
                  width: "fit-content",
                  boxShadow: "0 2px 8px rgba(42, 101, 112, 0.10)",
                  cursor: "pointer",
                  alignSelf: "flex-start",
                  marginTop: -4,
                  marginLeft: -2,
                }}
                tabIndex={0}
                onClick={() => {
                  setFechaSesionSeleccionada(null);
                  setSesionDoc(null);
                  setSesionId(null);
                  resetCamposSesion(sesionSetters);
                  setSesionCargando(false);
                  setGuardandoSesion(false);
                  setErrorMsg("");
                }}
              >
                ← Volver al Calendario
              </button>
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                <div style={{ color: "#fff", fontWeight: 700, fontSize: 18.8 }}>
                  {fechaSesionSeleccionada.split("-").reverse().join("/")}
                </div>
                {sesionDoc && (
                  <span style={{
                    fontSize: 12,
                    fontWeight: 700,
                    padding: "4px 10px",
                    borderRadius: 99,
                    background: tipoSesion === "partido" ? "rgba(139,92,246,0.2)" : accentSoft,
                    color: tipoSesion === "partido" ? colorPartido : accentLight,
                    border: `1px solid ${tipoSesion === "partido" ? "rgba(139,92,246,0.45)" : "rgba(42, 101, 112, 0.35)"}`,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em"
                  }}>
                    {tipoSesion === "partido" ? "Partido" : "Entreno"}
                  </span>
                )}
              </div>

              {sesionCargando ? (
                <div style={{ color: "#bbb", fontSize: 16, fontStyle: "italic", padding: "12px 0", fontWeight: 500 }}>Cargando sesión...</div>
              ) : (
                <>
                  {(!sesionDoc && !guardandoSesion) ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 18, alignItems: "center", marginTop: 17, width: "100%" }}>
                      <div style={{ color: "#9F9FA7", fontWeight: 500, fontSize: 15, textAlign: "center" }}>
                        No hay evento registrado para esta fecha.<br />Elige qué quieres crear:
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 12, width: "100%", maxWidth: 320 }}>
                        <button
                          type="button"
                          style={{
                            background: accent,
                            color: "#fff",
                            border: "none",
                            borderRadius: 14,
                            padding: "14px 20px",
                            fontWeight: 700,
                            fontSize: 16,
                            cursor: "pointer",
                            boxShadow: "0 4px 14px rgba(42, 101, 112, 0.28)",
                          }}
                          onClick={() => handleCrearSesion("entreno")}
                          disabled={guardandoSesion}
                        >
                          + Crear Entreno
                        </button>
                        <button
                          type="button"
                          style={{
                            background: colorPartido,
                            color: "#fff",
                            border: "none",
                            borderRadius: 14,
                            padding: "14px 20px",
                            fontWeight: 700,
                            fontSize: 16,
                            cursor: "pointer",
                            boxShadow: "0 4px 14px rgba(139,92,246,0.35)",
                          }}
                          onClick={() => handleCrearSesion("partido")}
                          disabled={guardandoSesion}
                        >
                          + Crear Partido
                        </button>
                      </div>
                    </div>
                  ) : (
                    <form
                      className="session-form"
                      onSubmit={e => { e.preventDefault(); handleGuardarSesion(); }}
                      autoComplete="off"
                    >
                      <div className="session-subnav">
                        <button
                          type="button"
                          className={`session-subnav-btn${sesionVista === "datos" ? " session-subnav-btn--active" : ""}`}
                          onClick={() => setSesionVista("datos")}
                        >
                          {tipoSesion === "partido" ? "Datos del partido" : "Datos de sesión"}
                        </button>
                        <button
                          type="button"
                          className={`session-subnav-btn${sesionVista === "asistencia" ? " session-subnav-btn--active" : ""}`}
                          onClick={() => setSesionVista("asistencia")}
                        >
                          {tipoSesion === "partido"
                            ? `Convocatoria (${jugadorasSesion.filter(j => asistencias[j.id]).length}/${jugadorasSesion.length})`
                            : `Asistencia (${jugadorasSesion.filter(j => asistencias[j.id]).length}/${jugadorasSesion.length})`}
                        </button>
                      </div>

                      <div className="session-panel-layout">
                        <div className={`session-panel-datos${sesionVista !== "datos" ? " session-panel-section--hidden-mobile" : ""}`}>
                          {tipoSesion === "partido" ? (
                            <div style={{
                              background: "rgba(139,92,246,0.08)",
                              border: `1px solid rgba(139,92,246,0.35)`,
                              borderRadius: 12,
                              padding: "16px 14px",
                            }}>
                              <div style={{ color: colorPartido, fontSize: 13, fontWeight: 700, marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                                Información del partido
                              </div>
                              <label style={{ display: "block", color: textSecondary, fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
                                Rival
                              </label>
                              <input
                                type="text"
                                placeholder="Nombre del equipo rival"
                                value={rivalPartido}
                                onChange={e => setRivalPartido(e.target.value)}
                                style={{
                                  width: "100%",
                                  padding: "11px 13px",
                                  fontSize: 16,
                                  border: `1px solid ${inputBorder}`,
                                  borderRadius: 9,
                                  background: cardBgElevated,
                                  color: text,
                                  outline: "none",
                                  fontWeight: 500,
                                  marginBottom: 14,
                                }}
                              />
                              <label style={{ display: "block", color: textSecondary, fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
                                Condición
                              </label>
                              <div style={{ display: "flex", gap: 8 }}>
                                {["casa", "fuera"].map(op => (
                                  <button
                                    key={op}
                                    type="button"
                                    onClick={() => setLocalPartido(op)}
                                    style={{
                                      flex: 1,
                                      padding: "10px 0",
                                      borderRadius: 9,
                                      border: `1.5px solid ${localPartido === op ? colorPartido : inputBorder}`,
                                      background: localPartido === op ? "rgba(139,92,246,0.22)" : cardBgElevated,
                                      color: localPartido === op ? "#fff" : textMuted,
                                      fontWeight: 700,
                                      fontSize: 14,
                                      cursor: "pointer",
                                      textTransform: "capitalize",
                                    }}
                                  >
                                    {op === "casa" ? "En casa" : "Fuera"}
                                  </button>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <>
                              <div style={{ color: textSecondary, fontSize: 13, fontWeight: 600, marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                                Temática y ejercicios
                              </div>
                              <input
                                type="text"
                                placeholder="Temática"
                                value={tematica}
                                onChange={e => setTematica(e.target.value)}
                                style={{
                                  width: "100%",
                                  padding: "11px 13px",
                                  fontSize: 16.5,
                                  border: `1px solid ${inputBorder}`,
                                  borderRadius: 9,
                                  background: cardBgElevated,
                                  color: text,
                                  outline: "none",
                                  fontWeight: 500,
                                  marginBottom: 12,
                                }}
                              />
                              <textarea
                                placeholder="Ejercicios de la sesión"
                                value={ejercicios}
                                onChange={e => setEjercicios(e.target.value)}
                                rows={5}
                                style={{
                                  width: "100%",
                                  padding: "11px 13px",
                                  fontSize: 16.2,
                                  border: `1px solid ${inputBorder}`,
                                  borderRadius: 9,
                                  background: cardBgElevated,
                                  color: text,
                                  outline: "none",
                                  fontWeight: 500,
                                  resize: "vertical",
                                  minHeight: 120,
                                  maxHeight: 220,
                                }}
                              />
                            </>
                          )}
                        </div>

                        <div className={`session-panel-asistencia${sesionVista !== "asistencia" ? " session-panel-section--hidden-mobile" : ""}`}>
                          <AsistenciaValoracionPanel
                            jugadoras={jugadorasSesion}
                            jugadorasLoading={jugadorasLoading}
                            asistencias={asistencias}
                            valoraciones={valoraciones}
                            setAsistencias={setAsistencias}
                            setValoraciones={setValoraciones}
                            accent={tipoSesion === "partido" ? colorPartido : accent}
                            inputBorder={inputBorder}
                            textMuted={textMuted}
                            textSecondary={textSecondary}
                            success={success}
                            error={error}
                            cardBgElevated={cardBgElevated}
                            titulo={tipoSesion === "partido" ? "Convocatoria" : "Asistencia y valoración"}
                            resumenPresentes={tipoSesion === "partido"
                              ? (p, t) => t > 0
                                ? `${p} convocadas · ${t - p} fuera · valoración 1-5 si está convocada`
                                : equipoLabels.sinJugadoresPlantilla
                              : undefined}
                            btnTodasPresentes={tipoSesion === "partido" ? "Todas convocadas" : "Todas presentes"}
                            btnTodasAusentes={tipoSesion === "partido" ? "Ninguna convocada" : "Todas ausentes"}
                            onGoToPlantilla={() => setTab("plantilla")}
                            text={text}
                            labels={equipoLabels}
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="session-save-btn"
                        disabled={guardandoSesion}
                        style={tipoSesion === "partido" ? { background: colorPartido, boxShadow: "0 4px 16px rgba(139,92,246,0.35)" } : undefined}
                      >
                        Guardar {tipoSesion === "partido" ? "Partido" : "Sesión"}
                      </button>
                    </form>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      );
    } else if (tab === "players") {
      const sesionesFiltradas = filtrarSesionesPorPeriodo(sesionesEquipo, statsPeriodo, statsDesde, statsHasta);
      const rango = getRangoFechasEstadisticas(statsPeriodo, statsDesde, statsHasta);
      const estadisticas = calcularEstadisticasJugadoras(jugadoras, sesionesFiltradas);
      const totalEntrenos = sesionesFiltradas.filter(s => normalizarTipoSesion(s) === "entreno").length;
      const totalPartidos = sesionesFiltradas.filter(s => normalizarTipoSesion(s) === "partido").length;
      tabContent = (
        <div style={{ display: "flex", flexDirection: "column", gap: 18, width: "100%", alignItems: "center", padding: "8px 0 20px 0" }}>
          <div style={{ textAlign: "center", width: "100%" }}>
            <h2 style={{ color: text, fontWeight: 700, fontSize: 22, letterSpacing: "-0.02em", margin: "0 0 6px 0", display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
              <IconChart size={22} color={accent} />
              Estadísticas
            </h2>
            <div style={{ color: textSecondary, fontSize: 15, fontWeight: 500 }}>
              Equipo <span style={{ color: accentLight }}>{equipoActivo.nombre}</span>
            </div>
          </div>

          <div className="stats-filters" style={{
            width: "100%",
            background: cardBgElevated,
            border: `1px solid ${inputBorder}`,
            borderRadius: 14,
            padding: "14px 16px",
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}>
            <div style={{ color: textSecondary, fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Periodo
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {[
                { key: "semanal", label: "Semanal" },
                { key: "mensual", label: "Mensual" },
                { key: "rango", label: "Personalizado" },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setStatsPeriodo(key)}
                  style={{
                    padding: "8px 14px",
                    borderRadius: 9,
                    border: `1px solid ${statsPeriodo === key ? accent : inputBorder}`,
                    background: statsPeriodo === key ? accentSoft : "transparent",
                    color: statsPeriodo === key ? accentLight : textMuted,
                    fontWeight: 600,
                    fontSize: 13,
                    cursor: "pointer",
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
            {statsPeriodo === "rango" && (
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                <input type="date" value={statsDesde} onChange={e => setStatsDesde(e.target.value)} style={{ flex: 1, minWidth: 130, padding: "9px 10px", borderRadius: 9, border: `1px solid ${inputBorder}`, background: inputBg, color: text, fontSize: 14 }} />
                <span style={{ color: textMuted }}>→</span>
                <input type="date" value={statsHasta} onChange={e => setStatsHasta(e.target.value)} style={{ flex: 1, minWidth: 130, padding: "9px 10px", borderRadius: 9, border: `1px solid ${inputBorder}`, background: inputBg, color: text, fontSize: 14 }} />
              </div>
            )}
            <div style={{ color: textMuted, fontSize: 13 }}>
              {rango.inicio && rango.fin
                ? `${rango.inicio.split("-").reverse().join("/")} — ${rango.fin.split("-").reverse().join("/")} · ${totalEntrenos} entreno${totalEntrenos === 1 ? "" : "s"} · ${totalPartidos} partido${totalPartidos === 1 ? "" : "s"}`
                : "Selecciona un rango de fechas válido"}
            </div>
          </div>

          {(jugadorasLoading || sesionesLoading) ? (
            <div style={{ color: "#bbb", fontSize: 16, fontStyle: "italic", padding: "12px 0", fontWeight: 500 }}>
              Cargando estadísticas...
            </div>
          ) : jugadoras.length === 0 ? (
            <div style={{ color: textMuted, fontStyle: "italic", fontSize: 15.5, textAlign: "center" }}>
              {equipoLabels.noHayJugadoresPlantilla}{" "}
              <button
                type="button"
                onClick={() => setTab("plantilla")}
                style={{
                  background: "transparent",
                  border: "none",
                  color: accent,
                  fontWeight: 700,
                  cursor: "pointer",
                  padding: 0,
                  fontFamily: "inherit",
                  textDecoration: "underline",
                  textUnderlineOffset: 3,
                }}
              >
                Ir a Plantilla
              </button>
            </div>
          ) : sesionesFiltradas.length === 0 ? (
            <div style={{ color: "#757690", fontStyle: "italic", fontSize: 15.5, textAlign: "center", lineHeight: 1.5 }}>
              No hay entrenos ni partidos en el periodo seleccionado.
            </div>
          ) : (
            <>
              <div className="stats-type-nav" style={{
                width: "100%",
                display: "flex",
                gap: 6,
                padding: 4,
                background: cardBgElevated,
                borderRadius: 12,
                border: `1px solid ${inputBorder}`,
              }}>
                {[
                  { key: "entrenos", label: "Entrenos", color: accent },
                  { key: "partidos", label: "Partidos", color: colorPartido },
                  { key: "todo", label: "Todo", color: textSecondary },
                ].map(({ key, label, color: tabColor }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setStatsVista(key)}
                    className={`stats-type-nav-btn${statsVista === key ? " stats-type-nav-btn--active" : ""}`}
                    style={{
                      flex: 1,
                      border: statsVista === key ? `1px solid ${key === "partidos" ? "rgba(139,92,246,0.45)" : key === "entrenos" ? "rgba(42, 101, 112, 0.35)" : inputBorder}` : "1px solid transparent",
                      background: statsVista === key
                        ? (key === "partidos" ? "rgba(139,92,246,0.18)" : key === "entrenos" ? accentSoft : "rgba(148,163,184,0.12)")
                        : "transparent",
                      color: statsVista === key ? (key === "todo" ? text : tabColor) : textMuted,
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <div className="stats-sections" style={{ width: "100%", display: "flex", flexDirection: "column", gap: 20 }}>
                {(statsVista === "entrenos" || statsVista === "todo") && (
                  <EstadisticasTablaTipo
                    tipo="entreno"
                    totalSesiones={totalEntrenos}
                    estadisticas={estadisticas}
                    theme={{ accent, accentLight, colorPartido, colorPartidoLight, text, textMuted, textSecondary, surface, error, success, inputBorder, cardBgElevated, tableHeader, tableHeaderAccent }}
                    labels={equipoLabels}
                  />
                )}
                {(statsVista === "partidos" || statsVista === "todo") && (
                  <EstadisticasTablaTipo
                    tipo="partido"
                    totalSesiones={totalPartidos}
                    estadisticas={estadisticas}
                    theme={{ accent, accentLight, colorPartido, colorPartidoLight, text, textMuted, textSecondary, surface, error, success, inputBorder, cardBgElevated, tableHeader, tableHeaderAccent }}
                    labels={equipoLabels}
                  />
                )}
              </div>
            </>
          )}
        </div>
      );
    } else if (tab === "plantilla") {
      tabContent = (
        <div className="plantilla-tab" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 27, width: "100%" }}>
          <h2 style={{ color: text, fontWeight: 700, fontSize: 22, letterSpacing: "-0.02em", marginBottom: 0, display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
            <IconUsers size={22} color={accent} />
            {equipoLabels.plantillaTitulo}
          </h2>
          <PlantillaForm
            handleAddJugadora={handleAddJugadora}
            jugadoraNombre={jugadoraNombre}
            setJugadoraNombre={setJugadoraNombre}
            jugadoraDorsal={jugadoraDorsal}
            setJugadoraDorsal={setJugadoraDorsal}
            jugadoraApodo={jugadoraApodo}
            setJugadoraApodo={setJugadoraApodo}
            addJugadoraLoading={addJugadoraLoading}
            accent={accent}
            accentShadow={accentShadow}
            inputBorder={inputBorder}
            inputBg={inputBg}
            surface={surface}
            text={text}
            labels={equipoLabels}
          />
          <div className="content-medium" style={{ width: "99%", margin: "0 auto", marginTop: 10, display: "flex", flexDirection: "column", alignItems: "center", gap: 11 }}>
            {jugadorasLoading ? (
              <div style={{ color: "#bbb", fontSize: 16, fontStyle: "italic", padding: "12px 0", fontWeight: 500 }}>{equipoLabels.cargandoJugadores}</div>
            ) : jugadoras.length === 0 ? (
              <div style={{ color: "#757690", fontStyle: "italic", fontSize: 15.5 }}>{equipoLabels.noHayJugadoresPlantilla}</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 13, width: "100%", marginTop: 4 }}>
                {jugadoras.map(j => (
                  <PlantillaJugadoraRow
                    key={j.id}
                    jugadora={j}
                    isEditing={jugadoraEditandoId === j.id}
                    editNombre={editJugadoraNombre}
                    setEditNombre={setEditJugadoraNombre}
                    editDorsal={editJugadoraDorsal}
                    setEditDorsal={setEditJugadoraDorsal}
                    editApodo={editJugadoraApodo}
                    setEditApodo={setEditJugadoraApodo}
                    editLoading={editJugadoraLoading}
                    onStartEdit={handleIniciarEditJugadora}
                    onCancelEdit={handleCancelarEditJugadora}
                    onSaveEdit={handleGuardarJugadora}
                    onDelete={handleEliminarJugadora}
                    accent={accent}
                    accentShadow={accentShadow}
                    inputBorder={inputBorder}
                    inputBg={inputBg}
                    surface={surface}
                    text={text}
                    textSecondary={textSecondary}
                    error={error}
                    labels={equipoLabels}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      );
    }
  }

  // --- Render Principal ---
  const showTeamNav = equipoActivo && (userData?.clubId || userData?.rol === "superadmin");
  const esSuperadmin = userData?.rol === "superadmin";
  const esCoordinador = isCoordinador(userData?.rol);

  const renderEquiposLista = ({ titulo, mostrarClub, permitirCrear }) => {
    const equiposVisibles = esSuperadmin
      ? equipos
      : equipos.filter((equipo) => equipo.clubId === userData?.clubId);

    return (
    <div className="section-heading">
      <span className="section-heading__accent">{titulo}</span>
      {permitirCrear && userData?.clubId && (
        <form
          onSubmit={handleCrearEquipo}
          className="content-medium form-shell"
          style={{
            margin: "35px auto 14px auto",
            width: "96%",
            display: "flex",
            flexDirection: "column",
            gap: 12,
            padding: "16px 18px",
            background: cardBgElevated,
            border: `1px solid ${inputBorder}`,
            borderRadius: 14,
          }}
        >
          <input
            type="text"
            placeholder="Nombre del equipo"
            value={nuevoEquipoNombre}
            onChange={(e) => setNuevoEquipoNombre(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "12px 16px",
              fontSize: 16,
              border: `1px solid ${inputBorder}`,
              borderRadius: 10,
              background: inputBg,
              color: text,
              outline: "none",
              fontWeight: 500,
              fontFamily: "inherit",
            }}
            disabled={crearEquipoLoading}
          />
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <label style={{ flex: "1 1 160px", display: "flex", flexDirection: "column", gap: 6, color: textSecondary, fontSize: 13, fontWeight: 600 }}>
              Canasta
              <select
                value={nuevoEquipoTipoCanasta}
                onChange={(e) => setNuevoEquipoTipoCanasta(e.target.value)}
                disabled={crearEquipoLoading}
                style={{
                  padding: "10px 12px",
                  fontSize: 14,
                  border: `1px solid ${inputBorder}`,
                  borderRadius: 10,
                  background: inputBg,
                  color: text,
                  fontFamily: "inherit",
                }}
              >
                <option value={TIPO_CANASTA_GRANDE}>Canasta grande</option>
                <option value={TIPO_CANASTA_MINI}>Minibasket</option>
              </select>
            </label>
            <label style={{ flex: "1 1 160px", display: "flex", flexDirection: "column", gap: 6, color: textSecondary, fontSize: 13, fontWeight: 600 }}>
              Categoría
              <select
                value={nuevoEquipoGenero}
                onChange={(e) => setNuevoEquipoGenero(e.target.value)}
                disabled={crearEquipoLoading}
                style={{
                  padding: "10px 12px",
                  fontSize: 14,
                  border: `1px solid ${inputBorder}`,
                  borderRadius: 10,
                  background: inputBg,
                  color: text,
                  fontFamily: "inherit",
                }}
              >
                <option value={GENERO_FEMENINO}>Femenino</option>
                <option value={GENERO_MASCULINO}>Masculino</option>
              </select>
            </label>
          </div>
          <button
            type="submit"
            style={{
              background: accent,
              color: onAccent,
              border: "none",
              borderRadius: 10,
              padding: "12px 18px",
              fontWeight: 700,
              fontSize: 15,
              cursor: crearEquipoLoading ? "wait" : "pointer",
              fontFamily: "inherit",
              opacity: crearEquipoLoading ? 0.7 : 1,
            }}
            disabled={crearEquipoLoading || !nuevoEquipoNombre.trim()}
          >
            {crearEquipoLoading ? "Creando…" : "Crear equipo"}
          </button>
        </form>
      )}
      <div className="content-medium responsive-grid-list" style={{ width: "98%", margin: "17px auto 0" }}>
        {equiposLoading ? (
          <div className="empty-state-text" style={{ fontSize: 17, padding: "12px 0", gridColumn: "1 / -1" }}>Cargando equipos...</div>
        ) : equiposVisibles.length === 0 ? (
          <div className="empty-state-text" style={{ fontSize: 16.5, gridColumn: "1 / -1" }}>
            {permitirCrear ? "No hay equipos aún. ¡Crea el primero!" : "No hay equipos registrados."}
          </div>
        ) : (
          equiposVisibles.map(equipo => (
            <EquipoListRow
              key={equipo.id}
              equipo={equipo}
              clubNombre={getClubNombre(equipo.clubId)}
              mostrarClub={mostrarClub}
              canEdit={equipoEditProps.canEditEquipo(equipo)}
              isEditing={equipoEditProps.equipoEditandoId === equipo.id}
              editNombre={equipoEditProps.editEquipoNombre}
              setEditNombre={equipoEditProps.setEditEquipoNombre}
              editGenero={equipoEditProps.editEquipoGenero}
              setEditGenero={equipoEditProps.setEditEquipoGenero}
              editTipoCanasta={equipoEditProps.editEquipoTipoCanasta}
              setEditTipoCanasta={equipoEditProps.setEditEquipoTipoCanasta}
              saving={equipoEditProps.savingEquipoId === equipo.id}
              onStartEdit={equipoEditProps.onStartEditEquipo}
              onCancelEdit={equipoEditProps.onCancelEditEquipo}
              onSave={equipoEditProps.onSaveEquipo}
              onEntrar={handleEntrarEquipo}
              accent={accent}
              accentLight={accentLight}
              text={text}
              textSecondary={textSecondary}
              textMuted={textMuted}
              inputBorder={inputBorder}
              inputBg={inputBg}
              cardBgElevated={cardBgElevated}
              borderAccent={equipo.clubId === userData?.clubId ? accent : textMuted}
            />
          ))
        )}
      </div>
    </div>
    );
  };

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

  const renderTeamLayout = () => {
    const equipoMeta = `${formatTipoCanasta(equipoActivo.tipoCanasta)} · ${formatGeneroEquipo(equipoActivo.genero)}`;
    const contextProps = {
      clubNombre: getNombreClubActivo(),
      equipoNombre: equipoActivo.nombre,
      equipoMeta,
      onCambiarEquipo: () => setEquipoActivo(null),
      accentLight,
      accentSoft,
      accentBorder,
      text,
      textSecondary,
      textMuted,
    };
    const tabNavProps = { tabsMenu, tab, setTab, accent, accentSoft, textMuted, inputBorder };

    return (
      <div className="app-team-layout">
        <aside className="app-team-sidebar">
          <TeamContextHeader {...contextProps} variant="sidebar" />
          <TabNav {...tabNavProps} variant="desktop" />
        </aside>
        <div className="app-team-content">
          <TeamContextHeader {...contextProps} variant="compact" />
          <div className="app-tab-panel">
            {tabContent ?? (
              <div style={{ color: textMuted, textAlign: "center", padding: "24px 12px" }}>
                Selecciona una sección del menú.
              </div>
            )}
          </div>
          <div className="app-mobile-nav-spacer" aria-hidden="true" />
          <TabNav {...tabNavProps} variant="mobile" />
        </div>
      </div>
    );
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
              renderTeamLayout()
            ) : (
              <>
                <div style={{ display: "flex", gap: 8, marginBottom: 24, padding: 4, background: cardBgElevated, borderRadius: 12, border: `1px solid ${inputBorder}`, width: "100%", maxWidth: 520 }}>
                  {[
                    { key: "clubes", label: "Clubes" },
                    { key: "equipos", label: "Equipos" },
                    { key: "usuarios", label: "Usuarios" },
                  ].map(({ key, label }) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setSuperadminVista(key)}
                      style={{
                        flex: 1,
                        padding: "10px 14px",
                        borderRadius: 9,
                        border: superadminVista === key ? `1px solid rgba(42, 101, 112, 0.35)` : "1px solid transparent",
                        background: superadminVista === key ? accentSoft : "transparent",
                        color: superadminVista === key ? accentLight : textMuted,
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

                {superadminVista === "clubes" ? (
                  <>
                    <h2 style={{ color: accent, fontWeight: "bold", marginBottom: 16, fontSize: 30, letterSpacing: 0.7, textAlign: "center", textShadow: "0 4px 18px rgba(42, 101, 112, 0.13)" }}>Panel de Gestión de Clubes</h2>
                    <div style={{ width: "97%", marginBottom: 22, padding: "14px 18px", background: cardBgElevated, borderRadius: 12, border: `1px solid ${inputBorder}` }}>
                      {userData?.clubId ? (
                        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                          <div style={{ color: textSecondary, fontSize: 14 }}>
                            Mi club: <span style={{ color: accentLight, fontWeight: 700 }}>{userData.clubNombre}</span>
                          </div>
                          <button type="button" onClick={handleQuitarMiClub} style={{ background: "transparent", color: textMuted, border: `1px solid ${inputBorder}`, borderRadius: 8, padding: "6px 12px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                            Quitar
                          </button>
                        </div>
                      ) : (
                        <div style={{ color: textMuted, fontSize: 14, lineHeight: 1.5 }}>
                          Asigna un club como propio para crear y gestionar tus equipos.
                        </div>
                      )}
                    </div>
                    <DemoSeedCard {...demoSeedProps} />
                    {solicitudesLoading ? (
                      <div className="empty-state-text" style={{ width: "97%", marginBottom: 16, fontSize: 15 }}>Cargando solicitudes de club…</div>
                    ) : solicitudesClub.length > 0 && (
                      <div
                        style={{
                          width: "97%",
                          marginBottom: 20,
                          padding: "16px 18px",
                          background: cardBgElevated,
                          borderRadius: 12,
                          border: `1px solid ${inputBorder}`,
                          boxSizing: "border-box",
                        }}
                      >
                        <div style={{ color: text, fontWeight: 700, fontSize: 16, marginBottom: 10 }}>
                          Solicitudes de club pendientes
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                          {solicitudesClub.map((usuario) => (
                            <div
                              key={usuario.id}
                              style={{
                                display: "flex",
                                flexWrap: "wrap",
                                gap: 10,
                                alignItems: "center",
                                justifyContent: "space-between",
                                padding: "10px 12px",
                                borderRadius: 10,
                                border: `1px solid ${inputBorder}`,
                                background: inputBg,
                              }}
                            >
                              <div style={{ minWidth: 0 }}>
                                <div style={{ color: text, fontWeight: 600, fontSize: 14 }}>
                                  {usuario.nombre?.trim() || usuario.email || "Entrenador"}
                                </div>
                                <div style={{ color: textSecondary, fontSize: 13, marginTop: 2 }}>
                                  {usuario.clubNombre ? (
                                    <>Cambio de <span style={{ fontWeight: 600 }}>{usuario.clubNombre}</span> a <span style={{ color: accentLight, fontWeight: 700 }}>{usuario.solicitudClubNombre}</span></>
                                  ) : (
                                    <>Solicita: <span style={{ color: accentLight, fontWeight: 700 }}>{usuario.solicitudClubNombre}</span></>
                                  )}
                                </div>
                              </div>
                              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                                <button
                                  type="button"
                                  onClick={() => handleAprobarSolicitudClub(usuario)}
                                  style={{ background: accent, color: "#fff", border: "none", borderRadius: 8, padding: "7px 12px", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}
                                >
                                  Aprobar
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleRechazarSolicitudClub(usuario)}
                                  style={{ background: "transparent", color: textMuted, border: `1px solid ${inputBorder}`, borderRadius: 8, padding: "7px 12px", fontWeight: 600, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}
                                >
                                  Rechazar
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    <form onSubmit={handleCrearClub} className="content-wide form-shell" style={{ width: "96%", marginBottom: 30 }}>
                      <input type="text" placeholder="Nuevo nombre de Club" value={nuevoClubNombre} onChange={e => setNuevoClubNombre(e.target.value)} required style={{ flex: 1, padding: "15px 20px", fontSize: 17.5, border: "none", borderRadius: "14px 0 0 14px", background: inputBg, color: text, outline: "none", transition: "box-shadow .16s", fontWeight: 500 }} disabled={gestionLoading} onFocus={e => (e.target.parentNode.style.boxShadow = `0 0 0 2.5px ${accent}`)} onBlur={e => (e.target.parentNode.style.boxShadow = "none")} />
                      <button type="submit" style={{ background: accent, color: onAccent, border: "none", borderRadius: "0 14px 14px 0", padding: "15px 22px", fontWeight: "bold", fontSize: 17, cursor: "pointer", minHeight: 53, boxShadow: "0 2px 9px rgba(42, 101, 112, 0.08)", letterSpacing: 0.3 }} disabled={gestionLoading || !nuevoClubNombre.trim()}>Crear</button>
                    </form>
                    <div style={{ width: "97%", marginTop: 8, marginBottom: 0, display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
                      <div style={{ color: text, fontWeight: 700, fontSize: 17, marginBottom: 9, letterSpacing: ".03em" }}>Clubes registrados:</div>
                      {gestionLoading ? (
                        <div className="empty-state-text" style={{ padding: "18px 0 0 6px", fontSize: 17 }}>Cargando...</div>
                      ) : clubes.length === 0 ? (
                        <div className="empty-state-text" style={{ padding: "10px 0 0 5px", fontSize: 16.5 }}>No hay clubes registrados.</div>
                      ) : (
                        <div className="responsive-grid-list" style={{ width: "100%" }}>
                          {clubes.map(club => (
                            <div key={club.id} className="entity-list-card" style={{ borderLeftColor: userData?.clubId === club.id ? accent : textMuted }}>
                              <div className="entity-list-card__body">
                                <div className="entity-list-card__title-row">
                                  <span className="entity-list-card__dot">●</span>
                                  <span className="entity-list-card__title">{club.nombre}</span>
                                  {userData?.clubId === club.id && (
                                    <span style={{ marginLeft: 10, fontSize: 11, fontWeight: 700, color: accentLight, background: accentSoft, padding: "3px 8px", borderRadius: 6, flexShrink: 0 }}>MI CLUB</span>
                                  )}
                                </div>
                              </div>
                              {userData?.clubId !== club.id && (
                                <button type="button" className="entity-list-card__action" onClick={() => handleSelectClub(club)}>Mi club</button>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                ) : superadminVista === "usuarios" ? (
                  <SuperadminUsuariosPanel {...superadminUsuariosProps} />
                ) : (
                  <>
                    <DemoSeedCard {...demoSeedProps} />
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center", marginBottom: 8, width: "100%" }}>
                      {[
                        { key: "todos", label: "Todos los equipos" },
                        ...(userData?.clubId ? [{ key: "propio", label: `Mi club (${userData.clubNombre})` }] : []),
                      ].map(({ key, label }) => (
                        <button
                          key={key}
                          type="button"
                          onClick={() => setEquiposFiltroSuperadmin(key)}
                          style={{
                            padding: "8px 14px",
                            borderRadius: 9,
                            border: `1px solid ${equiposFiltroSuperadmin === key ? accent : inputBorder}`,
                            background: equiposFiltroSuperadmin === key ? accentSoft : "transparent",
                            color: equiposFiltroSuperadmin === key ? accentLight : textMuted,
                            fontWeight: 600,
                            fontSize: 13,
                            cursor: "pointer",
                          }}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                    {!userData?.clubId && (
                      <div style={{ color: textMuted, fontSize: 14, textAlign: "center", marginBottom: 12, lineHeight: 1.5 }}>
                        Puedes entrar en cualquier equipo. Para crear los tuyos, asigna un club en la pestaña Clubes.
                      </div>
                    )}
                    {renderEquiposLista({
                      titulo: equiposFiltroSuperadmin === "propio" ? `Equipos de ${userData.clubNombre}` : "Todos los equipos",
                      mostrarClub: equiposFiltroSuperadmin === "todos",
                      permitirCrear: equiposFiltroSuperadmin === "propio",
                    })}
                  </>
                )}
              </>
            )
          ) : (
            <>
              {userData?.clubId ? (
                equipoActivo ? (
                  renderTeamLayout()
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
                      renderEquiposLista({
                        titulo: <>Equipos del Club: <span style={{ color: text }}>{userData.clubNombre}</span></>,
                        mostrarClub: false,
                        permitirCrear: true,
                      })
                    )}
                  </>
                ) : (
                  <>
                    {renderEquiposLista({
                      titulo: <>Equipos del Club: <span style={{ color: text }}>{userData.clubNombre}</span></>,
                      mostrarClub: false,
                      permitirCrear: true,
                    })}
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