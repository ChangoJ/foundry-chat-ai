---
title: 'Componentes de chat — ChatView, MessageList, MessageInput'
type: 'feature'
created: '2026-09-19'
status: 'done'
route: 'oneshot'
review_loop_iteration: 0
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problema:** La app no tiene interfaz de chat. `src/app/page.tsx` muestra el scaffold por defecto de Next.js; no hay componentes que muestren mensajes ni un input para escribirlos.

**Enfoque:** Crear tres componentes de presentación (`ChatView`, `MessageList`, `MessageInput`) y reemplazar `page.tsx` con `<ChatView />`. `ChatView` consume `useChatSession` y delega la visualización a los otros dos. Esta historia entrega la estructura funcional; el estilo visual completo (dark, responsive, loading, error) se finaliza en Story 3.3.

**Archivos a crear/modificar:**
- `src/modules/chat/presentation/components/chat-view.tsx` — componente raíz del chat; Client Component (`'use client'`); consume `useChatSession`; renderiza `MessageList` + `MessageInput`; layout: `flex-1 flex flex-col` para ocupar el espacio del body (`min-h-full flex flex-col`)
- `src/modules/chat/presentation/components/message-list.tsx` — recibe `messages: Message[]`; área scrollable (`flex-1 overflow-y-auto`); mensajes `user` alineados a la derecha, `assistant` a la izquierda
- `src/modules/chat/presentation/components/message-input.tsx` — Client Component (`'use client'`); recibe `sendMessage` e `isLoading`; estado local `value`; envía con Enter (sin Shift) o botón; vacía el campo tras cada envío; campo y botón deshabilitados mientras `isLoading`
- `src/app/page.tsx` — reemplazado con solo `<ChatView />`; sin lógica, sin wrapper adicional

**Contratos de interfaz:**
- `useChatSession` exportado desde `@/modules/chat/presentation/hooks/use-chat-session`; return type: `{ messages: Message[], sendMessage: (content: string) => Promise<void>, isLoading: boolean, error: string | null, startNewConversation: () => Promise<void> }`
- `Message` de `@/modules/chat/domain/entities/message`: `{ id: string; role: 'user' | 'assistant'; content: string; createdAt: Date }`

**Restricciones:**
- `presentation/` solo importa de `domain/` y hooks propios de presentación; ningún import de `infrastructure/` ni fetch directo
- `page.tsx` es Server Component; puede importar `ChatView` (Client Component) directamente
- Tailwind v4 (sin `tailwind.config.ts`); clases utilitarias estándar

</frozen-after-approval>

## Implementation Notes

- Creados `chat-view.tsx`, `message-list.tsx`, `message-input.tsx` en `src/modules/chat/presentation/components/`.
- `page.tsx` reemplazado con `<ChatView />` sin lógica propia.
- `MessageList` recibió `'use client'` tras patch de auto-scroll (agrega `useRef` + `useEffect`).
- Patch 1 — auto-scroll: `useEffect` dispara `scrollIntoView` al cambiar `messages`; `<div ref={bottomRef} />` al final de la lista.
- Patch 2 — `whitespace-pre-wrap`: aplicado al div de burbuja para preservar saltos de línea de respuestas del agente.
- `MessageInput` local state `value` se vacía en `handleSubmit` antes del `await sendMessage(...)` para evitar que el botón vuelva a estar habilitado con el texto anterior mientras carga.
- `npx tsc --noEmit` pasa sin errores antes y después de los patches.

## Spec Change Log

## Review Triage Log

- `false` — `Date` non-serializable + `'use client'` ausente en `message-list`: los mensajes se crean en el cliente (hook), nunca cruzan boundary de serialización servidor→cliente; `'use client'` fue añadido igual por el patch de auto-scroll.
- `false` — `error` y `startNewConversation` no expuestos: Story 3.3 scope (AC explícito allá).
- `false` — empty state sin placeholder: Story 3.3 scope (indicador de carga).
- `false` — input deshabilitado sin explicación durante init: Story 3.3 scope.
- `medium` → patched — sin auto-scroll: añadido `useRef` + `useEffect` + `scrollIntoView` en `MessageList`.
- `false` — `'use client'` explícito sin hooks: no requerido por Next.js en ausencia de hooks/browser APIs; resuelto de todos modos por patch de auto-scroll.
- `low` → deferred — metadata en `page.tsx` aún muestra "Create Next App": pre-existente del scaffold, fuera de scope de esta historia.
- `false` — `void handleSubmit()` swallows rejections: `sendMessage` del hook captura todo internamente y expone `error` en estado; nunca relanza.
- `medium` → patched — `whitespace-pre-wrap` ausente: añadido a la burbuja de mensaje para preservar saltos de línea de respuestas del agente.
