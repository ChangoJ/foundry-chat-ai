---
stepsCompleted: [1, 2, 3, 4]
inputDocuments:
  - _bmad-output/planning-artifacts/prds/prd-foundry-chat-ai-2026-09-19/prd.md
  - _bmad-output/planning-artifacts/architecture/architecture-foundry-chat-ai-2026-09-19/ARCHITECTURE-SPINE.md
---

# foundry-chat-ai - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for foundry-chat-ai, decomposing the requirements from the PRD and Architecture Spine into implementable stories.

## Requirements Inventory

### Functional Requirements

FR-1.1: El usuario puede enviar mensajes de texto al agente.
FR-1.2: Las respuestas del agente se muestran en el mismo hilo de conversación.
FR-1.3: Al iniciar la app se crea una nueva conversación en el servicio y se guarda el conversationId en memoria.
FR-1.4: Cada mensaje del usuario se envía al servicio junto con el conversationId; la app no reenvía el historial completo.
FR-1.5: Los mensajes del usuario y las respuestas del agente se acumulan en el estado de la UI exclusivamente para renderizado.
FR-1.6: Al cerrar la pestaña o recargar la página, el conversationId y el historial visual se pierden; no hay persistencia.
FR-1.7: El usuario puede iniciar una nueva conversación: la app crea una nueva conversación en el servicio, recibe un nuevo conversationId, y limpia el historial visual.
FR-1.8: Mientras el agente está respondiendo se muestra un indicador de carga.
FR-2.1: La aplicación se autentica contra Azure AI Foundry usando DefaultAzureCredential.
FR-2.2: El endpoint de Foundry y el nombre del agente se configuran exclusivamente mediante variables de entorno.
FR-2.3: No se almacenan credenciales ni secrets en el código fuente ni en archivos versionados.
FR-2.4: La comunicación con el agente ocurre server-side (API route de Next.js); ninguna credencial se expone al cliente.
FR-2.5: Los errores de conexión con Azure se manejan con un mensaje de error visible en la UI.
FR-3.1: Tema oscuro como única opción visual.
FR-3.2: Layout — área de mensajes scrollable con input de texto fijo en la parte inferior.
FR-3.3: Los mensajes del usuario y del agente se distinguen visualmente (alineación o color).
FR-3.4: La interfaz es responsive (funciona en desktop y móvil).
FR-3.5: Sin barra de navegación, header complejo ni elementos decorativos — solo el chat.

### NonFunctional Requirements

NFR-1: El código sigue Clean Architecture para Next.js (skill clean-architecture-nextjs): domain → application → infrastructure/presentation, módulo único `chat`.
NFR-2: TypeScript estricto (strict: true) siguiendo la skill clean-code-typescript.
NFR-3: Toda configuración sensible (endpoints, nombres de agente) se gestiona exclusivamente con variables de entorno.
NFR-4: Sin dependencias innecesarias — stack mínimo acorde a la naturaleza del proyecto.

### Additional Requirements

- Setup: mover `app/` a `src/app/` y ajustar alias `@/*` en `tsconfig.json` de `./*` a `./src/*`.
- Instalar `@azure/ai-projects` y `@azure/identity` (verificar versiones actuales en npm antes de instalar).
- Crear la estructura de directorios `src/modules/chat/` con las cuatro capas: `domain/`, `application/`, `infrastructure/`, `presentation/`.
- Implementar composición de dependencias en `src/core/di/chat.container.ts`.
- Documentar variables de entorno requeridas en `.env.example`: `AZURE_AI_FOUNDRY_ENDPOINT`, `AZURE_AI_AGENT_NAME`.
- `IAgentService` con firmas fijas: `startConversation(): Promise<string>` y `sendMessage(conversationId, content): Promise<string>`.
- `Message.role` tipado como `'user' | 'assistant'` (invariante de la spine).
- `AppError` base en `domain/errors/` con `FoundryConnectionError` que la extiende.

### UX Design Requirements

N/A — no existe documento UX para este proyecto. Los requisitos visuales están cubiertos por FR-3.1–FR-3.5 (tema oscuro, layout de chat, distinción visual de mensajes, responsive, minimalismo).

### FR Coverage Map

