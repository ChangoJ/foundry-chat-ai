---
title: '2.2 — DI container y Route Handler POST /api/chat'
type: 'feature'
created: '2026-09-19'
status: 'done'
route: 'oneshot'
review_loop_iteration: 1
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problema:** Los casos de uso y `FoundryAgentService` existen pero no están conectados ni expuestos vía HTTP.

**Enfoque:** Crear el contenedor de dependencias que instancia y conecta las piezas, y el Route Handler que expone `POST /api/chat` como único punto de entrada HTTP, discriminando entre inicio de conversación y envío de mensaje.

**Tareas:**

1. Eliminar `src/core/di/.gitkeep`.

2. `src/core/di/chat.container.ts` — singletons a nivel de módulo:
   ```ts
   const agentService = new FoundryAgentService();
   export const startConversationUseCase = new StartConversationUseCase(agentService);
   export const sendMessageUseCase = new SendMessageUseCase(agentService);
   ```

3. Crear `src/app/api/chat/route.ts` — Route Handler:
   - Parsear body como `ChatRequestDto`
   - Si `content === null && conversationId === null` → llamar `startConversationUseCase.execute()`, devolver `Response.json({ conversationId })` con status 200
   - Si ambos son `string` → llamar `sendMessageUseCase.execute(conversationId, content)`, devolver `Response.json({ content, conversationId })` con status 200
   - Catch `FoundryConnectionError` → `Response.json({ error: error.message }, { status: 502 })`
   - Catch cualquier otro error → `Response.json({ error: 'Internal server error' }, { status: 500 })`
   - Usar la Web API nativa: `Response.json(...)` (Next.js 16 docs; **no** `NextResponse`)
   - Parámetro de la función: `request: NextRequest` desde `'next/server'`

**Done cuando:**
- `src/core/di/chat.container.ts` y `src/app/api/chat/route.ts` existen.
- El Route Handler discrimina correctamente los dos casos del DTO.
- Ninguna variable de entorno de Azure ni instancia de `DefaultAzureCredential` es referenciable desde el bundle cliente.
- `npx tsc --noEmit` pasa sin errores.

</frozen-after-approval>

## Implementation Notes

- El container usa lazy initialization (funciones `getStartConversationUseCase()` / `getSendMessageUseCase()`) en lugar de constantes a nivel de módulo. Motivo: `next build` evalúa los módulos importados por el Route Handler en build time; si `FoundryAgentService` se instancia a nivel de módulo, el constructor lanza por env vars ausentes en build. Con lazy init, la instanciación ocurre solo en la primera request real en runtime.
- El Route Handler discrimina los dos casos con `content === null && conversationId === null` (inicio) vs `typeof content === 'string' && typeof conversationId === 'string'` (envío). Inputs inválidos devuelven 400.
- Se usa `Response.json(...)` nativo (Next.js 16 docs), no `NextResponse.json`.
- `npm run build` pasa; `/api/chat` aparece como `ƒ (Dynamic)` — server-rendered, nunca estático. Correcto.
- `npx tsc --noEmit` pasa sin errores.

## Review Triage Log (iteration 1)

| # | Hallazgo | Veredicto | Acción |
|---|---|---|---|
| 1 | `init()` no thread-safe bajo cold-start concurrente | `false` | Node.js es single-threaded; no hay race condition dentro de un proceso |
| 2 | `getSendMessageUseCase` retorna `sendUseCase!` pero el guard solo chequea `startUseCase` | `low/defer` | Agregado a deferred-work.md; no es un bug real: `init()` asigna ambas atómicamente |
| 3 | `=== null` no maneja campos `undefined` del JSON | `false` | Los inputs `undefined` llegan al último `if` y retornan 400 correctamente; el cliente (3.1) siempre envía null explícito |
| 4 | Sin validación de longitud en `content` | `false` | Práctica project, NFR-4 (stack mínimo); sin requisito de límite de longitud |
| 5 | `agentContent` podría ser undefined/empty | `false` | `SendMessageUseCase.execute()` retorna `Promise<string>`; `output_text` tipado como `string` no nullable en el SDK |
| 6 | `startConversation` devuelve 200 en vez de 201 | `false` | AC especifica explícitamente status 200 para ambos casos |
| 7 | `FoundryAgentService` construido sin args de config | `false` | Diseño intencional per AD-2; env vars en constructor es el patrón de architecture spine |
| 8 | Sin `export const dynamic = 'force-dynamic'`; sin OPTIONS handler | `false` | Build muestra `ƒ (Dynamic)` — Next.js detecta automáticamente rutas API POST como dinámicas; CORS fuera del alcance del PRD |
