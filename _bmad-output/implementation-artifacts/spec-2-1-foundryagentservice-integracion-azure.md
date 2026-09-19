---
title: '2.1 — FoundryAgentService: integración Azure AI Foundry'
type: 'feature'
created: '2026-09-19'
status: 'done'
route: 'oneshot'
review_loop_iteration: 0
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problema:** `IAgentService` está definido pero no tiene implementación; la app no puede comunicarse con Azure AI Foundry.

**Enfoque:** Implementar `FoundryAgentService` en `infrastructure/foundry/` usando `@azure/ai-projects` y `DefaultAzureCredential`. El servicio crea una nueva conversación en la API de Azure y envía mensajes usando el `conversationId` sin reenviar historial.

**Patrón SDK confirmado (ver investigación):**
- `AIProjectClient(endpoint, new DefaultAzureCredential())` → cliente principal
- `client.getOpenAIClient()` → cliente OpenAI-compatible con extensiones Azure
- `openAIClient.conversations.create()` → `{ id: string }` — crea conversación vacía
- `openAIClient.conversations.items.create(conversationId, { items: [{ type:'message', role:'user', content }] })` → añade mensaje al hilo
- `openAIClient.responses.create({ conversation: conversationId }, { body: { agent: { name, type:'agent_reference' } } })` → `{ output_text: string }`

**Tareas:**

1. Crear `src/modules/chat/infrastructure/foundry/foundry-agent.service.ts`:
   - Clase `FoundryAgentService implements IAgentService`
   - Constructor: leer `AZURE_AI_FOUNDRY_ENDPOINT` y `AZURE_AI_AGENT_NAME` de `process.env`; lanzar `Error` descriptivo si alguno falta; crear `AIProjectClient` con `DefaultAzureCredential` (instancia única)
   - `startConversation()`: llamar `openAIClient.conversations.create()`, devolver `conversation.id`; envolver cualquier excepción en `FoundryConnectionError`
   - `sendMessage(conversationId, content)`: añadir el mensaje de usuario con `conversations.items.create`, generar respuesta con `responses.create` pasando el agent name como `agent_reference`, devolver `response.output_text`; envolver cualquier excepción en `FoundryConnectionError`
   - `getOpenAIClient()` se llama al inicio de cada método (no cacheado, evita tipado de `OpenAI` como dependencia directa)

2. Eliminar `src/modules/chat/infrastructure/.gitkeep` (el directorio tendrá contenido real).

**Done cuando:**
- `src/modules/chat/infrastructure/foundry/foundry-agent.service.ts` existe e implementa `IAgentService`.
- `AZURE_AI_FOUNDRY_ENDPOINT` y `AZURE_AI_AGENT_NAME` solo se acceden desde `process.env`; nada hardcodeado.
- Ninguna importación de `infrastructure/` en `domain/` ni `application/`.
- `npx tsc --noEmit` pasa sin errores.

</frozen-after-approval>

## Implementation Notes

- `infrastructure/.gitkeep` eliminado; reemplazado por el subdirectorio `foundry/` con el archivo real.
- `getOpenAIClient()` se llama al inicio de cada método en lugar de cachearse en una propiedad. Evita declarar `OpenAI` como tipo explícito (no es dependencia directa en package.json) y mantiene el servicio sin estado de cliente OpenAI.
- El constructor lanza `Error` descriptivo (no `FoundryConnectionError`) si faltan env vars: es un fallo de configuración en startup, no un fallo de conexión en runtime.
- La excepción en `sendMessage` envuelve tanto el fallo de `conversations.items.create` como el de `responses.create`. Si el primero falla, el mensaje no se añade al hilo y se lanza `FoundryConnectionError` sin llamar al segundo — comportamiento correcto.
- `npx tsc --noEmit` pasó sin errores. Los tipos de `@azure/ai-projects` y `openai` (transitivo) resuelven correctamente.

## Review Triage Log

- `false` — "getOpenAIClient() llamado dos veces": error del revisor; la variable local openAIClient se obtiene una vez y se reutiliza para ambas llamadas en sendMessage.
- `low/defer` — "error original silenciado": cause chaining válido, ya en deferred-work.md desde story 1.2. No se duplica entrada.
- `false` — "output_text nullable": el tipo SDK es `string` no nullable; fallos del agente producen excepciones capturables.
- `false` — "sin guard para content vacío": validación de input es responsabilidad del Route Handler (story 2.2); infraestructura confía en sus callers.
- `false` — "constructor lanza Error genérico": intencional; fallo de configuración en startup ≠ fallo de conexión en runtime.
- `false` — "conversationId sin validar": misma razón que content; validación en Route Handler.
- `low/defer` — "errores de config enmascarados como FOUNDRY_CONNECTION_ERROR": misma causa raíz que causa chaining; ya en deferred-work.md.
