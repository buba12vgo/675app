export class SesionAlreadyExistsError extends Error {
  constructor() {
    super("session-exists");
    this.name = "SesionAlreadyExistsError";
    this.code = "already-exists";
  }
}

export function isSesionAlreadyExistsError(error) {
  return error?.code === "already-exists" || error?.message === "session-exists";
}

export function mensajeErrorCrearSesion(error, tipo) {
  if (isSesionAlreadyExistsError(error)) {
    if (tipo === "fisico") return "Ya hay un entrenamiento físico este día.";
    if (tipo === "partido") return "No se pudo crear el partido. Inténtalo de nuevo.";
    return "Ya hay un entreno este día.";
  }
  if (error?.code === "permission-denied") {
    return "No se pudo crear la sesión. Puede que ya exista.";
  }
  return "Error creando la sesión.";
}

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
