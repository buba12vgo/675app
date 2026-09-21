import { IconChevronLeft } from "../components/icons.jsx";

const SECTIONS = [
  { id: "entrar", label: "Entrar" },
  { id: "aspecto", label: "Aspecto" },
  { id: "roles", label: "Roles" },
  { id: "equipos", label: "Equipos" },
  { id: "inicio", label: "Inicio" },
  { id: "dashboard", label: "Dashboard" },
  { id: "calendario", label: "Calendario" },
  { id: "entreno", label: "Entreno" },
  { id: "partido", label: "Partido" },
  { id: "plantilla", label: "Plantilla" },
  { id: "estadisticas", label: "Estadísticas" },
  { id: "opciones", label: "Opciones" },
  { id: "movil", label: "Móvil" },
  { id: "coordinacion", label: "Club" },
];

function Figure({ src, alt, caption }) {
  return (
    <figure className="tutorial__figure">
      <img className="tutorial__img" src={src} alt={alt} loading="lazy" />
      {caption ? <figcaption className="tutorial__caption">{caption}</figcaption> : null}
    </figure>
  );
}

export function TutorialView({ onBack, textMuted, inputBorder, cardBgElevated }) {
  return (
    <article className="tutorial">
      {onBack ? (
        <button
          type="button"
          onClick={onBack}
          className="user-options-back"
          style={{ color: textMuted, borderColor: inputBorder, background: cardBgElevated }}
        >
          <IconChevronLeft size={16} color={textMuted} />
          <span>Volver</span>
        </button>
      ) : null}

      <header className="tutorial__header">
        <p className="tutorial__kicker">Guía de 675app</p>
        <h1 className="tutorial__title">Cómo funciona la app</h1>
        <p className="tutorial__lead">
          675app organiza el día a día del club: dashboard, equipos, plantilla, entrenos, partidos y trabajo físico.
          Esta guía sigue el orden en el que se usa, con el aspecto actual de la web.
        </p>
      </header>

      <nav className="tutorial__toc" aria-label="Índice">
        {SECTIONS.map((s) => (
          <a key={s.id} href={`#tutorial-${s.id}`}>
            {s.label}
          </a>
        ))}
      </nav>

      <section className="tutorial__section" id="tutorial-entrar">
        <h2>1. Entrar</h2>
        <p>
          Abre <strong>675basket.com</strong>. El logo 675 está arriba a la izquierda y en la tarjeta de acceso.
          Entra con correo y contraseña o con Google. Esta guía está en{" "}
          <strong>675basket.com/como-funciona</strong> y también abajo en el login:{" "}
          <strong>Cómo funciona la app</strong>.
        </p>
        <Figure
          src="/tutorial/01_login.jpg"
          alt="Pantalla de inicio de sesión de 675app en modo claro"
          caption="Login en modo claro: logo 675, correo, contraseña o Google."
        />
        <p>
          Si es la primera vez y no tienes club, pide uno desde la app. Solo el superadmin puede asignártelo.
        </p>
      </section>

      <section className="tutorial__section" id="tutorial-aspecto">
        <h2>2. Aspecto</h2>
        <p>
          El fondo es la pista (madera) y las tarjetas van en cristal. Los títulos usan una tipografía condensada de
          pizarra táctica; el naranja del club marca botones y acentos.
        </p>
        <p>
          Arriba a la derecha está el interruptor de tema: luna para modo oscuro (madera oscura) y sol para volver al
          claro. El encabezado muestra tu rol, <strong>Opciones</strong> (engranaje) y <strong>Salir</strong>. El logo
          675app te devuelve al listado de equipos.
        </p>
        <Figure
          src="/tutorial/01b_login_oscuro.jpg"
          alt="Pantalla de inicio de sesión de 675app en modo oscuro"
          caption="El mismo login en modo oscuro: pista, madera y naranja."
        />
      </section>

      <section className="tutorial__section" id="tutorial-roles">
        <h2>3. Qué puede hacer cada rol</h2>
        <div className="tutorial__table-wrap">
          <table className="tutorial__table">
            <thead>
              <tr>
                <th>Rol</th>
                <th>Qué hace</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Entrenador</td>
                <td>
                  Dashboard, plantilla, entrenos, partidos y físicos de sus equipos (hasta 4 favoritos).
                </td>
              </tr>
              <tr>
                <td>Preparador físico</td>
                <td>
                  Ve todos los equipos del club (hasta 10 favoritos). Crea y edita solo físicos. Entrenos, partidos y
                  plantilla son de consulta.
                </td>
              </tr>
              <tr>
                <td>Coordinador</td>
                <td>
                  Puede haber varios por club. Empieza en el dashboard del club; también gestiona equipos, escudos y
                  staff, y entra a los equipos.
                </td>
              </tr>
              <tr>
                <td>Superadmin</td>
                <td>Dashboard de todos los clubes, alta de clubes y asignación de club y rol.</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          El mismo día puede haber <strong>varios partidos</strong> y un <strong>físico</strong>. No puede haber entreno
          y partido el mismo día (el entreno sigue siendo uno por día).
        </p>
      </section>

      <section className="tutorial__section" id="tutorial-equipos">
        <h2>4. Tus equipos</h2>
        <p>
          Tras entrar ves los equipos del club. La estrella marca favoritos: aparecen al abrir la app (entrenador hasta
          4, preparador hasta 10). Pulsa <strong>Entrar</strong> para trabajar con uno.
        </p>
        <Figure
          src="/tutorial/02_equipos.jpg"
          alt="Listado de equipos del club con botón Entrar"
          caption="Lista de equipos. Estrella = favorito. Entrar abre el equipo."
        />
      </section>

      <section className="tutorial__section" id="tutorial-inicio">
        <h2>5. Inicio del equipo</h2>
        <p>
          El menú izquierdo tiene <strong>Inicio</strong>, <strong>Dashboard</strong>, <strong>Calendario</strong>,{" "}
          <strong>Estadísticas</strong> y <strong>Plantilla</strong>. Opciones está en el engranaje del encabezado, no
          en el menú. Inicio resume lo próximo: entreno, partido y físico. Desde las tarjetas puedes programar o ir al
          calendario.
        </p>
        <Figure
          src="/tutorial/03_inicio.jpg"
          alt="Inicio del equipo con próximo entreno, partido y físico"
          caption="Inicio: próximo entreno, partido y físico. El menú incluye Dashboard."
        />
      </section>

      <section className="tutorial__section" id="tutorial-dashboard">
        <h2>6. Dashboard</h2>
        <p>
          El coordinador y el superadmin empiezan en el <strong>dashboard del club</strong>: un resumen y, debajo, una
          tarjeta por equipo (jugadoras, sesiones, partidos, absentismo, nota y balance victorias-derrotas, sin
          empates). El periodo por defecto es <strong>Todo</strong>; puedes pasar a este mes o esta semana.{" "}
          <strong>Ver equipo</strong> abre ese equipo.
        </p>
        <Figure
          src="/tutorial/14_dashboard_club.jpg"
          alt="Dashboard del club con KPIs por equipo"
          caption="Dashboard del club: resumen y una tarjeta por equipo."
        />
        <p>
          Dentro de un equipo, la pestaña <strong>Dashboard</strong> del menú muestra los mismos indicadores de esa
          plantilla, sin el detalle de cada jugadora. La ven el entrenador, el coordinador y el superadmin.
        </p>
        <Figure
          src="/tutorial/13_dashboard.jpg"
          alt="Dashboard del equipo con KPIs y periodo Todo"
          caption="Dashboard del equipo. Periodo Todo y balance solo victorias-derrotas."
        />
      </section>

      <section className="tutorial__section" id="tutorial-calendario">
        <h2>7. Calendario</h2>
        <p>
          Cada día puede tener un punto de color: naranja entreno, morado partido, verde físico. Pulsa un día para
          verlo o crear la sesión. El preparador físico solo puede crear físicos.
        </p>
        <Figure
          src="/tutorial/04_calendario.jpg"
          alt="Calendario mensual con leyenda de entreno, partido y físico"
          caption="Calendario. El punto bajo el día indica el tipo de sesión."
        />
      </section>

      <section className="tutorial__section" id="tutorial-entreno">
        <h2>8. Entreno (o físico)</h2>
        <p>
          En <strong>Datos de sesión</strong> pones la temática y los ejercicios. Enter hace una nueva línea dentro del
          mismo ejercicio; el botón añade el siguiente. Subir / Bajar / Quitar reordenan o borran.
        </p>
        <Figure
          src="/tutorial/05_entreno.jpg"
          alt="Ficha de un entreno con temática y lista de ejercicios"
          caption="Temática y ejercicios de un entreno. Recuerda pulsar Guardar."
        />
        <p>
          En <strong>Asistencia</strong> aparecen jugadoras y el staff de la plantilla (entrenador y ayudante). Marcas
          quién está, valoras del 1 al 5 y, si falta, el motivo (justificada, no justificada, salud o doblaje). El
          doblaje no cuenta como ausencia. Puedes convocar a una jugadora de otro equipo del club.
        </p>
        <Figure
          src="/tutorial/06_asistencia.jpg"
          alt="Lista de asistencia y valoración de un entreno"
          caption="Presente = nota 1-5. Ausente = motivo. El staff también pasa lista."
        />
      </section>

      <section className="tutorial__section" id="tutorial-partido">
        <h2>9. Partido</h2>
        <p>
          Rellenas rival, si es en casa o fuera, y el resultado. El marcador usa el <strong>nombre del club</strong> y
          el del <strong>rival</strong> (no “A favor” / “En contra”). La convocatoria es la asistencia del partido:
          convocada o no, y nota si juega. Si no convoca, el motivo es <strong>No convocada</strong> o{" "}
          <strong>Lesionada</strong> (en equipos masculinos: No convocado / Lesionado). En equipos minibasket aparece
          también <strong>Planificación</strong> (sextos).
        </p>
        <Figure
          src="/tutorial/07_partido.jpg"
          alt="Datos de un partido: rival, local o visitante y resultado con nombre del club y del rival"
          caption="Datos del partido: rival, condición y resultado con el club y el rival."
        />
        <Figure
          src="/tutorial/08_convocatoria.jpg"
          alt="Convocatoria del partido con jugadoras y valoración"
          caption="Convocatoria. El contador muestra convocadas sobre el total."
        />
      </section>

      <section className="tutorial__section" id="tutorial-plantilla">
        <h2>10. Plantilla</h2>
        <p>
          Al dar de alta eliges el rol: <strong>Jugador/a</strong>, <strong>Entrenador</strong> o{" "}
          <strong>Ayudante</strong>. Nombre y apodo van en todos. El dorsal solo en jugador/a y no se puede repetir.
          Entrenador y ayudante salen con la marca ENT / AYU, sin número. El preparador físico ve la plantilla pero no
          la modifica.
        </p>
        <Figure
          src="/tutorial/10_plantilla.jpg"
          alt="Plantilla con roles jugador/a, entrenador y ayudante"
          caption="Plantilla: chips de rol. El dorsal solo aparece en jugador/a."
        />
      </section>

      <section className="tutorial__section" id="tutorial-estadisticas">
        <h2>11. Estadísticas</h2>
        <p>
          Filtra por periodo (todo, semanal, mensual o fechas) y por tipo (entrenos, partidos, físicos o todo). Pulsa
          una jugadora para ver su ficha. Los entrenadores y ayudantes de la plantilla entran solo en{" "}
          <strong>Ausencias de entrenadores</strong>: no tienen nota ni convocatoria como las jugadoras.
        </p>
        <Figure
          src="/tutorial/09_estadisticas.jpg"
          alt="Tablas de estadísticas del equipo y ausencias de entrenadores"
          caption="Stats de jugadoras y, debajo, ausencias del staff de la plantilla."
        />
      </section>

      <section className="tutorial__section" id="tutorial-opciones">
        <h2>12. Opciones</h2>
        <p>
          En el engranaje del encabezado cambias tu nombre y vuelves a abrir esta guía. El entrenador puede pedir
          cambio de club (lo aprueba el superadmin). <strong>Salir</strong> cierra la sesión.
        </p>
        <Figure
          src="/tutorial/11_opciones.jpg"
          alt="Pantalla de opciones de perfil y club"
          caption="Perfil, cuenta, club y enlace a esta guía."
        />
      </section>

      <section className="tutorial__section" id="tutorial-movil">
        <h2>13. En el móvil</h2>
        <p>
          El menú pasa abajo: <strong>Inicio</strong>, <strong>Dash</strong>, <strong>Agenda</strong>,{" "}
          <strong>Stats</strong> y <strong>Plantilla</strong>. Dentro de una sesión, Datos y Asistencia van en pestañas
          para que el texto de los ejercicios no se corte.
        </p>
        <Figure
          src="/tutorial/12_movil.jpg"
          alt="App en pantalla estrecha con menú inferior de cinco pestañas"
          caption="En el teléfono: menú inferior y pestañas Datos / Asistencia en la sesión."
        />
        <p>
          Si instalas 675app en la pantalla de inicio y no ves un cambio reciente, cierra la app del todo y ábrela
          otra vez.
        </p>
      </section>

      <section className="tutorial__section" id="tutorial-coordinacion">
        <h2>Coordinador y superadmin</h2>
        <p>
          El <strong>coordinador</strong> entra en el dashboard del club (arriba). También tiene Equipos y Coordinación.
          Puede haber más de un coordinador por club.
        </p>
        <Figure
          src="/tutorial/14_dashboard_club.jpg"
          alt="Dashboard del club del coordinador con KPIs por equipo"
          caption="Nada más entrar, el coordinador ve el dashboard del club."
        />
        <p>
          El <strong>superadmin</strong> ve el mismo dashboard de todos los clubes, crea clubes y asigna club y rol
          (entrenador, coordinador o preparador físico).
        </p>
      </section>
    </article>
  );
}