FR-1.1: Epic 3 — Enviar mensajes desde UI (MessageInput + useChatSession.sendMessage)
FR-1.2: Epic 3 — Mostrar respuestas del agente en el hilo de conversación
FR-1.3: Epic 2 + 3 — Route Handler crea conversación; useChatSession la invoca al montar
FR-1.4: Epic 2 — Route Handler envía solo conversationId, no historial completo
FR-1.5: Epic 3 — useChatSession acumula mensajes en estado React para renderizado
FR-1.6: Epic 3 — Garantizado por React state (sin localStorage ni cookies)
FR-1.7: Epic 3 — Acción "nueva conversación" en useChatSession
FR-1.8: Epic 3 — isLoading en useChatSession; indicador visual en UI
FR-2.1: Epic 2 — DefaultAzureCredential en FoundryAgentService
FR-2.2: Epic 1 + 2 — .env.example documentado en Epic 1; leído en infrastructure en Epic 2
FR-2.3: Epic 1 — .env.example + entrada en .gitignore
FR-2.4: Epic 2 — Route Handler server-side; ningún env var de Azure en bundle cliente
FR-2.5: Epic 2 + 3 — FoundryConnectionError → HTTP 502 en Epic 2; UI muestra mensaje de error en Epic 3
FR-3.1: Epic 3 — Dark theme via Tailwind (globals.css o tailwind config)
FR-3.2: Epic 3 — Layout: área de mensajes scrollable + input fijo en bottom
FR-3.3: Epic 3 — Mensajes usuario vs agente distinguidos por alineación/color
FR-3.4: Epic 3 — Responsive via Tailwind breakpoints
FR-3.5: Epic 3 — Sin nav, sin header complejo; solo el área de chat
NFR-1: Epic 1 — Estructura de directorios Clean Architecture (src/modules/chat/...)
NFR-2: Epic 1 — tsconfig strict: true; clean-code-typescript aplicado
NFR-3: Epic 1 + 2 — .env.example; vars accedidas solo en infrastructure y app/api/
NFR-4: Epic 1 — Dependencias mínimas; solo las necesarias para el MVP

## Epic List

### Epic 1: Fundación del proyecto
El equipo puede levantar el proyecto localmente con la estructura de Clean Architecture lista, el dominio definido y los contratos de interfaz establecidos — base sobre la que se construyen los siguientes épicos sin modificarla.
**FRs cubiertos:** NFR-1, NFR-2, NFR-3, NFR-4, FR-2.2, FR-2.3

### Epic 2: Integración con Azure AI Foundry
La app puede crear una conversación y enviar/recibir mensajes con el agente de Azure server-side, verificable sin UI (via cliente HTTP) y con manejo de errores tipados.
**FRs cubiertos:** FR-2.1, FR-2.4, FR-2.5, FR-1.3, FR-1.4

### Epic 3: Interfaz de chat completa
El usuario puede abrir la app, mantener una conversación con el agente, ver el estado de carga, iniciar una nueva conversación y disfrutar de un diseño dark minimalista y responsive.
**FRs cubiertos:** FR-1.1, FR-1.2, FR-1.5, FR-1.6, FR-1.7, FR-1.8, FR-3.1, FR-3.2, FR-3.3, FR-3.4, FR-3.5

---

## Epic 1: Fundación del proyecto

El equipo puede levantar el proyecto localmente con la estructura de Clean Architecture lista, el dominio definido y los contratos de interfaz establecidos — base sobre la que se construyen los siguientes épicos sin modificarla.

### Story 1.1: Setup de estructura `src/` y configuración del proyecto

Como desarrollador,
quiero el proyecto migrado a `src/` con la estructura de directorios de Clean Architecture inicializada,
para poder implementar features en la estructura acordada sin conflictos de configuración.

**Acceptance Criteria:**

**Given** el proyecto tiene `app/` en la raíz y `tsconfig.json` tiene `"@/*": ["./*"]`
**When** se mueve `app/` a `src/app/`, se ajusta el alias `@/*` a `"./src/*"` en `tsconfig.json`, y se crean los directorios del módulo
**Then** existen `src/app/`, `src/modules/chat/{domain,application,infrastructure,presentation}/`, `src/shared/ui/`, `src/core/di/`
**And** `tsconfig.json` tiene `"@/*": ["./src/*"]`
**And** `next build` pasa sin errores tras el movimiento
**And** `.env.example` en la raíz documenta `AZURE_AI_FOUNDRY_ENDPOINT` y `AZURE_AI_AGENT_NAME` con valores de ejemplo (no reales)
**And** `.gitignore` incluye `.env*.local`
**And** `@azure/ai-projects` y `@azure/identity` están instalados (versiones verificadas en npm antes de instalar)

### Story 1.2: Capa de dominio — entidades y errores

