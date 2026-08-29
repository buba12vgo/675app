import { useState, useEffect, useRef } from "react";
import {
  THEMES,
  applyThemeToDocument,
  getStoredTheme,
  persistTheme,
  getGlassCardStyle,
} from "./theme.js";
import {
  formatDateYYYYMMDD,
  isCoordinador,
  formatTipoCanasta,
  formatGeneroEquipo,
  getDevicePreviewFromWidth,
} from "./lib/appUtils.js";

import { useCompactHeader } from "./hooks/useCompactHeader.js";
import { useAuth } from "./hooks/useAuth.js";
import { useClubes } from "./hooks/useClubes.js";
import { useEquipos } from "./hooks/useEquipos.js";
import { usePlantilla } from "./hooks/usePlantilla.js";
import { useSesiones } from "./hooks/useSesiones.js";
import { useJugadorasClub } from "./hooks/useJugadorasClub.js";
import { useUsuariosAdmin } from "./hooks/useUsuariosAdmin.js";
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
import { SuperadminShell } from "./views/SuperadminShell.jsx";
import { TeamTabContent } from "./views/TeamTabContent.jsx";
import { LoginScreen } from "./components/LoginScreen.jsx";
import { db } from "./firebase";
import { doc, getDoc } from "firebase/firestore";
import {
  TEAM_TABS,
  getSessionContext,
  persistSessionContext,
  clearSessionContext,
} from "./lib/sessionContext.js";

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
    handleToggleEquipoFavorito,
    savingFavoritos,
  } = useAuth(setErrorMsg);

  const [superadminVista, setSuperadminVista] = useState("clubes");
  const [equiposFiltroSuperadmin, setEquiposFiltroSuperadmin] = useState("todos");

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
    getEquipoLogo,
  } = useEquipos({ userData, superadminVista, equiposFiltroSuperadmin, setErrorMsg });

  const {
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
  } = useClubes({
    user,
    userData,
    setUserData,
    setErrorMsg,
    showOpcionesPanel,
    equipoActivo,
    setEquipoActivo,
    equiposFiltroSuperadmin,
    setEquiposFiltroSuperadmin,
  });

  const {
    usuarios,
    usuariosLoading,
    solicitudesClub,
    solicitudesLoading,
    usuariosFiltroClub,
    setUsuariosFiltroClub,
    usuariosNotice,
    savingUsuarioId,
    clubUsuarios,
    clubUsuariosLoading,
    handleGuardarUsuarioClub,
    handleQuitarClubUsuario,
    handleGuardarEquiposFavoritos,
  } = useUsuariosAdmin({
    userData,
    clubes,
    getClubNombre,
    setErrorMsg,
  });

  const [coordinadorVista, setCoordinadorVista] = useState("equipos");
  const [tab, setTab] = useState("home");
  const sessionRestoredRef = useRef(false);
  const tabIdentityRef = useRef(null);
  const [devicePreview, setDevicePreview] = useState(() =>
    getDevicePreviewFromWidth(typeof window !== "undefined" ? window.innerWidth : 1200)
  );
  const showDevicePreview = import.meta.env.DEV;
  const [colorMode, setColorMode] = useState(() => getStoredTheme());
  const [statsPeriodo, setStatsPeriodo] = useState("mensual");
  const [statsVista, setStatsVista] = useState("todo");
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
    motivosAusencia,
    setMotivosAusencia,
    guardandoSesion,
    tipoSesion,
    setTipoSesion: _setTipoSesion,
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
    handleEliminarSesion,
    handleAddJugadoraExterna,
    handleRemoveJugadoraExterna,
    jugadorasExternasIds,
    sesionGuardadaNotice,
    programarDesdeInicio,
    resetSesionPanel,
  } = useSesiones({ equipoActivo, userData, setErrorMsg, jugadoras, tab, setTab });

  const clubIdSesion = equipoActivo?.clubId || userData?.clubId || null;
  const { jugadorasClub, equiposClub, jugadorasClubLoading } = useJugadorasClub({
    clubId: clubIdSesion,
    enabled: Boolean(equipoActivo && clubIdSesion && tab === "sesiones"),
    setErrorMsg,
  });

  const compactHeader = useCompactHeader();

  useEffect(() => {
    applyThemeToDocument(colorMode);
    persistTheme(colorMode);
  }, [colorMode]);

  useEffect(() => {
    if (showDevicePreview) return undefined;
    const syncPreview = () => setDevicePreview(getDevicePreviewFromWidth(window.innerWidth));
    window.addEventListener("resize", syncPreview);
    return () => window.removeEventListener("resize", syncPreview);
  }, [showDevicePreview]);

  useEffect(() => {
    if (!userData?.rol) {
      tabIdentityRef.current = null;
      return;
    }
    const next = `${userData.rol}:${userData.clubId || ""}`;
    if (tabIdentityRef.current === null) {
      tabIdentityRef.current = next;
      return;
    }
    if (tabIdentityRef.current !== next) {
      tabIdentityRef.current = next;
      setTab("home");
      setShowOpcionesPanel(false);
    }
  }, [userData?.clubId, userData?.rol, setShowOpcionesPanel]);

  useEffect(() => {
    if (!user?.uid) {
      sessionRestoredRef.current = false;
      return undefined;
    }
    if (sessionRestoredRef.current || !userData || equiposLoading) return undefined;

    let cancelled = false;
    (async () => {
      const stored = getSessionContext();
      if (!stored || stored.userId !== user.uid) {
        if (stored && stored.userId !== user.uid) clearSessionContext();
        sessionRestoredRef.current = true;
        return;
      }
      const tabToRestore = TEAM_TABS.includes(stored.tab) ? stored.tab : "home";
      if (stored.tab && TEAM_TABS.includes(stored.tab)) {
        setTab(stored.tab);
      }
      let restoredEquipoId = null;
      if (stored.equipoId) {
        let found = equipos.find((equipo) => equipo.id === stored.equipoId) || null;
        if (!found) {
          try {
            const snap = await getDoc(doc(db, "Equipos", stored.equipoId));
            found = snap.exists() ? { id: snap.id, ...snap.data() } : null;
          } catch {
            found = null;
          }
        }
        if (cancelled) return;
        const permitido =
          found &&
          (userData.rol === "superadmin" ||
            (userData.clubId && found.clubId === userData.clubId));
        if (permitido) {
          setEquipoActivo(found);
          restoredEquipoId = found.id;
        }
      }
      if (cancelled) return;
      sessionRestoredRef.current = true;
      persistSessionContext({
        userId: user.uid,
        equipoId: restoredEquipoId,
        tab: tabToRestore,
      });
    })();

    return () => {
      cancelled = true;
    };
  }, [user?.uid, userData, equipos, equiposLoading, setEquipoActivo]);

  useEffect(() => {
    if (!user?.uid || !sessionRestoredRef.current) return;
    persistSessionContext({
      userId: user.uid,
      equipoId: equipoActivo?.id || null,
      tab,
    });
  }, [user?.uid, equipoActivo?.id, tab]);

  const toggleColorMode = () => {
    setColorMode((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const theme = THEMES[colorMode];
  const glassCardStyle = getGlassCardStyle(colorMode);
  const isDarkMode = colorMode === "dark";
  const {
    accent,
    accentSoft,
    accentLight,
    accentShadow,
    accentBorder,
    tableHeader,
    tableHeaderAccent,
    cardBgElevated,
    surface,
    cardShadow,
    inputBg,
    inputBorder,
    text,
    textSecondary,
    textMuted,
    success,
    error,
    colorPartido,
    colorPartidoLight,
    colorPartidoSoft,
    colorPartidoBorder,
    onAccent,
  } = theme;

  const tabsMenu = [
    { key: "home", label: "Inicio", Icon: IconHome },
    { key: "sesiones", label: "Calendario", Icon: IconCalendar },
    { key: "players", label: "Estadísticas", Icon: IconChart },
    { key: "plantilla", label: "Plantilla", Icon: IconUsers },
  ];

  const handleGoHome = () => {
    setShowOpcionesPanel(false);
    if (equipoActivo) setTab("home");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleLogout = async () => {
    clearSessionContext();
    sessionRestoredRef.current = false;
    tabIdentityRef.current = null;
    await logout();
    setEquipoActivo(null);
    setTab("home");
  };

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

  const tabContent = (
    <TeamTabContent
      equipoActivo={equipoActivo}
      tab={tab}
      setTab={setTab}
      sesionesEquipo={sesionesEquipo}
      sesionesLoading={sesionesLoading}
      mesActual={mesActual}
      setMesActual={setMesActual}
      anioActual={anioActual}
      setAnioActual={setAnioActual}
      fechaSesionSeleccionada={fechaSesionSeleccionada}
      setFechaSesionSeleccionada={setFechaSesionSeleccionada}
      programarDesdeInicio={programarDesdeInicio}
      resetSesionPanel={resetSesionPanel}
      sesionDoc={sesionDoc}
      tipoSesion={tipoSesion}
      sesionCargando={sesionCargando}
      guardandoSesion={guardandoSesion}
      handleCrearSesion={handleCrearSesion}
      sesionVista={sesionVista}
      setSesionVista={setSesionVista}
      rivalPartido={rivalPartido}
      setRivalPartido={setRivalPartido}
      localPartido={localPartido}
      setLocalPartido={setLocalPartido}
      tematica={tematica}
      setTematica={setTematica}
      ejercicios={ejercicios}
      setEjercicios={setEjercicios}
      jugadoras={jugadoras}
      jugadorasLoading={jugadorasLoading}
      asistencias={asistencias}
      valoraciones={valoraciones}
      setAsistencias={setAsistencias}
      setValoraciones={setValoraciones}
      motivosAusencia={motivosAusencia}
      setMotivosAusencia={setMotivosAusencia}
      handleGuardarSesion={handleGuardarSesion}
      handleEliminarSesion={handleEliminarSesion}
      handleAddJugadoraExterna={handleAddJugadoraExterna}
      handleRemoveJugadoraExterna={handleRemoveJugadoraExterna}
      jugadorasExternasIds={jugadorasExternasIds}
      jugadorasClub={jugadorasClub}
      equiposClub={equiposClub}
      jugadorasClubLoading={jugadorasClubLoading}
      sesionGuardadaNotice={sesionGuardadaNotice}
      statsPeriodo={statsPeriodo}
      setStatsPeriodo={setStatsPeriodo}
      statsDesde={statsDesde}
      setStatsDesde={setStatsDesde}
      statsHasta={statsHasta}
      setStatsHasta={setStatsHasta}
      statsVista={statsVista}
      setStatsVista={setStatsVista}
      handleAddJugadora={handleAddJugadora}
      jugadoraNombre={jugadoraNombre}
      setJugadoraNombre={setJugadoraNombre}
      jugadoraDorsal={jugadoraDorsal}
      setJugadoraDorsal={setJugadoraDorsal}
      jugadoraApodo={jugadoraApodo}
      setJugadoraApodo={setJugadoraApodo}
      addJugadoraLoading={addJugadoraLoading}
      jugadoraEditandoId={jugadoraEditandoId}
      editJugadoraNombre={editJugadoraNombre}
      setEditJugadoraNombre={setEditJugadoraNombre}
      editJugadoraDorsal={editJugadoraDorsal}
      setEditJugadoraDorsal={setEditJugadoraDorsal}
      editJugadoraApodo={editJugadoraApodo}
      setEditJugadoraApodo={setEditJugadoraApodo}
      editJugadoraLoading={editJugadoraLoading}
      handleIniciarEditJugadora={handleIniciarEditJugadora}
      handleCancelarEditJugadora={handleCancelarEditJugadora}
      handleGuardarJugadora={handleGuardarJugadora}
      handleEliminarJugadora={handleEliminarJugadora}
      theme={{
        accent,
        accentLight,
        accentSoft,
        accentBorder,
        accentShadow,
        colorPartido,
        colorPartidoLight,
        colorPartidoSoft,
        colorPartidoBorder,
        text,
        textMuted,
        textSecondary,
        success,
        error,
        surface,
        inputBorder,
        inputBg,
        cardBgElevated,
        tableHeader,
        tableHeaderAccent,
      }}
    />
  );

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
    getClubLogo,
    getEquipoLogo,
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
    clubEditandoId,
    editClubNombre,
    onEditClubNombreChange: setEditClubNombre,
    savingClubId,
    deletingClubId,
    onStartEditClub: handleIniciarEditClub,
    onCancelEditClub: handleCancelarEditClub,
    onSaveClub: handleGuardarClub,
    onDeleteClub: handleEliminarClub,
    getClubLogo,
  };

  const teamLayoutProps = equipoActivo
    ? {
        clubNombre: getNombreClubActivo(),
        clubLogoUrl: getClubLogo(equipoActivo.clubId || userData?.clubId),
        equipoLogoUrl: getEquipoLogo(equipoActivo),
        equipoNombre: equipoActivo.nombre,
        equipoMeta: `${formatTipoCanasta(equipoActivo.tipoCanasta)} · ${formatGeneroEquipo(equipoActivo.genero)}`,
        onCambiarEquipo: () => {
          setEquipoActivo(null);
          setTab("home");
        },
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

  const coordinacionProps = {
    clubNombre: userData?.clubNombre,
    clubLogoUrl: getClubLogo(userData?.clubId) || activeClub?.logoUrl,
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
    getEquipoLogo,
    onGuardarFavoritos: handleGuardarEquiposFavoritos,
    savingUsuarioId,
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
            showDevicePreview={showDevicePreview}
            colorMode={colorMode}
            onToggleColorMode={toggleColorMode}
            onOpenOpciones={handleOpenOpciones}
            onLogout={handleLogout}
            onGoHome={handleGoHome}
          />
          <main className="app-main">
            <div
              className={`app-card${showTeamNav ? " app-card--with-nav" : ""}`}
              style={{
                ...glassCardStyle,
                boxShadow: cardShadow,
                border: `1px solid ${inputBorder}`,
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-start",
                alignItems: showTeamNav ? "stretch" : "center",
                width: "100%",
              }}
            >
              {showOpcionesPanel ? (
                <UserOptionsOverlay
                  onBack={() => setShowOpcionesPanel(false)}
                  textMuted={textMuted}
                  inputBorder={inputBorder}
                  cardBgElevated={cardBgElevated}
                  userOptionsProps={{
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
                  }}
                />
              ) : esSuperadmin ? (
                <SuperadminShell
                  equipoActivo={equipoActivo}
                  teamLayoutProps={teamLayoutProps}
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
                  equiposPanelProps={{
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
                  }}
                  superadminUsuariosProps={{
                    usuarios,
                    usuariosLoading,
                    clubes,
                    filtroClub: usuariosFiltroClub,
                    onFiltroClubChange: setUsuariosFiltroClub,
                    onGuardarUsuario: handleGuardarUsuarioClub,
                    onQuitarClub: handleQuitarClubUsuario,
                    onGuardarFavoritos: handleGuardarEquiposFavoritos,
                    equipos,
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
                  }}
                />
              ) : (
                <ClubMemberContent
                  hasClub={!!userData?.clubId}
                  equipoActivo={!!equipoActivo}
                  esCoordinador={esCoordinador}
                  teamLayoutProps={teamLayoutProps}
                  coordinadorDashboardProps={{
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
                  }}
                  entrenadorEquiposProps={{
                    equiposListaProps: {
                      ...equiposListaProps,
                      onToggleFavorite: handleToggleEquipoFavorito,
                      savingFavoritos,
                    },
                    clubNombre: userData?.clubNombre,
                    text,
                    textMuted,
                    accent,
                    equiposFavoritos: userData?.equiposFavoritos,
                  }}
                  solicitarClubProps={{
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
                  }}
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
