# Epic 3 Context: Interfaz de chat completa

<!-- Compiled from planning artifacts. Edit freely. Regenerate with compile-epic-context if planning docs change. -->

## Goal

El usuario puede abrir la app y mantener una conversación completa con el agente de Azure AI Foundry a través de una interfaz dark, minimalista y responsive. El épica cubre todo lo que el usuario ve y toca: el hook de estado que conecta con el Route Handler de Epic 2, los componentes de chat, el indicador de carga, el manejo de errores visible en la UI y la acción de iniciar una nueva conversación. Al finalizar, la app es funcional de extremo a extremo.

## Stories

- Story 3.1: Hook `useChatSession` — estado y lógica de conversación
- Story 3.2: Componentes de chat — ChatView, MessageList, MessageInput
- Story 3.3: Diseño dark, responsive, estados visuales y nueva conversación

## Requirements & Constraints

**Funcionales cubiertos en este épica (FR-1.1, 1.2, 1.5, 1.6, 1.7, 1.8, 3.1–3.5):**

- El usuario puede enviar mensajes y ver las respuestas del agente en el mismo hilo.
- Al montar la app se crea una conversación automáticamente (llamada a `POST /api/chat` con `content: null, conversationId: null`); el `conversationId` se almacena únicamente en estado React.
- Los mensajes se acumulan en estado React solo para renderizado — ningún dato se escribe en `localStorage`, cookies ni IndexedDB.
- Al recargar o cerrar la pestaña, `conversationId` y mensajes se pierden por diseño.
- El usuario puede iniciar una nueva conversación: el historial se borra y se solicita un nuevo `conversationId` al servidor.
- Mientras el agente responde, hay un indicador de carga visible en el área de mensajes.
- Los errores de conexión se muestran en la UI (bajo la lista de mensajes o inline); nunca stack traces.
- Dark theme como única opción visual; sin modo claro.
- Layout: área de mensajes scrollable + input fijo en la parte inferior.
- Mensajes de usuario y agente distinguidos visualmente (alineación o color).
- Responsive: funciona en móvil (columna única, input accesible) y en desktop.
- Sin barra de navegación, header complejo ni elementos decorativos.

**Criterios de éxito del épica:**

- El usuario puede abrir la app, enviar mensajes sobre programación o IA y recibir respuestas del agente.
- El contexto de conversación se mantiene durante la sesión sin que el cliente reenvíe el historial.
- Al recargar, la conversación inicia limpia.
- `next build` pasa sin errores ni warnings de TypeScript.

## Technical Decisions

**Arquitectura de estado (AD-5):** `useChatSession` es el único contenedor de estado del cliente. Vive en `src/modules/chat/presentation/hooks/use-chat-session.ts`. Expone exactamente: `{ messages: Message[], sendMessage: (content: string) => Promise<void>, isLoading: boolean, error: string | null, startNewConversation: () => Promise<void> }`. Ningún componente gestiona estado de conversación directamente.

**Regla de dependencias (AD-1):** `presentation/` solo puede importar de `application/` y `domain/`. Los componentes reciben la interfaz del hook; no hacen `fetch` directamente ni acceden a env vars. No importar de `infrastructure/`.

**Tipos fijos del dominio:** `Message.role` es `'user' | 'assistant'` sin variantes adicionales. La UI depende de este tipo para la distinción visual (FR-3.3). El tipo `Message` viene de `src/modules/chat/domain/entities/message.ts`.

**Llamadas HTTP:** el hook llama siempre a `POST /api/chat`. Para iniciar o resetear conversación: `{ content: null, conversationId: null }`. Para enviar mensaje: `{ content: string, conversationId: string }`. Los tipos vienen de `ChatRequestDto` / `ChatResponseDto` en `application/dtos/`.

**Manejo de errores (AD-4):** el hook lee el campo `error` de la respuesta HTTP (`{ error: string }` con status 502 u otro 5xx) y lo expone como `error: string | null`. Los componentes renderizan ese string; no inspeccionan status codes.

**Sin persistencia (AD-6):** prohibido cualquier uso de `localStorage`, `sessionStorage`, cookies o `IndexedDB`. Todo en React state.

**Estilo:** Tailwind CSS ^4. Dark theme configurado en `globals.css` o `tailwind.config`; no hay modo claro. Usar breakpoints de Tailwind para responsive.

**Convenciones de nombrado:**
- Archivos: kebab-case (`chat-view.tsx`, `message-list.tsx`, `message-input.tsx`, `use-chat-session.ts`)
- Componentes y hooks: PascalCase / prefijo `use` (`ChatView`, `MessageList`, `MessageInput`, `useChatSession`)
- `src/app/page.tsx` renderiza únicamente `<ChatView />` sin lógica propia.

**Shared UI:** spinners u otros primitivos genéricos sin lógica de negocio van en `src/shared/ui/`.

## UX & Interaction Patterns

- **Layout fijo:** `ChatView` divide la pantalla en dos zonas: área de mensajes scrollable (crece con el contenido) e input fijo pegado al fondo.
- **Distinción de mensajes:** mensajes `role: 'user'` alineados a la derecha o con color diferente; mensajes `role: 'assistant'` alineados a la izquierda o fondo neutro.
- **Envío:** tecla Enter o botón de envío. El campo se vacía tras cada envío. Campo y botón deshabilitados mientras `isLoading` es `true`.
- **Indicador de carga:** spinner o puntos animados visibles dentro del área de mensajes (no bloquea el input area desde el punto de vista del layout, pero el campo está deshabilitado).
- **Error:** mensaje de error visible debajo de la lista de mensajes o como último item del hilo cuando `error !== null`.
- **Nueva conversación:** botón o acción accesible en la UI que llama a `startNewConversation()`; el historial queda vacío y la sesión inicia limpia.
- **App vacía inicial:** no hay requisito de mensaje de bienvenida (deferido en PRD); el área de mensajes puede estar vacía al inicio.

## Cross-Story Dependencies

- Story 3.1 depende de que el Route Handler `POST /api/chat` de Story 2.2 (Epic 2) esté operativo y devuelva los shapes de respuesta correctos (`{ conversationId }` y `{ content, conversationId }`).
- Story 3.2 depende de Story 3.1: `ChatView`, `MessageList` y `MessageInput` reciben la interfaz de `useChatSession`.
- Story 3.3 depende de Story 3.2: los estados visuales (loading, error, nueva conversación) se añaden sobre los componentes base de Story 3.2.
- El tipo `Message` del dominio (Story 1.2, Epic 1) es una dependencia directa de `useChatSession` y de `MessageList`.
- `FoundryConnectionError` → HTTP 502 del Route Handler (Epic 2) determina qué recibe el hook en el campo `error`; el hook no necesita conocer el tipo de error, solo el string del mensaje.
