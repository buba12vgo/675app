import { IconChevronLeft } from "../components/icons.jsx";

const SECTIONS = [
  { id: "entrar", label: "Entrar" },
  { id: "roles", label: "Roles" },
  { id: "equipos", label: "Equipos" },
  { id: "inicio", label: "Inicio" },
  { id: "calendario", label: "Calendario" },
  { id: "entreno", label: "Entreno" },
  { id: "partido", label: "Partido" },
  { id: "plantilla", label: "Plantilla" },
  { id: "estadisticas", label: "Estadísticas" },
  { id: "opciones", label: "Opciones" },
  { id: "movil", label: "Móvil" },
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
        <h1 className="tutorial__title">Cómo funciona la web</h1>
        <p className="tutorial__lead">
          675app organiza el día a día del club: equipos, plantilla, entrenos, partidos y trabajo físico.
          Esta guía sigue el orden en el que se usa.
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
          Abre <strong>675app.vercel.app</strong>. Entra con correo y contraseña o con Google.
          Arriba a la derecha puedes pasar de modo claro a oscuro (luna / sol).
        </p>
        <Figure
          src="/tutorial/01_login.jpg"
          alt="Pantalla de inicio de sesión de 675app"
          caption="Login: correo, contraseña o Google."
        />
        <p>
          Si es la primera vez y no tienes club, pide uno desde la app. Solo el superadmin puede asignártelo.
        </p>
      </section>

      <section className="tutorial__section" id="tutorial-roles">
        <h2>2. Qué puede hacer cada rol</h2>
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
                <td>Plantilla, entrenos, partidos y físicos de sus equipos (hasta 4 favoritos).</td>
              </tr>
              <tr>
                <td>Preparador físico</td>
                <td>
                  Ve todos los equipos del club (hasta 10 favoritos). Crea y edita solo físicos.
                  Entrenos, partidos y plantilla son de consulta.
                </td>
              </tr>
              <tr>
                <td>Coordinador</td>
                <td>Equipos y escudos del club, coordinación del staff. También entra a los equipos.</td>
              </tr>
              <tr>
                <td>Superadmin</td>
                <td>Clubes, usuarios y roles de toda la app.</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          El mismo día puede haber un <strong>entreno o partido</strong> y un <strong>físico</strong>.
          No puede haber entreno y partido el mismo día.
        </p>
      </section>

      <section className="tutorial__section" id="tutorial-equipos">
        <h2>3. Tus equipos</h2>
        <p>
          Tras entrar ves los equipos del club. La estrella marca favoritos: aparecen al abrir la app
          (entrenador hasta 4, preparador hasta 10). Pulsa <strong>Entrar</strong> para trabajar con uno.
        </p>
        <Figure
          src="/tutorial/02_equipos.jpg"
          alt="Listado de equipos del club con botón Entrar"
          caption="Lista de equipos. Estrella = favorito. Entrar abre el equipo."
        />
      </section>

      <section className="tutorial__section" id="tutorial-inicio">
        <h2>4. Inicio del equipo</h2>
        <p>
          El menú izquierdo (en el móvil, abajo) tiene Inicio, Calendario, Estadísticas y Plantilla.
          Inicio resume lo próximo: entreno, partido y físico. Desde las tarjetas puedes programar o ir al calendario.
        </p>
        <Figure
          src="/tutorial/03_inicio.jpg"
          alt="Inicio del equipo con próximo entreno, partido y físico"
          caption="Inicio: próximo entreno, partido y físico."
        />
      </section>

      <section className="tutorial__section" id="tutorial-calendario">
        <h2>5. Calendario</h2>
        <p>
          Cada día puede tener un punto de color: naranja entreno, morado partido, verde físico.
          Pulsa un día para verlo o crear la sesión. El preparador físico solo puede crear físicos.
        </p>
        <Figure
          src="/tutorial/04_calendario.jpg"
          alt="Calendario mensual con leyenda de entreno, partido y físico"
          caption="Calendario. El punto bajo el día indica el tipo de sesión."
        />
      </section>

      <section className="tutorial__section" id="tutorial-entreno">
        <h2>6. Entreno (o físico)</h2>
        <p>
          En <strong>Datos de sesión</strong> pones la temática y los ejercicios, uno por uno.
          Enter añade el siguiente. Subir / Bajar / Quitar reordenan o borran.
          En el móvil el texto del ejercicio se ve entero, en varias líneas.
        </p>
        <Figure
          src="/tutorial/05_entreno.jpg"
          alt="Ficha de un entreno con temática y lista de ejercicios"
          caption="Temática y ejercicios de un entreno. Recuerda pulsar Guardar."
        />
        <p>
          En <strong>Asistencia</strong> marcas quién está, valoras del 1 al 5 y, si falta, el motivo
          (justificada, no justificada o salud). Puedes convocar a una jugadora de otro equipo del club.
        </p>
        <Figure
          src="/tutorial/06_asistencia.jpg"
          alt="Lista de asistencia y valoración de un entreno"
          caption="Presente = nota 1-5. Ausente = motivo."
        />
      </section>

      <section className="tutorial__section" id="tutorial-partido">
        <h2>7. Partido</h2>
        <p>
          En un partido rellenas rival y si es en casa o fuera. La convocatoria es la asistencia del partido:
          convocada o no, y nota si juega. En canasta grande aparece también <strong>Planificación</strong> (sextos).
        </p>
        <Figure
          src="/tutorial/07_partido.jpg"
          alt="Datos de un partido: rival y local o visitante"
          caption="Datos del partido: rival y condición."
        />
        <Figure
          src="/tutorial/08_convocatoria.jpg"
          alt="Convocatoria del partido con jugadoras y valoración"
          caption="Convocatoria. El contador muestra convocadas sobre el total."
        />
      </section>

      <section className="tutorial__section" id="tutorial-plantilla">
        <h2>8. Plantilla</h2>
        <p>
          Alta con nombre, dorsal y apodo. En cada ficha puedes editar o quitar.
          El preparador físico la ve pero no la modifica.
        </p>
        <Figure
          src="/tutorial/10_plantilla.jpg"
          alt="Plantilla de jugadores con formulario para añadir"
          caption="Plantilla del equipo. El dorsal no se puede repetir."
        />
      </section>

      <section className="tutorial__section" id="tutorial-estadisticas">
        <h2>9. Estadísticas</h2>
        <p>
          Filtra por periodo (todo, semanal, mensual o fechas) y por tipo (entrenos, partidos, físicos o todo).
          Pulsa una jugadora para ver su ficha.
        </p>
        <Figure
          src="/tutorial/09_estadisticas.jpg"
          alt="Tabla de estadísticas del equipo por jugadora"
          caption="Asistencias, convocatorias y nota media del periodo."
        />
      </section>

      <section className="tutorial__section" id="tutorial-opciones">
        <h2>10. Opciones</h2>
        <p>
          En el engranaje del encabezado cambias tu nombre. El entrenador puede pedir cambio de club
          (lo aprueba el superadmin). <strong>Salir</strong> cierra la sesión.
        </p>
        <Figure
          src="/tutorial/11_opciones.jpg"
          alt="Pantalla de opciones de perfil y club"
          caption="Perfil, cuenta y club."
        />
      </section>

      <section className="tutorial__section" id="tutorial-movil">
        <h2>11. En el móvil</h2>
        <p>
          El menú pasa abajo: Inicio, Agenda, Stats y Plantilla. Dentro de una sesión, Datos y Asistencia van en pestañas
          para que el texto de los ejercicios no se corte.
        </p>
        <Figure
          src="/tutorial/12_movil.jpg"
          alt="Ficha de entreno vista en pantalla estrecha de móvil"
          caption="En el teléfono: pestañas Datos de sesión y Asistencia."
        />
        <p>
          Si instalas 675app en la pantalla de inicio y no ves un cambio reciente, cierra la app del todo y ábrela otra vez.
        </p>
      </section>

      <section className="tutorial__section">
        <h2>Coordinador y superadmin</h2>
        <p>
          El <strong>coordinador</strong> tiene Equipos (crear, editar, escudos) y Coordinación (escudo del club y favoritos del staff).
        </p>
        <p>
          El <strong>superadmin</strong> crea clubes, asigna club y rol (entrenador, coordinador o preparador físico)
          y puede generar datos de prueba.
        </p>
      </section>
    </article>
  );
}
