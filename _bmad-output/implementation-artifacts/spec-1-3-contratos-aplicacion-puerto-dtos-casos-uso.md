---
title: '1.3 — Contratos de aplicación: puerto, DTOs y casos de uso'
type: 'feature'
created: '2026-09-19'
status: 'done'
route: 'oneshot'
review_loop_iteration: 0
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problema:** La capa de aplicación no tiene interfaz de puerto, DTOs ni casos de uso; la capa de infraestructura (Epic 2) no tiene contrato contra el que implementar.

**Enfoque:** Crear `IAgentService` (puerto de salida), los DTOs de chat y los dos casos de uso que delegan al servicio mediante constructor injection. Ningún archivo de `application/` puede importar de `infrastructure/` ni de librerías externas.

**Tareas:**

1. `src/modules/chat/application/ports/i-agent-service.ts` — interfaz con firmas exactas:
   ```ts
   export interface IAgentService {
     startConversation(): Promise<string>;
     sendMessage(conversationId: string, content: string): Promise<string>;
   }
   ```

2. `src/modules/chat/application/dtos/chat.dto.ts` — DTOs de request y response:
   ```ts
   export interface ChatRequestDto {
     content: string | null;
     conversationId: string | null;
   }

   export interface ChatResponseDto {
     content: string;
     conversationId: string;
   }
   ```

3. `src/modules/chat/application/use-cases/start-conversation.use-case.ts`:
   ```ts
   export class StartConversationUseCase {
     constructor(private readonly agentService: IAgentService) {}
     async execute(): Promise<string> {
       return this.agentService.startConversation();
     }
   }
   ```

4. `src/modules/chat/application/use-cases/send-message.use-case.ts`:
   ```ts
   export class SendMessageUseCase {
     constructor(private readonly agentService: IAgentService) {}
     async execute(conversationId: string, content: string): Promise<string> {
       return this.agentService.sendMessage(conversationId, content);
     }
   }
   ```

**Done cuando:**
- Los cuatro archivos existen en las rutas indicadas.
- Ningún archivo en `application/` importa de `infrastructure/` ni de librerías externas (solo de `domain/` o dentro de `application/`).
- `npx tsc --noEmit` no reporta errores.

</frozen-after-approval>

## Implementation Notes

- `IAgentService`: interfaz pura, sin imports. Firmas exactas per AD-7.
- `ChatRequestDto`/`ChatResponseDto`: interfaces puras, sin imports. `content: string | null` y `conversationId: string | null` en request para soportar el flujo de inicio de conversación (ambos null) y el de envío de mensaje.
- `StartConversationUseCase` y `SendMessageUseCase`: único import es `IAgentService` desde `../ports/` (intra-application, no viola AD-1). Delegación directa al servicio.
- `npx tsc --noEmit` pasó sin errores.

## Review Triage Log

- `false` — "IAgentService devuelve strings crudos": AD-7 fija exactamente Promise<string>; contrato acordado en la architecture spine.
- `false` — "ChatRequestDto conflate dos casos": diseño intencional; null/null=inicio, string/string=envío; Route Handler discrimina en story 2.2.
- `false` — "StartConversationUseCase es thin passthrough": el AC dice "delegar la llamada"; valor en indirección para testing y extensión futura.
- `false` — "SendMessageUseCase no acepta ChatRequestDto": use cases operan sobre primitivos; DTOs son de transporte; Route Handler traduce.
- `false` — "sin manejo de errores en use cases": AD-4 designa al Route Handler como único punto de conversión HTTP; FoundryConnectionError se propaga intencionalmente.
- `defer` — "sin unit tests": framework de tests deferred en architecture spine; entrada ya existe en deferred-work.md.
- `false` — "sin barrel exports": architecture spine no los requiere; imports directos suficientes para módulo único.
- `low` — "IAgentService sin JSDoc": cosmético; contratos documentados en spec y spine. No añadido a deferred-work.
- `false` — "ChatResponseDto.content como string": text-only per PRD.
- `false` — "sin application/index.ts": mismo razonamiento que barrel exports.

## Review Findings

- [x] [Review][Defer] `ChatRequestDto.content: string | null` contradice la Consistency Conventions table del architecture spine (que define `content: string`) [src/modules/chat/application/dtos/chat.dto.ts:2] — deferred: código correcto per spec frozen con justificación explícita; el fix requiere actualizar la architecture spine (agent-context); registrado para sincronización futura.
- [x] [Review][Defer] `StartConversationUseCase.execute()` sin cobertura de test en el Route Handler — deferred: test runner explícitamente diferido en architecture spine.
- [x] [Review][Defer] `SendMessageUseCase.execute()` sin cobertura de test en el Route Handler — deferred: idem; regresión de orden de argumentos sería invisible sin tests.
- [x] [Review][Defer] Sin enforcement de import-boundary en `application/` (no hay regla ESLint `no-restricted-imports`) — deferred: requiere configuración del ESLint target; relacionado con tooling deferred.

**Rechazados:**
- `false` — `ChatResponseDto` orphan: Route Handler (story 2.2) lo consume; use cases retornan primitivos per AD-7; correcto.
- `false` — `StartConversationUseCase` pass-through sin valor: diseño intencional per spec triage log (indirección para testing y extensión).
- `false` — null states en `ChatRequestDto`: spec triage lo aceptó; Route Handler discrimina null/null vs string/string; estados mixtos inválidos rechazados en handler.
- `false` — null propagation en use cases: TypeScript strict mode previene null en `execute(conversationId: string, content: string)`; Route Handler valida antes de llamar.
- `false` — spec `status:done` vs sprint `review`: capas de tracking distintas.
- `low/reject` — no JSDoc en `IAgentService`: cosmético, ya triageado en spec.
- `reject` — JSDoc no en deferred-work: fix edita agent-context.
- `reject` — `tsc --noEmit` auto-asertado: process concern, fix requiere CI infra.
- `reject` — imports relativos vs alias: low, estilo; intra-capa es válido y no causa defectos.
