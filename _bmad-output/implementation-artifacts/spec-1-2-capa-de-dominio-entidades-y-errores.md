---
title: '1.2 — Capa de dominio: entidades y errores'
type: 'feature'
created: '2026-09-19'
status: 'done'
route: 'oneshot'
review_loop_iteration: 0
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problema:** Los directorios `domain/entities/` y `domain/errors/` existen pero están vacíos; no hay entidades ni jerarquía de errores definidas.

**Enfoque:** Crear los tres archivos de la capa de dominio con sus tipos exactos. Ningún archivo de `domain/` puede importar React, Next.js ni librerías externas.

**Tareas:**

1. `src/modules/chat/domain/entities/message.ts` — exportar interfaz `Message`:
   ```ts
   export interface Message {
     id: string;
     role: 'user' | 'assistant';
     content: string;
     createdAt: Date;
   }
   ```

2. `src/modules/chat/domain/errors/app-error.ts` — exportar clase base:
   ```ts
   export class AppError extends Error {
     constructor(public readonly code: string, message: string) {
       super(message);
       this.name = this.constructor.name;
     }
   }
   ```

3. `src/modules/chat/domain/errors/foundry-connection-error.ts` — exportar error específico:
   ```ts
   export class FoundryConnectionError extends AppError {
     constructor(message = 'Error de conexión con Azure AI Foundry') {
       super('FOUNDRY_CONNECTION_ERROR', message);
     }
   }
   ```

**Done cuando:**
- Los tres archivos existen en las rutas indicadas.
- Ningún archivo en `domain/` tiene imports de React, Next.js ni librerías externas.
- `npx tsc --noEmit` no reporta errores.

</frozen-after-approval>

## Implementation Notes

- `message.ts`: interfaz pura, sin imports. `role` tipado como `'user' | 'assistant'` per invariante de la spine.
- `app-error.ts`: `name = this.constructor.name` para que el nombre de la clase aparezca correctamente en stack traces cuando se extiende.
- `foundry-connection-error.ts`: único import es `AppError` del mismo módulo (`domain/errors/`), no viola AD-1.
- `.gitkeep` en `domain/entities/` y `domain/errors/` quedan reemplazados por los archivos reales (git los sobrescribirá en el siguiente commit).
- `npx tsc --noEmit` pasó sin errores.

## Review Triage Log

- `false` — "Message sin conversationId": el conversationId vive en useChatSession (AD-5), no en la entidad.
- `false` — "role sin 'system'": la architecture spine fija 'user' | 'assistant' como invariante; variantes adicionales prohibidas.
- `false` — "content no multi-modal": fuera de alcance del PRD (solo texto).
- `false` — "sin updatedAt": no hay edición de mensajes; FR-1.6 los hace efímeros.
- `false` — "AppError sin Object.setPrototypeOf": target ES2017 emite clases nativas; el workaround es solo para ES5.
- `false` — "message no almacenado como propiedad tipada": Error.message heredado está disponible vía super(message).
- `low/defer` — "default message en español": cosmético en proyecto mono-idioma; entrada añadida a deferred-work.md.
- `low/defer` — "sin cause chaining": mejora válida para story 2.1 cuando FoundryConnectionError se lanza con contexto real de Azure; entrada añadida a deferred-work.md.
- `false` — "sin barrel index.ts": la spine no lo requiere; imports directos suficientes para módulo único.
- `false` — "Date no serializable a JSON": mensajes en React state únicamente (AD-6); nunca se serializan a storage.
