import { useState, useEffect } from "react";
import { db } from "./firebase";
import {
  doc,
  collection,
  onSnapshot,
  updateDoc,
  writeBatch,
  query,
  where,
} from "firebase/firestore";
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
  formatDateYYYYMMDD,
  normalizarTipoSesion,
  getProximosEventosInicio,
  getRangoFechasEstadisticas,
  filtrarSesionesPorPeriodo,
  calcularEstadisticasJugadoras,
  isCoordinador,
  getEquipoLabels,
  formatTipoCanasta,
  formatGeneroEquipo,
} from "./lib/appUtils.js";

import { useCompactHeader } from "./hooks/useCompactHeader.js";
import { useAuth } from "./hooks/useAuth.js";
import { resolveClubLogoUrl } from "./lib/clubLogoPresets.js";
import { useClubes } from "./hooks/useClubes.js";
import { useEquipos } from "./hooks/useEquipos.js";
import { usePlantilla } from "./hooks/usePlantilla.js";
import { useSesiones } from "./hooks/useSesiones.js";
import {
  IconHome,
  IconCalendar,
  IconChart,
  IconUsers,
} from "./components/icons.jsx";
import { AppHeader } from "./components/AppHeader.jsx";
import { BlurredBackground } from "./components/BlurredBackground.jsx";
import { AppErrorBanner } from "./components/AppErrorBanner.jsx";
import { UserOptionsOverlay } from "./views/UserOptionsOverlay.jsx";
import { ClubMemberContent } from "./views/ClubMemberContent.jsx";
import { LoginScreen } from "./components/LoginScreen.jsx";
import { HomeTab } from "./components/HomeTab.jsx";
import { CalendarioTab } from "./components/CalendarioTab.jsx";
import { EstadisticasTab } from "./components/EstadisticasTab.jsx";
import { PlantillaTab } from "./components/PlantillaTab.jsx";
import { SuperadminPanel } from "./components/SuperadminPanel.jsx";
import { TeamLayout } from "./layouts/TeamLayout.jsx";


const THEME = THEMES.dark;


