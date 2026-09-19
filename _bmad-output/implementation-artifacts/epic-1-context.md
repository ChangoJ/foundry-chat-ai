# Epic 1 Context: Fundación del proyecto

<!-- Compiled from planning artifacts. Edit freely. Regenerate with compile-epic-context if planning docs change. -->

## Goal

Establecer la base estructural del proyecto: mover `app/` a `src/app/`, inicializar la estructura de directorios de Clean Architecture para el módulo `chat`, definir las entidades de dominio y los contratos de la capa de aplicación — todo sin dependencias externas en domain/application. Al finalizar, el proyecto compila sin errores y los epics 2 y 3 pueden construirse sobre esta base sin modificarla.

## Stories

- Story 1.1: Setup de estructura `src/` y configuración del proyecto
- Story 1.2: Capa de dominio — entidades y errores
- Story 1.3: Contratos de aplicación — puerto, DTOs y casos de uso

## Requirements & Constraints

- El alias `@/*` en `tsconfig.json` debe apuntar a `./src/*` (no `"./*"`).
- `next build` debe pasar sin errores tras el movimiento de `app/` a `src/app/`.
- `npx tsc --noEmit` no debe reportar errores en `domain/` ni en `application/`.
- `.env.example` documenta `AZURE_AI_FOUNDRY_ENDPOINT` y `AZURE_AI_AGENT_NAME` con valores de ejemplo (sin valores reales).
- `.gitignore` incluye `.env*.local`.
- Las dependencias `@azure/ai-projects` y `@azure/identity` se instalan con versiones verificadas en npm (no fijadas en la spine). Verificar disponibilidad antes de instalar.
- TypeScript con `strict: true`. Sin `any` implícito.
- Stack mínimo: no agregar dependencias innecesarias.

## Technical Decisions

**Estructura de directorios objetivo:**

```
src/
├── app/                              # movido desde app/ en raíz
├── modules/
│   └── chat/
│       ├── domain/
│       │   ├── entities/
│       │   └── errors/
│       ├── application/
│       │   ├── ports/
│       │   ├── dtos/
│       │   └── use-cases/
│       ├── infrastructure/           # vacío — se puebla en Epic 2
│       └── presentation/             # vacío — se puebla en Epic 3
├── shared/
│   └── ui/                          # vacío — se puebla en Epic 3
└── core/
    └── di/                          # vacío — se puebla en Epic 2
```

**Contratos fijos (no modificar en epics posteriores):**

- `Message`: `{ id: string; role: 'user' | 'assistant'; content: string; createdAt: Date }`
- `AppError extends Error`: propiedad `code: string`
- `FoundryConnectionError extends AppError`: `code = 'FOUNDRY_CONNECTION_ERROR'`
- `IAgentService`: `startConversation(): Promise<string>` · `sendMessage(conversationId: string, content: string): Promise<string>`
- `ChatRequestDto`: `{ content: string | null; conversationId: string | null }`
- `ChatResponseDto`: `{ content: string; conversationId: string }`

**Regla de dependencias (AD-1):**

- `domain/` no importa React, Next.js ni librerías externas.
- `application/` solo importa de `domain/`.
- Ninguna capa importa de `infrastructure/` hacia arriba.

**Naming:** kebab-case para archivos (`send-message.use-case.ts`), PascalCase para clases e interfaces, prefijo `I` para interfaces de puerto (`IAgentService`).

## Cross-Story Dependencies

- Story 1.2 depende del directorio `src/` creado en 1.1.
- Story 1.3 depende de `AppError` y `Message` definidos en 1.2.
- Epic 2 (Story 2.1) necesita `IAgentService` de 1.3 y la instalación de los SDKs de Azure de 1.1.
- Epic 2 (Story 2.2) necesita los casos de uso de 1.3.
