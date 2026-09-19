# Deferred Work

- source_spec: `_bmad-output/implementation-artifacts/spec-2-2-di-container-route-handler-post-api-chat.md`
  summary: Mejorar el guard de init() en chat.container.ts para verificar ambas variables (!startUseCase || !sendUseCase)
  evidence: El guard actual solo chequea startUseCase; sendUseCase se asigna en el mismo bloque así que no es un bug real, pero verificar ambas hace la invariante más explícita y robusta ante futuros cambios al container.

- source_spec: `_bmad-output/implementation-artifacts/spec-1-2-capa-de-dominio-entidades-y-errores.md`
  summary: Agregar soporte `cause` a AppError/FoundryConnectionError para preservar el stack trace del error original de Azure
  evidence: Sin `cause`, los errores de red o auth de Azure que envuelve FoundryConnectionError pierden su stack trace original. El momento correcto es story 2.1, cuando el error se lanza con contexto real del SDK.

- source_spec: `_bmad-output/implementation-artifacts/spec-1-2-capa-de-dominio-entidades-y-errores.md`
  summary: Evaluar si el mensaje default de FoundryConnectionError debería ser en inglés o usarse como clave de traducción
  evidence: El dominio idealmente es locale-agnostic. Para este proyecto de práctica mono-idioma no es un bug, pero si se internacionaliza en el futuro, el string en español hardcodeado en domain/ sería el lugar incorrecto.

## Deferred from: code review of spec-2-2 (2026-09-19)

- source_spec: `_bmad-output/implementation-artifacts/spec-2-2-di-container-route-handler-post-api-chat.md`
  summary: Actualizar el frozen block del spec 2.2 para reflejar el patrón lazy-init real
  evidence: El frozen block muestra const singletons a nivel de módulo, pero la implementación usa lazy-init (funciones getStart/getSendMessageUseCase) para evitar que FoundryAgentService se instancie en build time. La desviación es técnicamente correcta y está documentada en Implementation Notes, pero el frozen block queda desactualizado. Requiere renegociación con el autor de la spec.

- source_spec: `_bmad-output/implementation-artifacts/spec-2-2-di-container-route-handler-post-api-chat.md`
  summary: Agregar tests para el Route Handler POST /api/chat (todas las ramas)
  evidence: Las ramas start-conversation (200), send-message (200), body inválido (400), FoundryConnectionError (502), y error genérico (500) no tienen cobertura. useChatSession depende del contrato de respuesta del handler; una regresión en shape de respuesta sería invisible. Cerrar al configurar el test runner.

## Deferred from: code review of spec-2-1 (2026-09-19)

- source_spec: `_bmad-output/implementation-artifacts/spec-2-1-foundryagentservice-integracion-azure.md`
  summary: Agregar tests para FoundryAgentService (startConversation y sendMessage)
  evidence: Los SDK call paths de Azure (conversations.create, conversations.items.create, responses.create) y la conversión a FoundryConnectionError no tienen cobertura. Una regresión en el campo retornado (conversation.id, response.output_text) o en la secuencia de llamadas sería invisible. Cerrar al configurar el test runner.

## Deferred from: code review of spec-1-3 (2026-09-19)

- source_spec: `_bmad-output/implementation-artifacts/spec-1-3-contratos-aplicacion-puerto-dtos-casos-uso.md`
  summary: Sincronizar `ChatRequestDto.content` con la Consistency Conventions table del architecture spine
  evidence: La spec frozen define `content: string | null` (para soportar null/null=inicio de conversación) pero el architecture spine tiene `content: string`. La implementación es correcta per spec; el spine necesita actualización para reflejar la decisión tomada.

- source_spec: `_bmad-output/implementation-artifacts/spec-1-3-contratos-aplicacion-puerto-dtos-casos-uso.md`
  summary: Agregar tests para StartConversationUseCase y SendMessageUseCase al configurar el test runner
  evidence: Ambos use cases son consumidos por el Route Handler sin ningún test. Una regresión de delegación (ej. argumentos en orden incorrecto en SendMessageUseCase) sería invisible. Cerrar cuando se configure el framework de tests.

- source_spec: `_bmad-output/implementation-artifacts/spec-1-3-contratos-aplicacion-puerto-dtos-casos-uso.md`
  summary: Agregar regla ESLint `no-restricted-imports` para enforcement de import-boundary en `application/`
  evidence: El constraint "ningún archivo de application/ importa de infrastructure/ ni librerías externas" se cumple hoy pero no está mecanicamente enforced. Una regla ESLint evitaría violaciones futuras. Relacionado con el fix pendiente del lint script.

## Deferred from: code review of spec-1-2 (2026-09-19)

- source_spec: `_bmad-output/implementation-artifacts/spec-1-2-capa-de-dominio-entidades-y-errores.md`
  summary: Agregar test para el path 502 del Route Handler (instanceof FoundryConnectionError)
  evidence: La guarda `instanceof FoundryConnectionError` en route.ts:31 produce la respuesta 502. Sin test, cualquier regresión en la jerarquía de errores (ej. FoundryConnectionError deja de extender AppError) sería invisible y el handler retornaría 500 en su lugar.

- source_spec: `_bmad-output/implementation-artifacts/spec-1-2-capa-de-dominio-entidades-y-errores.md`
  summary: Agregar test para la lógica role-based layout de MessageList (justify-end/justify-start)
  evidence: MessageList brancha en `message.role === 'user'` para aplicar alineación. Sin test, un mismatch entre el role asignado en useChatSession y el esperado por MessageList produciría bugs visuales silenciosos.

