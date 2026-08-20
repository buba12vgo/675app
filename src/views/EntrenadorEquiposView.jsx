import { EquiposListaContainer } from "../components/EquiposListaContainer.jsx";

export function EntrenadorEquiposView({ equiposListaProps, clubNombre, text }) {
  return (
    <EquiposListaContainer
      {...equiposListaProps}
      titulo={
        <>
          Equipos del Club: <span style={{ color: text }}>{clubNombre}</span>
        </>
      }
      mostrarClub={false}
      permitirCrear={false}
    />
  );
}