Como desarrollador,
quiero las entidades del dominio y la jerarquía de errores definidas sin dependencias externas,
para poder expresar conceptos del negocio reutilizables en todas las capas.

**Acceptance Criteria:**

**Given** la estructura `src/` de Story 1.1
**When** se implementa la capa de dominio
**Then** `src/modules/chat/domain/entities/message.ts` exporta `Message { id: string; role: 'user' | 'assistant'; content: string; createdAt: Date }`
**And** `src/modules/chat/domain/errors/app-error.ts` exporta `AppError extends Error` con propiedad `code: string`
**And** `src/modules/chat/domain/errors/foundry-connection-error.ts` exporta `FoundryConnectionError extends AppError` con `code: 'FOUNDRY_CONNECTION_ERROR'`
**And** ningún archivo dentro de `domain/` importa React, Next.js ni ninguna librería externa
**And** `npx tsc --noEmit` no reporta errores en `domain/`

### Story 1.3: Contratos de aplicación — puerto, DTOs y casos de uso

Como desarrollador,
quiero `IAgentService`, los DTOs y los casos de uso implementados,
para que la capa de aplicación esté completa y lista para ser respaldada por una implementación de infraestructura real.

**Acceptance Criteria:**

**Given** la capa de dominio de Story 1.2
**When** se implementa la capa de aplicación
**Then** `src/modules/chat/application/ports/i-agent-service.ts` exporta `IAgentService` con firmas exactas: `startConversation(): Promise<string>` y `sendMessage(conversationId: string, content: string): Promise<string>`
**And** `src/modules/chat/application/dtos/chat.dto.ts` exporta `ChatRequestDto { content: string | null; conversationId: string | null }` y `ChatResponseDto { content: string; conversationId: string }`
**And** `StartConversationUseCase` y `SendMessageUseCase` en `use-cases/` aceptan `IAgentService` por constructor injection y delegan la llamada correspondiente
**And** ningún archivo en `application/` importa de `infrastructure/` ni de librerías externas (solo de `domain/`)
**And** `npx tsc --noEmit` no reporta errores en `application/`

---

## Epic 2: Integración con Azure AI Foundry

La app puede crear una conversación y enviar/recibir mensajes con el agente de Azure server-side, verificable sin UI (via cliente HTTP) y con manejo de errores tipados.

### Story 2.1: FoundryAgentService — implementación de la integración Azure

Como desarrollador,
quiero `FoundryAgentService` implementado con `@azure/ai-projects` y `DefaultAzureCredential`,
para que la app pueda autenticarse y comunicarse con el agente de Azure AI Foundry desde el servidor.

**Acceptance Criteria:**

**Given** `IAgentService` de Story 1.3 y las variables de entorno `AZURE_AI_FOUNDRY_ENDPOINT` y `AZURE_AI_AGENT_NAME` configuradas en `.env.local`
**When** se llama a `FoundryAgentService.startConversation()`
**Then** se autentica con `DefaultAzureCredential`, crea una nueva conversación en el Foundry Agent Service y retorna el `conversationId` como `string`
**And** cuando se llama a `FoundryAgentService.sendMessage(conversationId, content)`
**Then** envía el mensaje al agente con el `conversationId` (sin reenviar historial) y retorna el texto de respuesta del agente como `string`
**And** si la llamada a Azure falla por cualquier causa (red, auth, timeout)
**Then** lanza `FoundryConnectionError`
**And** `AZURE_AI_FOUNDRY_ENDPOINT` y `AZURE_AI_AGENT_NAME` se leen exclusivamente de `process.env`; ningún valor está hardcodeado
**And** el archivo vive en `src/modules/chat/infrastructure/foundry/foundry-agent.service.ts` e implementa `IAgentService`
**And** `npx tsc --noEmit` no reporta errores

### Story 2.2: DI container y Route Handler `POST /api/chat`

Como desarrollador,
quiero el container de dependencias configurado y el Route Handler `POST /api/chat` implementado,
para que la creación de conversación y el envío de mensajes sean accesibles via HTTP, server-side, con manejo de errores correcto.

**Acceptance Criteria:**

