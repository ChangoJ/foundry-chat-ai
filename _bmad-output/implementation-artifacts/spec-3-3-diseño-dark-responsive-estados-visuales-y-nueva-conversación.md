---
title: 'Diseño dark, responsive, estados visuales y nueva conversación'
type: 'feature'
created: '2026-09-19'
status: 'done'
route: 'oneshot'
review_loop_iteration: 0
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problema:** Los componentes de la Story 3.2 tienen estructura funcional pero carecen de: dark theme forzado (el fondo puede aparecer blanco en navegadores sin preferencia dark), indicador de carga visible, presentación de errores en la UI, y acción de "nueva conversación". La app no está lista para el usuario final.

**Enfoque:** Pulir los componentes existentes sin crear archivos nuevos. Cuatro cambios:
1. `globals.css` — eliminar la `@media (prefers-color-scheme: dark)` y fijar siempre los colores oscuros en `:root`. Dark-only sin modo claro.
2. `chat-view.tsx` — consumir `error` y `startNewConversation` del hook; añadir barra mínima con botón "Nueva conversación" (arriba); mostrar `error` inline entre la lista y el input.
3. `message-list.tsx` — aceptar `isLoading: boolean`; mostrar tres puntos animados al final de los mensajes mientras `isLoading` es true.
4. `layout.tsx` — actualizar metadata (title/description) para reflejar la app real.

**Restricciones:**
- Sin nueva `tailwind.config.ts` ni archivos de configuración adicionales.
- El botón "Nueva conversación" no es un header complejo — solo una acción de texto en un strip mínimo.
- El indicador de carga va **dentro del área de mensajes** (en `MessageList`), no sobre el input.
- La app es dark-only: no implementar toggle ni detección de preferencia del sistema.
- `next build` debe pasar sin errores ni warnings de TypeScript.

**Archivos a modificar:**
- `src/app/globals.css`
- `src/app/layout.tsx`
- `src/modules/chat/presentation/components/chat-view.tsx`
- `src/modules/chat/presentation/components/message-list.tsx`

</frozen-after-approval>

## Implementation Notes

- `globals.css` — eliminado `@media (prefers-color-scheme: dark)`, colores oscuros fijados siempre en `:root`. Corregido también `font-family: Arial` → `var(--font-sans), Arial, ...` para que Geist cargado en layout sea el font activo.
- `layout.tsx` — actualizada metadata (título: "Foundry Chat"). Añadido `export const viewport: Viewport = { colorScheme: 'dark' }` para que system UI (scrollbar, widgets de navegador) también respete el modo oscuro.
- `chat-view.tsx` — consume `error` y `startNewConversation`; strip superior con botón `type="button"` "Nueva conversación" deshabilitado mientras carga; error con `role="alert"`; cambiado `flex-1` → `h-screen` para garantizar altura completa independiente del `min-h-full` del body.
- `message-list.tsx` — añadida prop `isLoading: boolean`; tres puntos con `animate-bounce` y `animationDelay` inline para efecto escalonado; `useEffect` ahora escucha `[messages, isLoading]` para hacer scroll también cuando aparece el indicador.
- `npx tsc --noEmit` pasa sin errores antes y después de los patches.

## Spec Change Log

## Review Triage Log

- `medium` → patched — `body` font-family: Arial sobreescribía Geist cargado en layout; corregido a `var(--font-sans), Arial, Helvetica, sans-serif`.
- `medium` → patched — sin color-scheme meta: añadido `viewport.colorScheme = 'dark'` en layout para alinear system UI (scrollbar, selects nativos) con el tema oscuro.
- `false` — `LayoutProps` sin import: TypeScript no reportó error; Next.js 16.x lo provee automáticamente.
- `false` — error stale: `startNewConversation` llama `setError(null)` al inicio; el path de recuperación funciona correctamente.
- `low` → patched — `type="button"` ausente en botón Nueva conversación: añadido para evitar submit accidental en contextos de formulario futuros. `aria-label` es `false` — el texto "Nueva conversación" es descriptivo para lectores de pantalla.
- `false` — double scrollIntoView: React 19 batchea las actualizaciones de estado, resultando en un único render.
- `false` — `message.id` sin guard: IDs siempre generados con `crypto.randomUUID()` en el hook; nunca provienen de fuente externa sin validación.
- `low` → deferred — negative animation-delay frágil ante cambios de Tailwind: el efecto actual funciona; añadido a deferred-work.md.
- `medium` → patched — sin `role="alert"` en error: añadido para que lectores de pantalla anuncien el error al aparecer.
- `medium` → patched — `flex-1` en ChatView no garantizaba altura completa con `min-h-full` en body: cambiado a `h-screen` para altura 100vh explícita.
