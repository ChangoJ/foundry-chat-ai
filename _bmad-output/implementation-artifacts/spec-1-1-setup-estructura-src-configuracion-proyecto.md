---
title: '1.1 — Setup de estructura src/ y configuración del proyecto'
type: 'chore'
created: '2026-09-19'
status: 'done'
route: 'oneshot'
review_loop_iteration: 0
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problema:** El proyecto tiene `app/` en la raíz y el alias `@/*` apunta a `./*`; no existe la estructura de directorios de Clean Architecture ni las dependencias de Azure.

**Enfoque:** Mover `app/` a `src/app/`, ajustar `tsconfig.json`, crear los directorios del módulo `chat` y la estructura de soporte, instalar las dependencias de Azure, y documentar las variables de entorno en `.env.example`.

**Tareas:**

1. Mover `app/favicon.ico`, `app/globals.css`, `app/layout.tsx`, `app/page.tsx` a `src/app/`. Eliminar el directorio `app/` vacío de la raíz.
2. `tsconfig.json` — cambiar solo `"@/*": ["./*"]` por `"@/*": ["./src/*"]`. No tocar ningún otro campo.
3. Crear los siguientes directorios con un archivo `.gitkeep` vacío en cada uno (para que git los rastree):
   - `src/modules/chat/domain/entities/`
   - `src/modules/chat/domain/errors/`
   - `src/modules/chat/application/ports/`
   - `src/modules/chat/application/dtos/`
   - `src/modules/chat/application/use-cases/`
   - `src/modules/chat/infrastructure/`
   - `src/modules/chat/presentation/components/`
   - `src/modules/chat/presentation/hooks/`
   - `src/shared/ui/`
   - `src/core/di/`
4. Crear `.env.example` en la raíz:
   ```
   AZURE_AI_FOUNDRY_ENDPOINT=https://<your-endpoint>.services.ai.azure.com/api/projects/<your-project>
   AZURE_AI_AGENT_NAME=<your-agent-name>
   ```
5. `.gitignore` — agregar la línea `.env*.local` explícitamente (aunque `.env*` ya la cubre, el AC lo requiere).
6. Instalar dependencias Azure: verificar versiones con `npm view @azure/ai-projects version` y `npm view @azure/identity version`, luego `npm install @azure/ai-projects @azure/identity`.

**Done cuando:**
- `src/app/` contiene los cuatro archivos; `app/` ya no existe en la raíz.
- `tsconfig.json` tiene `"@/*": ["./src/*"]`.
- Todos los directorios del punto 3 existen en disco.
- `.env.example` en la raíz documenta `AZURE_AI_FOUNDRY_ENDPOINT` y `AZURE_AI_AGENT_NAME`.
- `.gitignore` tiene una línea `.env*.local`.
- `@azure/ai-projects` y `@azure/identity` están en `dependencies` de `package.json`.
- `npm run build` pasa sin errores.

</frozen-after-approval>

## Implementation Notes

- Movidos 4 archivos de `app/` a `src/app/` (favicon.ico, globals.css, layout.tsx, page.tsx). Next.js 16 detecta `src/app/` automáticamente sin cambios en `next.config.ts`.
- `tsconfig.json` actualizado: `"@/*": ["./src/*"]`. El campo `include` con `"**/*.ts"` ya cubre `src/` sin cambios adicionales.
- Creados 10 directorios con `.gitkeep` para rastreo en git.
- `.env.example` creado con placeholders sin valores reales.
- `.gitignore` ya tenía `.env*` (cubre `.env*.local`); se agregó `.env*.local` explícitamente para satisfacer el AC.
- `@azure/ai-projects@2.7.0` y `@azure/identity@4.13.3` instalados (versiones latest verificadas con `npm view` antes de instalar).
- `npm run build` pasó sin errores (TypeScript + generación de páginas estáticas).

## Review Triage Log

- `false` — "app/ no committeado atómicamente": el commit ocurre al final del workflow; los archivos están en el worktree pendientes de commit, no es un bug.
- `low/defer` — ".gitignore redundante": .env*.local es subconjunto de .env*; redundancia intencional por AC; deferido sin entrada (trivial).
- `defer` — "layout.tsx metadata scaffold": contenido pre-existente no causado por este cambio; reemplazado en Epic 3 story 3.3.
- `defer` — "page.tsx contenido scaffold": ídem; reemplazado en Epic 3 story 3.2.
- `low/defer` — "tsconfig.json sin baseUrl": riesgo real pero especulativo hasta que se configura test runner; entrada añadida a deferred-work.md.
- `defer` — "infrastructure/ sin subdirectorios": subdirectorios creados en Epic 2 story 2.1 (foundry/); ya capturado en los epics.
- `false` — ".env.example sin variables de identidad Azure": la architecture spine documenta explícitamente que DefaultAzureCredential no requiere variables adicionales (Azure CLI en local, Managed Identity en cloud).
- `defer` — "lint script sin target + sin tests": script eslint pre-existente del scaffold; entrada añadida a deferred-work.md. Tests deferred por architecture spine.
