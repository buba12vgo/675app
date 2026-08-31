import { useEffect, useState } from "react";
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
  canEditSesion,
  canManagePlantilla,
  TIPO_SESION_ENTRENO,
  TIPO_SESION_PARTIDO,
  TIPO_SESION_FISICO,
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
  sesionesDiaActual = [],
  seleccionarSesion,
  cerrarSesionFormulario,
  abrirSesionEnCalendario,
  userRol,
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
  motivosAusencia = {},
  setMotivosAusencia,
  handleGuardarSesion,
  handleEliminarSesion,
  handleAddJugadoraExterna,
  handleRemoveJugadoraExterna,
  handleToggleSexto,
  jugadorasExternasIds = [],
  planificacionSextos = {},
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
  const [fichaId, setFichaId] = useState(null);

  useEffect(() => {
    setFichaId(null);
  }, [equipoActivo?.id]);

  useEffect(() => {
    if (tab !== "players") setFichaId(null);
  }, [tab]);

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
    colorFisico,
    colorFisicoLight,
    colorFisicoSoft,
    colorFisicoBorder,
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
  const puedeEditarPlantilla = canManagePlantilla(userRol);
  const sesionEditable = sesionDoc ? canEditSesion(userRol, sesionDoc) : false;

  if (tab === "home") {
    const { proximoEntreno, proximoPartido, proximoFisico, hoyStr, mananaStr } =
      getProximosEventosInicio(sesionesEquipo);

    return (
      <HomeTab
        equipoActivo={equipoActivo}
        sesionesLoading={sesionesLoading}
        proximoEntreno={proximoEntreno}
        proximoPartido={proximoPartido}
        proximoFisico={proximoFisico}
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
        colorFisico={colorFisico}
        colorFisicoLight={colorFisicoLight}
        colorFisicoSoft={colorFisicoSoft}
        colorFisicoBorder={colorFisicoBorder}
        text={text}
        textMuted={textMuted}
        textSecondary={textSecondary}
        success={success}
        onOpenCalendar={(fecha, tipo) => {
          if (abrirSesionEnCalendario) {
            abrirSesionEnCalendario(fecha, tipo);
            return;
          }
          if (!fecha) return;
          const [y, m] = fecha.split("-").map(Number);
          setAnioActual(y);
          setMesActual(m - 1);
          setFechaSesionSeleccionada(fecha);
          setTab("sesiones");
        }}
        onScheduleEntreno={() => programarDesdeInicio(TIPO_SESION_ENTRENO)}
        onSchedulePartido={() => programarDesdeInicio(TIPO_SESION_PARTIDO)}
        onScheduleFisico={() => programarDesdeInicio(TIPO_SESION_FISICO)}
        canScheduleEntreno={canEditSesion(userRol, { tipo: TIPO_SESION_ENTRENO })}
        canSchedulePartido={canEditSesion(userRol, { tipo: TIPO_SESION_PARTIDO })}
        canScheduleFisico={canEditSesion(userRol, { tipo: TIPO_SESION_FISICO })}
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
        colorFisico={colorFisico}
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
          sesionesDelDia: sesionesDiaActual,
          onSelectSesion: seleccionarSesion,
          onCerrarSesion: cerrarSesionFormulario,
          onCrearEntreno: () => handleCrearSesion(TIPO_SESION_ENTRENO),
          onCrearPartido: () => handleCrearSesion(TIPO_SESION_PARTIDO),
          onCrearFisico: () => handleCrearSesion(TIPO_SESION_FISICO),
          userRol,
          readOnly: Boolean(sesionDoc) && !sesionEditable,
          accent,
          accentSoft,
          accentLight,
          colorPartido,
          colorFisico,
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
            motivosAusencia,
            setMotivosAusencia,
            planificacionSextos,
            onToggleSexto: handleToggleSexto,
            onSubmit: handleGuardarSesion,
            onDelete: sesionDoc && sesionEditable ? handleEliminarSesion : undefined,
            guardadoNotice: sesionGuardadaNotice,
            guardandoSesion,
            onGoToPlantilla: () => setTab("plantilla"),
            accent,
            colorPartido,
            colorFisico,
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
            tipoCanasta: equipoActivo.tipoCanasta,
            nombreEquipo: equipoActivo.nombre,
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
    const totalEntrenos = sesionesFiltradas.filter((s) => normalizarTipoSesion(s) === TIPO_SESION_ENTRENO).length;
    const totalPartidos = sesionesFiltradas.filter((s) => normalizarTipoSesion(s) === TIPO_SESION_PARTIDO).length;
    const totalFisicos = sesionesFiltradas.filter((s) => normalizarTipoSesion(s) === TIPO_SESION_FISICO).length;
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
        colorFisico={colorFisico}
        colorFisicoLight={colorFisicoLight}
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
        totalFisicos={totalFisicos}
        jugadorasLoading={jugadorasLoading}
        sesionesLoading={sesionesLoading}
        jugadoras={jugadoras}
        sesionesFiltradas={sesionesFiltradas}
        statsVista={statsVista}
        onStatsVistaChange={setStatsVista}
        estadisticas={estadisticas}
        equipoLabels={equipoLabels}
        onGoToPlantilla={() => setTab("plantilla")}
        fichaId={fichaId}
        onFichaIdChange={setFichaId}
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
        readOnly={!puedeEditarPlantilla}
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
        onOpenFicha={(jugadoraId) => {
          setStatsPeriodo("todo");
          setFichaId(jugadoraId);
          setTab("players");
        }}
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
          readOnly: !puedeEditarPlantilla,
        }}
      />
    );
  }

  return null;
}
