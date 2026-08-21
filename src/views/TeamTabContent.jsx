import { HomeTab } from "../components/HomeTab.jsx";
import { CalendarioTab } from "../components/CalendarioTab.jsx";
import { EstadisticasTab } from "../components/EstadisticasTab.jsx";
import { PlantillaTab } from "../components/PlantillaTab.jsx";
import {
  getEquipoLabels,
  getProximosEventosInicio,
  filtrarSesionesPorPeriodo,
  getRangoFechasEstadisticas,
  calcularEstadisticasJugadoras,
  normalizarTipoSesion,
} from "../lib/appUtils.js";
import { combinarJugadorasSesion } from "../lib/jugadorasClub.js";

export function TeamTabContent({
  equipoActivo,
  tab,
  setTab,
  sesionesEquipo,
  sesionesLoading,
  mesActual,
  setMesActual,
  anioActual,
  setAnioActual,
  fechaSesionSeleccionada,
  setFechaSesionSeleccionada,
  programarDesdeInicio,
  resetSesionPanel,
  sesionDoc,
  tipoSesion,
  sesionCargando,
  guardandoSesion,
  handleCrearSesion,
  sesionVista,
  setSesionVista,
  rivalPartido,
  setRivalPartido,
  localPartido,
  setLocalPartido,
  tematica,
  setTematica,
  ejercicios,
  setEjercicios,
  jugadoras,
  jugadorasLoading,
  asistencias,
  valoraciones,
  setAsistencias,
  setValoraciones,
  handleGuardarSesion,
  handleEliminarSesion,
  handleAddJugadoraExterna,
  handleRemoveJugadoraExterna,
  jugadorasExternasIds = [],
  jugadorasClub = [],
  equiposClub = [],
  jugadorasClubLoading = false,
  sesionGuardadaNotice,
  statsPeriodo,
  setStatsPeriodo,
  statsDesde,
  setStatsDesde,
  statsHasta,
  setStatsHasta,
  statsVista,
  setStatsVista,
  handleAddJugadora,
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
  handleIniciarEditJugadora,
  handleCancelarEditJugadora,
  handleGuardarJugadora,
  handleEliminarJugadora,
  theme,
}) {
  if (!equipoActivo) return null;

  const {
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
  } = theme;

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

    return (
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
        onScheduleEntreno={() => programarDesdeInicio("entreno")}
        onSchedulePartido={() => programarDesdeInicio("partido")}
        guardandoSesion={guardandoSesion}
      />
    );
  }

  if (tab === "sesiones") {
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

    const jugadorasSesion = combinarJugadorasSesion(
      jugadoras,
      jugadorasClub,
      jugadorasExternasIds,
      equiposClub
    );

    return (
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
          onVolver: resetSesionPanel,
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
          text,
          textMuted,
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
            onDelete: sesionDoc ? handleEliminarSesion : undefined,
            guardadoNotice: sesionGuardadaNotice,
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
            inputBg,
            equipoLabels,
            jugadorasClub,
            equiposClub,
            jugadorasClubLoading,
            equipoActivoId: equipoActivo.id,
            onAddJugadoraExterna: handleAddJugadoraExterna,
            onRemoveJugadoraExterna: handleRemoveJugadoraExterna,
          },
        }}
      />
    );
  }

  if (tab === "players") {
    const sesionesFiltradas = filtrarSesionesPorPeriodo(sesionesEquipo, statsPeriodo, statsDesde, statsHasta);
    const rango = getRangoFechasEstadisticas(statsPeriodo, statsDesde, statsHasta);
    const estadisticas = calcularEstadisticasJugadoras(jugadoras, sesionesFiltradas);
    const totalEntrenos = sesionesFiltradas.filter((s) => normalizarTipoSesion(s) === "entreno").length;
    const totalPartidos = sesionesFiltradas.filter((s) => normalizarTipoSesion(s) === "partido").length;
    return (
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
  }

  if (tab === "plantilla") {
    return (
      <PlantillaTab
        equipoLabels={equipoLabels}
        text={text}
        textMuted={textMuted}
        accent={accent}
        plantillaFormProps={{
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

  return null;
}