## Deferred from: code review of spec-1-1 (2026-09-19)

- source_spec: `_bmad-output/implementation-artifacts/spec-1-1-setup-estructura-src-configuracion-proyecto.md`
  summary: Agregar campo `engines` a `package.json` con `"node": ">=22.0.0"`
  evidence: Los paquetes del Azure SDK declaran `engines: >=22.0.0` en sus package.json, pero el root `package.json` no tiene campo `engines`. Desarrolladores usando Node 18 o 20 LTS no reciben advertencia en install time sobre la incompatibilidad. El fix es una adición de una línea.

- source_spec: `_bmad-output/implementation-artifacts/spec-1-1-setup-estructura-src-configuracion-proyecto.md`
  summary: Documentar dependencias transitivas significativas de `@azure/ai-projects` en la architecture spine o en los implementation notes
  evidence: `@azure/ai-projects` arrastra `openai@6.49.0` (SDK completo, no-opcional) y `@azure/storage-blob` como deps de producción transitivas. Esto no viola directamente el constraint "stack mínimo" (son deps del SDK elegido, no installs directos), pero debería registrarse como contexto arquitectónico para evaluaciones futuras de alternativas más ligeras.

- source_spec: `_bmad-output/implementation-artifacts/spec-1-1-setup-estructura-src-configuracion-proyecto.md`
  summary: Agregar `"baseUrl": "."` a tsconfig.json al configurar el test runner
  evidence: Algunos test runners (Jest, Vitest) y herramientas de resolución de módulos requieren `baseUrl` junto con `paths`. Next.js con `moduleResolution: "bundler"` funciona sin él, pero puede generar fricción al añadir un framework de tests (actualmente deferred en la architecture spine).

- source_spec: `_bmad-output/implementation-artifacts/spec-1-1-setup-estructura-src-configuracion-proyecto.md`
  summary: Corregir script `lint` en package.json para apuntar a `src/` en lugar de ejecutar ESLint sin argumentos
  evidence: El script `"lint": "eslint"` es scaffold pre-existente. En ESLint v9, sin argumentos muestra la ayuda en lugar de lintear el código. No causado por story 1.1, pero debe corregirse antes de que lint sea parte de la verificación de CI.

## Deferred from: code review of spec-3-1 (2026-09-19)

- source_spec: `_bmad-output/implementation-artifacts/spec-3-1-hook-usechatsession-estado-y-lógica-de-conversación.md`
  summary: Añadir AbortController al fetch de inicialización en useChatSession para cancelar peticiones en-vuelo al desmontar el componente
  evidence: El flag `cancelled` evita actualizaciones de estado tras unmount pero no cancela la petición HTTP; el servidor crea la conversación igualmente y queda huérfana. Mejora de robustez, no en scope de story 3.1.

- source_spec: `_bmad-output/implementation-artifacts/spec-3-1-hook-usechatsession-estado-y-lógica-de-conversación.md`
  summary: Normalizar los mensajes de error de useChatSession a un idioma consistente (español o inglés)
  evidence: El hook genera strings en español para errores de red locales pero reenvía strings en inglés del route handler (ej. 'Internal server error'). El resultado en la UI mezcla idiomas según el origen del error. Fuera de scope de story 3.1 (requiere decisión de i18n y posiblemente ajustes al route handler).

- source_spec: `_bmad-output/implementation-artifacts/spec-3-1-hook-usechatsession-estado-y-lógica-de-conversación.md`
  summary: sendMessage retorna silenciosamente cuando conversationId es null tras un init fallido sin informar al usuario
  evidence: Tras un init fallido, isLoading vuelve a false y el input queda habilitado. Si el usuario escribe y envía, sendMessage ejecuta `if (!conversationId) return` sin setear error. El usuario ve el campo vaciarse sin respuesta ni mensaje de error nuevo. Mejora: setear error descriptivo en el guard o deshabilitar el input cuando conversationId es null.

- source_spec: `_bmad-output/implementation-artifacts/spec-3-1-hook-usechatsession-estado-y-lógica-de-conversación.md`
  summary: Agregar tests unitarios para useChatSession (initSession, sendMessage, startNewConversation)
  evidence: Los paths de error (init 500, sendMessage fallo de red, startNewConversation fallo) y los paths happy (init 200, sendMessage 200) no tienen cobertura. Cerrar al configurar el test runner.

## Deferred from: code review of spec-3-3 (2026-09-19)

- source_spec: `_bmad-output/implementation-artifacts/spec-3-3-diseño-dark-responsive-estados-visuales-y-nueva-conversación.md`
  summary: Reemplazar animationDelay inline en puntos de carga por keyframe personalizado o clases Tailwind delay-* explícitas
  evidence: El efecto escalonado actual usa negative animation-delay vía inline style sobre animate-bounce; funciona en navegadores modernos pero es frágil si Tailwind cambia el shorthand de animate-bounce en versiones futuras. Una @keyframes personalizada en globals.css sería más robusta y eliminaría el inline style.

- source_spec: `_bmad-output/implementation-artifacts/spec-3-3-diseño-dark-responsive-estados-visuales-y-nueva-conversación.md`
  summary: Agregar aria-live="polite" al contenedor de los puntos de carga en MessageList
  evidence: Los tres puntos de carga aparecen y desaparecen sin anuncio para lectores de pantalla. role="alert" fue añadido al div de error, pero el indicador de loading no tiene región aria-live; usuarios con accesibilidad visual no reciben feedback mientras el agente responde.
