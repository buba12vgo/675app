export function resetCamposSesion(setters) {
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
