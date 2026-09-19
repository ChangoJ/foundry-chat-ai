---
title: 'Hook useChatSession — estado y lógica de conversación'
type: 'feature'
created: '2026-09-19'
status: 'done'
route: 'oneshot'
review_loop_iteration: 1
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problema:** Los componentes de presentación del chat no tienen una interfaz limpia para gestionar el estado de la conversación (mensajes, carga, errores) ni para orquestar las llamadas al Route Handler `POST /api/chat`. Sin este hook, cada componente tendría que gestionar lógica de negocio directamente.

**Enfoque:** Implementar `useChatSession` en `src/modules/chat/presentation/hooks/use-chat-session.ts`, que encapsula todo el estado de conversación y expone `{ messages: Message[], sendMessage, isLoading, error, startNewConversation }`. El hook llama a `POST /api/chat` para inicializar al montar, enviar mensajes y reiniciar la sesión. Cero persistencia: todo en React state.

**Contrato completo del hook:**

- **Al montar:** llama a `POST /api/chat` con `{ content: null, conversationId: null }`, almacena el `conversationId` retornado en estado React (nunca en `localStorage`).
- **`sendMessage(content)`:** pone `isLoading = true`, llama a `POST /api/chat` con `{ content, conversationId }`, agrega el mensaje del usuario y la respuesta del agente a `messages`, devuelve `isLoading = false`. Si falla, `error` toma el mensaje de error e `isLoading` vuelve a `false`.
- **`startNewConversation()`:** resetea `messages` a `[]`, llama a `POST /api/chat` con `{ content: null, conversationId: null }`, reemplaza `conversationId` con el nuevo.
- **Sin persistencia:** prohibido `localStorage`, `sessionStorage`, cookies o `IndexedDB`. Al recargar o cerrar la pestaña, todo se pierde por diseño.
- **Tipos:** `Message` de `src/modules/chat/domain/entities/message.ts` (`id: string, role: 'user' | 'assistant', content: string, createdAt: Date`). Los mensajes del usuario se crean localmente con `crypto.randomUUID()` y `new Date()` antes de hacer fetch.
- **Dependencias permitidas:** solo `domain/` y `application/dtos/`. No importar de `infrastructure/`. No hacer `fetch` a rutas hardcodeadas salvo `/api/chat`.

**Archivos de referencia para la implementación:**
- `src/modules/chat/domain/entities/message.ts` — tipo `Message`
- `src/modules/chat/application/dtos/chat.dto.ts` — `ChatRequestDto` / `ChatResponseDto`
- `src/app/api/chat/route.ts` — shape de respuestas: `{ conversationId }` (inicio) o `{ content, conversationId }` (mensaje) o `{ error }` (error)

</frozen-after-approval>

## Implementation Notes

- Creado `src/modules/chat/presentation/hooks/use-chat-session.ts` con el hook `useChatSession`.
- Se extrajo la lógica de inicio de sesión en la función `initSession()` a nivel de módulo para reutilizarla entre el efecto de montaje y `startNewConversation`.
- El efecto de montaje usa un flag `cancelled` para evitar actualizaciones de estado tras unmount (sin AbortController — diferido).
- Patch aplicado tras review: `data.content as string` reemplazado por `data.content ?? ''` para guardar contra respuestas exitosas con `content` ausente.
- `npx tsc --noEmit` pasa sin errores antes y después del patch.

## Spec Change Log

## Review Triage Log

- `false` — `initSession` module-level no injectable: Clean Architecture del proyecto no requiere inyectar `fetch` en hooks de presentación; el DI opera a nivel de casos de uso.
- `false` — `sendMessage` silencioso con `conversationId === null`: la UI deshabilita el input mientras `isLoading` es true, por lo que el guard nunca se alcanza en uso normal.
- `false` — mensaje de usuario optimista no revertido en error: diseño correcto, el usuario debe ver su propio mensaje aunque el agente falle.
- `false` — `ChatRequestDto` no importado: structural typing de TS valida los literales contra las shapes sin import explícito.
- `medium` → patched — `data.content as string` sin guard: corregido a `data.content ?? ''`.
- `false` — `isLoading` única flag: el spec define exactamente `isLoading: boolean`; distinción de estados es fuera de scope.
- `low` → deferred — sin AbortController: la petición HTTP en-vuelo no se cancela al desmontar; crea conversaciones huérfanas en dev. Diferido a deferred-work.md.
- `low` → deferred — strings de error mezclados (es/en): normalización de idioma de errores diferida, requiere decisión de i18n y ajustes al route handler.
- `medium` → patched — `initSession` sin guard para `conversationId` ausente: si el servidor devuelve 200 sin `conversationId`, la cast `as string` almacenaba `undefined` en estado React. Añadido `if (!data.conversationId) throw new Error('Respuesta sin conversationId')` antes del return; eliminada la cast insegura.
- `low` → patched — `isLoading` initial state `false`: causaba un render inicial donde el input estaba habilitado y `conversationId` era null; cambiado a `useState(true)` para deshabilitar el input desde el primer render.
- `low` → deferred — `sendMessage` noop silencioso tras init fallido: tras un init fallido `isLoading=false` y el input queda habilitado; si el usuario envía, `sendMessage` retorna sin feedback. Diferido a deferred-work.md.
- `low` → deferred — tests unitarios para `useChatSession` (initSession, sendMessage, startNewConversation): sin cobertura de los paths de error y happy paths. Diferido a deferred-work.md; cerrar al configurar test runner.

## Review Findings

- [x] [Review][Patch] `initSession` sin guard para `conversationId` ausente [src/modules/chat/presentation/hooks/use-chat-session.ts:20] — si el servidor devuelve HTTP 200 sin campo `conversationId`, la cast `as string` almacenaba `undefined` tipado como `string` en estado React; llamadas posteriores a `sendMessage` enviaban `conversationId: undefined` al Route Handler. Añadido `if (!data.conversationId) throw new Error('Respuesta sin conversationId')`.
- [x] [Review][Patch] `isLoading` initial state `false` — flash de 1 frame con input habilitado y `conversationId=null` [use-chat-session.ts:26] — cambiado a `useState(true)` para deshabilitar el input desde el primer render.
- [x] [Review][Defer] `sendMessage` noop silencioso tras init fallido — diferido a deferred-work.md; setear error descriptivo cuando `conversationId===null` y el input está habilitado.
- [x] [Review][Defer] Tests unitarios para `useChatSession` — diferido a deferred-work.md; cerrar al configurar test runner.

**Rechazados:**
- `false` — `UseChatSessionReturn` no exportado: spec no lo requiere.
- `false` — `conversationId` no en return type público: detalle de implementación, fuera de contrato spec.
- `false` — `ChatRequestDto`/`ChatResponseDto` no importados: structural typing de TS valida los literales; spec triage confirmado.
- `false` — mensaje de usuario no revertido en error: diseño correcto per spec triage.
- `false` — `sendMessage('')` sin guard en el hook: MessageInput guarda antes de llamar.
- `false` — server devuelve nuevo `conversationId` en cada respuesta: route.ts siempre devuelve el mismo id recibido.
- `false` — llamadas concurrentes a `sendMessage`: UI guarda con `isLoading=true`.
- `reject` — `review_loop_iteration: 0` inconsistente: fix edita spec (frozen).
- `reject` — AbortController: pre-existente en deferred-work.md; no duplicado.
