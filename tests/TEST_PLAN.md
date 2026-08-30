# Plan de pruebas — 675app

Ejecutar con `npm test` (rápido) o `npm run test:full` (incluye E2E e integración Firebase).

## 1. Autenticación y acceso

| ID | Área | Caso | Tipo |
|----|------|------|------|
| AUTH-01 | Login | Pantalla de login muestra email, contraseña y Google | E2E |
| AUTH-02 | Login | Login email válido redirige a la app | E2E / Integración |
| AUTH-03 | Login | Credenciales inválidas muestran error | E2E |
| AUTH-04 | Header | Muestra rol y botón Salir tras login | E2E |
| AUTH-05 | Header | Logo 675app vuelve a inicio | E2E |

## 2. Entrenador — club y equipos

| ID | Área | Caso | Tipo |
|----|------|------|------|
| COACH-01 | Club | Sin club: pantalla solicitud de club | E2E |
| COACH-02 | Club | Con club: lista equipos del club | E2E / Integración |
| COACH-03 | Club | No puede entrar en equipos de otro club | Reglas / Integración |
| COACH-04 | Club | Solicitud de cambio de club en Opciones | E2E |
| COACH-05 | Equipos | Botón Entrar abre vista de equipo | E2E |
| COACH-06 | Equipos | El entrenador no crea equipos; lo hace el coordinador | Manual / Reglas |

## 3. Vista de equipo — pestañas

| ID | Área | Caso | Tipo |
|----|------|------|------|
| TEAM-01 | Nav | Tabs visibles: Inicio, Calendario, Estadísticas, Plantilla, Opciones | E2E |
| TEAM-02 | Inicio | Tarjetas próximo entreno / partido | E2E |
| TEAM-03 | Calendario | Grilla mensual y leyenda entreno/partido | E2E |
| TEAM-04 | Calendario | Clic en día abre panel de sesión | Manual |
| TEAM-05 | Estadísticas | Filtros semanal / mensual / personalizado | E2E |
| TEAM-06 | Estadísticas | Tablas entrenos y partidos | E2E |
| TEAM-07 | Plantilla | Lista jugadoras del equipo activo | E2E / Integración |
| TEAM-08 | Plantilla | Formulario añadir jugadora | Manual |
| TEAM-09 | Opciones | Editar nombre y ver club actual | E2E |
| TEAM-10 | Contexto | Cambiar equipo vuelve a lista | E2E |

## 4. Superadmin

| ID | Área | Caso | Tipo |
|----|------|------|------|
| SA-01 | Panel | Tabs Clubes / Equipos | E2E |
| SA-02 | Clubes | Crear club, listar clubes | Manual |
| SA-03 | Clubes | Solicitudes pendientes aprobar/rechazar | Manual |
| SA-04 | Clubes | Asignarse «Mi club» | Manual |
| SA-05 | Equipos | Ver todos / filtrar por mi club | E2E |
| SA-06 | Equipos | Entrar en cualquier equipo | E2E |
| SA-07 | Seed | Botón «Datos prueba» solo superadmin | E2E / Integración |

## 5. UI global

| ID | Área | Caso | Tipo |
|----|------|------|------|
| UI-01 | Tema | Toggle claro / oscuro | E2E |
| UI-02 | Preview | Vistas móvil / tablet / PC | E2E |
| UI-03 | Responsive | Nav inferior en móvil, sidebar en desktop | Manual |
| UI-04 | Build | `npm run build` sin errores | CI |
| UI-05 | Lint | `npm run lint` sin errores | CI |

## 6. Firestore — reglas de seguridad

| ID | Área | Caso | Tipo |
|----|------|------|------|
| RULE-01 | Usuarios | Entrenador no cambia clubId directamente | Reglas |
| RULE-02 | Equipos | Entrenador solo lee equipos de su club | Reglas |
| RULE-03 | Jugadoras | Entrenador lee plantilla por equipoId | Reglas / Integración |
| RULE-04 | Jugadoras | No lee jugadoras de otro club | Reglas |
| RULE-05 | Sesiones | Entrenador lee calendario de su equipo | Reglas / Integración |
| RULE-06 | Superadmin | Acceso global | Reglas |

## 7. Lógica de negocio (unitarias)

| ID | Área | Caso | Tipo |
|----|------|------|------|
| UNIT-01 | Fechas | formatDateYYYYMMDD | Unit |
| UNIT-02 | Calendario | getCalendarMatrix semanas completas | Unit |
| UNIT-03 | Inicio | getProximosEventosInicio | Unit |
| UNIT-04 | Stats | calcularEstadisticasJugadoras | Unit |
| UNIT-05 | Stats | filtrarSesionesPorPeriodo | Unit |
| UNIT-06 | Utils | getClubInitials, formatRolLabel | Unit |
| UNIT-07 | Partido | Planificación de sextos minibasket | Unit |

## Comandos

```bash
npm test              # lint + build + unit + integración Firebase
npm run test:unit     # solo Vitest
npm run test:e2e      # Playwright (requiere build)
npm run test:full     # todo incluido E2E
npm run test:rules    # emulador Firestore (requiere Java)
npm run test:integration  # acceso real Firebase
```

Variables en `tests/env.test.example`:

- `TEST_COACH_EMAIL` / `TEST_COACH_PASSWORD`
- `TEST_SUPERADMIN_EMAIL` / `TEST_SUPERADMIN_PASSWORD` (opcional)
- `BASE_URL` (default `http://localhost:4173`)