**Given** `FoundryAgentService` de Story 2.1 y los casos de uso de Story 1.3
**When** se crea `src/core/di/chat.container.ts`
**Then** exporta instancias de `StartConversationUseCase` y `SendMessageUseCase` ya conectadas a `FoundryAgentService`
**And** cuando `POST /api/chat` recibe `{ content: null, conversationId: null }`
**Then** llama a `StartConversationUseCase` y retorna `{ conversationId: string }` con status 200
**And** cuando `POST /api/chat` recibe `{ content: string, conversationId: string }`
**Then** llama a `SendMessageUseCase` y retorna `{ content: string, conversationId: string }` con status 200
**And** cuando se lanza `FoundryConnectionError`
**Then** el Route Handler retorna `{ error: string }` con status 502
**And** ninguna variable de entorno de Azure ni instancia de `DefaultAzureCredential` es referenciada en archivos importables desde el cliente
**And** `npx tsc --noEmit` no reporta errores

---

## Epic 3: Interfaz de chat completa

El usuario puede abrir la app, mantener una conversación con el agente, ver el estado de carga, iniciar una nueva conversación y disfrutar de un diseño dark minimalista y responsive.

### Story 3.1: Hook `useChatSession` — estado y lógica de conversación

Como desarrollador,
quiero el hook `useChatSession` gestionando todo el estado de conversación,
para que los componentes tengan una interfaz limpia sin manejar estado ni llamadas HTTP directamente.

**Acceptance Criteria:**

**Given** el Route Handler de Story 2.2
**When** `useChatSession` se monta en un componente React
**Then** llama a `POST /api/chat` con `{ content: null, conversationId: null }` al montar para inicializar la conversación y almacena el `conversationId` retornado en estado React (no en `localStorage`)
**And** expone `{ messages: Message[], sendMessage: (content: string) => Promise<void>, isLoading: boolean, error: string | null, startNewConversation: () => Promise<void> }`
**And** cuando se llama a `sendMessage(content)`
**Then** `isLoading` pasa a `true`, se llama a `POST /api/chat` con `{ content, conversationId }`, la respuesta del agente se agrega a `messages` y `isLoading` vuelve a `false`
**And** cuando la llamada falla
**Then** `error` toma el mensaje de error e `isLoading` vuelve a `false`
**And** cuando se llama a `startNewConversation()`
**Then** `messages` se resetea a `[]`, se llama a `POST /api/chat` con `{ content: null, conversationId: null }` y el nuevo `conversationId` reemplaza al anterior
**And** al cerrar o recargar la pestaña, `conversationId` y `messages` se pierden (estado React; cero persistencia)
**And** el hook vive en `src/modules/chat/presentation/hooks/use-chat-session.ts`
**And** `npx tsc --noEmit` no reporta errores

### Story 3.2: Componentes de chat — ChatView, MessageList, MessageInput

Como usuario,
quiero una interfaz de chat donde pueda ver la conversación y escribir mensajes,
para poder interactuar con el agente de IA.

**Acceptance Criteria:**

**Given** el hook `useChatSession` de Story 3.1
**When** se abre la app
**Then** `ChatView` renderiza un `MessageList` (área scrollable) y un `MessageInput` (fijo en la parte inferior)
**And** los mensajes del usuario (`role: 'user'`) se distinguen visualmente de los del agente (`role: 'assistant'`) por alineación o color
**And** `MessageInput` tiene un campo de texto y un botón de envío; el submit se dispara con la tecla Enter o el botón
**And** el campo de texto se vacía tras cada envío
**And** el campo y el botón están deshabilitados mientras `isLoading` es `true`
**And** `src/app/page.tsx` renderiza únicamente `ChatView` sin lógica propia
**And** `npx tsc --noEmit` no reporta errores

### Story 3.3: Diseño dark, responsive, estados visuales y nueva conversación

Como usuario,
quiero una interfaz dark pulida con feedback de carga, manejo de errores y la opción de iniciar una nueva conversación,
para poder usar la app cómodamente en cualquier dispositivo.

**Acceptance Criteria:**

**Given** los componentes de Story 3.2
**When** se renderiza la app
**Then** el fondo es oscuro y el texto claro (dark theme via Tailwind; sin modo claro)
**And** no hay barra de navegación, header ni elementos decorativos — solo el área de chat
**And** el layout es responsive: funciona en móvil (columna única, input accesible) y en desktop
**And** mientras `isLoading` es `true`, se muestra un indicador de carga visible (spinner o puntos animados) dentro del área de mensajes
**And** cuando `error` no es `null`, se muestra un mensaje de error visible en la UI (bajo la lista de mensajes o inline)
**And** hay un botón o acción de "Nueva conversación" accesible; al pulsarlo se llama a `startNewConversation()` y la UI queda limpia
**And** `next build` pasa sin errores ni warnings de TypeScript