function App() {
  const [errorMsg, setErrorMsg] = useState("");

  const {
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
  } = useAuth(setErrorMsg);

  const [superadminVista, setSuperadminVista] = useState("clubes"); // "clubes" | "equipos" | "usuarios"
  const [equiposFiltroSuperadmin, setEquiposFiltroSuperadmin] = useState("todos"); // "todos" | "propio"

  const {
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
    equipoEditProps,
    handleCrearEquipo,
    handleIniciarEditEquipo,
    handleCancelarEditEquipo,
    handleGuardarEquipo,
    handleEntrarEquipo,
    handleUploadEquipoLogo,
    handleRemoveEquipoLogo,
    savingEquipoLogoId,
  } = useEquipos({ userData, superadminVista, equiposFiltroSuperadmin, setErrorMsg });

  const {
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
  } = useClubes({
    user,
    userData,
    setUserData,
    setErrorMsg,
    showOpcionesPanel,
    equipoActivo,
    equiposFiltroSuperadmin,
    setEquiposFiltroSuperadmin,
  });

  const [usuarios, setUsuarios] = useState([]);
  const [usuariosLoading, setUsuariosLoading] = useState(false);
  const [usuariosFiltroClub, setUsuariosFiltroClub] = useState("todos");
  const [usuariosNotice, setUsuariosNotice] = useState(null);
  const [savingUsuarioId, setSavingUsuarioId] = useState(null);
  const [clubUsuarios, setClubUsuarios] = useState([]);
  const [clubUsuariosLoading, setClubUsuariosLoading] = useState(false);
  const [coordinadorVista, setCoordinadorVista] = useState("equipos"); // "equipos" | "coordinacion"
  const [tab, setTab] = useState("home");
  const [devicePreview, setDevicePreview] = useState("mobile");
  const [colorMode, setColorMode] = useState(() => getStoredTheme());
  const [statsPeriodo, setStatsPeriodo] = useState("mensual");
  const [statsVista, setStatsVista] = useState("todo"); // "entrenos" | "partidos" | "todo"
  const [statsDesde, setStatsDesde] = useState(() => {
    const d = new Date();
    return formatDateYYYYMMDD(new Date(d.getFullYear(), d.getMonth(), 1));
  });
  const [statsHasta, setStatsHasta] = useState(() => formatDateYYYYMMDD(new Date()));

  const {
    jugadoras,
    jugadorasLoading,
    jugadoraNombre,
    setJugadoraNombre,
    jugadoraDorsal,
    setJugadoraDorsal,
    jugadoraApodo,
    setJugadoraApodo,
    addJugadoraLoading,
    jugadoraEditandoId,
    editJugadoraNombre,
    setEditJugadoraNombre,
    editJugadoraDorsal,
    setEditJugadoraDorsal,
    editJugadoraApodo,
    setEditJugadoraApodo,
    editJugadoraLoading,
    handleAddJugadora,
    handleEliminarJugadora,
    handleIniciarEditJugadora,
    handleCancelarEditJugadora,
    handleGuardarJugadora,
  } = usePlantilla({ equipoActivo, userData, setErrorMsg });

  const {
    sesionCargando,
    sesionDoc,
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
  } = useSesiones({ equipoActivo, userData, setErrorMsg, jugadoras, tab, setTab });

  const compactHeader = useCompactHeader();

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

  const theme = THEMES[colorMode];
  const glassCardStyle = getGlassCardStyle(colorMode);
  const isDarkMode = colorMode === "dark";

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
  const jugadorasSesion = jugadoras;

  const tabsMenu = [
    { key: "home", label: "Inicio", Icon: IconHome },
    { key: "sesiones", label: "Calendario", Icon: IconCalendar },
    { key: "players", label: "Estadísticas", Icon: IconChart },
    { key: "plantilla", label: "Plantilla", Icon: IconUsers },
  ];

  // Reseteos al cambiar de contexto
  useEffect(() => {
    setTab("home");
    setShowOpcionesPanel(false);
  }, [userData?.clubId, userData?.rol, setShowOpcionesPanel]);

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

  const handleGoHome = () => {
    setShowOpcionesPanel(false);
    if (equipoActivo) {
      setTab("home");
    }
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
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

  const coordinacionProps = {
    clubNombre: userData?.clubNombre,
    clubLogoUrl: resolveClubLogoUrl({
      logoUrl: activeClub?.logoUrl,
      nombre: userData?.clubNombre,
    }),
    onUploadClubLogo: (file) => handleUploadClubLogo(userData?.clubId, file),
    onRemoveClubLogo: () => handleRemoveClubLogo(userData?.clubId),
    savingClubLogo: savingClubLogoId === userData?.clubId,
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
    onUploadEquipoLogo: handleUploadEquipoLogo,
    onRemoveEquipoLogo: handleRemoveEquipoLogo,
    savingEquipoLogoId,
    accent,
    accentLight,
    accentSoft,
    text,
    textSecondary,
    textMuted,
    inputBorder,
    inputBg,
    cardBgElevated,
    onAccent,
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

  const handleLogout = async () => {
    await logout();
    setEquipoActivo(null);
    setTab("home");
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
        resetSesionPanel();
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

  const getClubLogoActivo = () => {
    const clubId = equipoActivo?.clubId || userData?.clubId;
    if (clubId) {
      const fromHook = getClubLogo(clubId);
      if (fromHook) return fromHook;
    }
    return resolveClubLogoUrl({
      logoUrl: activeClub?.logoUrl,
      nombre: getNombreClubActivo(),
    });
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
    accentSoft,
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
    onUploadClubLogo: handleUploadClubLogo,
    onRemoveClubLogo: handleRemoveClubLogo,
    savingClubLogoId,
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

  const teamLayoutProps = equipoActivo
    ? {
        clubNombre: getNombreClubActivo(),
        clubLogoUrl: getClubLogoActivo(),
        equipoLogoUrl: equipoActivo.logoUrl || null,
        equipoNombre: equipoActivo.nombre,
        equipoMeta: `${formatTipoCanasta(equipoActivo.tipoCanasta)} · ${formatGeneroEquipo(equipoActivo.genero)}`,
        onCambiarEquipo: () => setEquipoActivo(null),
        accentLight,
        accentSoft,
        accentBorder,
        text,
        textSecondary,
        textMuted,
        tabsMenu,
        tab,
        setTab,
        accent,
        inputBorder,
        tabContent,
      }
    : null;

  const solicitarClubProps = {
    accent,
    accentLight,
    accentSoft,
    accentBorder,
    text,
    solicitudClubId: userData?.solicitudClubId,
    solicitudClubNombre: userData?.solicitudClubNombre,
    selectClubLoading,
    clubes,
    onSolicitarClub: handleSolicitarClub,
  };

  const coordinadorDashboardProps = {
    coordinadorVista,
    onCoordinadorVistaChange: setCoordinadorVista,
    accentSoft,
    accentLight,
    textMuted,
    inputBorder,
    cardBgElevated,
    text,
    clubNombre: userData?.clubNombre,
    coordinacionProps,
    equiposListaProps,
  };

  const entrenadorEquiposProps = {
    equiposListaProps,
    clubNombre: userData?.clubNombre,
    text,
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
            <UserOptionsOverlay
              onBack={() => setShowOpcionesPanel(false)}
              textMuted={textMuted}
              inputBorder={inputBorder}
              cardBgElevated={cardBgElevated}
              userOptionsProps={userOptionsProps}
            />
          ) : esSuperadmin ? (
            equipoActivo ? (
              <TeamLayout {...teamLayoutProps} />
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
            <ClubMemberContent
              hasClub={!!userData?.clubId}
              equipoActivo={!!equipoActivo}
              esCoordinador={esCoordinador}
              teamLayoutProps={teamLayoutProps}
              coordinadorDashboardProps={coordinadorDashboardProps}
              entrenadorEquiposProps={entrenadorEquiposProps}
              solicitarClubProps={solicitarClubProps}
            />
          )}
          <AppErrorBanner error={error} message={errorMsg} />
        </div>
      </main>
        </div>
      </div>
    </div>
  );
}

export default App;