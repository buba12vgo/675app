# 675app — instrucciones para agentes

App de clubes de baloncesto (clubes → equipos → plantilla, calendario, estadísticas).
Stack: React 19 + Vite 8 + Firebase Auth/Firestore.

## gstack (obligatorio en cada prompt)

Este proyecto usa [gstack](https://github.com/garrytan/gstack) (Garry Tan / YC): un equipo virtual de skills (CEO, eng manager, diseño, review, QA, seguridad, release).

1. Si falta el runtime, instálalo: `bash scripts/install-gstack.sh`
2. Enruta el trabajo al skill gstack que toque (ver `.cursor/rules/gstack.mdc`) y **sigue ese SKILL.md**.
3. Usa `/browse` para navegar la web. No uses `mcp__claude-in-chrome__*`.

Repos de Ruben que también deben llevar este bootstrap: `675app`, `policia-dias`, y **cualquier repo nuevo**. En un repo nuevo: `bash scripts/bootstrap-gstack.sh /ruta/al/repo`.

### Enrutado rápido

- Idea / plan: `/office-hours` → `/autoplan`
- Feature completa: `/autoplan` → implementar → `/review` → `/qa` → `/ship`
- Review: `/review`
- Bug: `/investigate`
- QA: `/qa`
- Seguridad: `/cso`

Skills: `/office-hours`, `/plan-ceo-review`, `/plan-eng-review`, `/plan-design-review`, `/plan-devex-review`, `/design-consultation`, `/design-shotgun`, `/design-html`, `/review`, `/ship`, `/land-and-deploy`, `/canary`, `/benchmark`, `/browse`, `/open-gstack-browser`, `/qa`, `/qa-only`, `/design-review`, `/setup-browser-cookies`, `/setup-deploy`, `/setup-gbrain`, `/sync-gbrain`, `/retro`, `/investigate`, `/document-release`, `/document-generate`, `/codex`, `/cso`, `/autoplan`, `/pair-agent`, `/spec`, `/learn`, `/careful`, `/freeze`, `/guard`, `/unfreeze`, `/gstack-upgrade`.

### User Rule (Cursor → Settings → Rules)

Para que gstack entre en **cada** chat, incluso en repos nuevos aún sin estos archivos, pega esto como User Rule:

> En cada proyecto usa gstack (https://github.com/garrytan/gstack). Si el repo no lo tiene, copia el bootstrap desde 675app (`bash scripts/bootstrap-gstack.sh .`) o ejecuta `bash scripts/install-gstack.sh`. Enruta cada tarea al skill gstack que corresponda (/office-hours, /autoplan, /review, /qa, /ship, /investigate, /cso, /browse) y sigue el SKILL.md. No uses mcp__claude-in-chrome__*.

## Comandos

```bash
npm install
npm run dev
npm test              # lint, build, unitarios e integración
```
