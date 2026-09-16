export function resetCamposSesion(setters) {
  const {
    setTematica, setEjercicios, setAsistencias, setValoraciones,
    setTipoSesion, setRivalPartido, setLocalPartido, setSesionVista,
    setJugadorasExternasIds, setMotivosAusencia, setPlanificacionSextos,
    setPuntosFavorPartido, setPuntosContraPartido,
  } = setters;
  setTematica("");
  setEjercicios("");
  setAsistencias({});
  setValoraciones({});
  setTipoSesion("entreno");
  setRivalPartido("");
  setLocalPartido("casa");
  setSesionVista("datos");
  setJugadorasExternasIds?.([]);
  setMotivosAusencia?.({});
  setPlanificacionSextos?.({});
  setPuntosFavorPartido?.("");
  setPuntosContraPartido?.("");
}
