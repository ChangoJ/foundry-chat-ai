---
title: foundry-chat-ai
status: final
created: 2026-09-19
updated: 2026-09-19
---

# foundry-chat-ai — PRD

## Visión

Una interfaz de chat minimalista y elegante que conecta con un agente de Azure AI Foundry para responder preguntas sobre programación e inteligencia artificial. Proyecto de práctica sin persistencia de datos — la conversación existe mientras la pestaña está abierta y desaparece al cerrarla.

## Objetivos

- Proveer una interfaz de chat funcional conectada a un agente de Azure AI Foundry preexistente.
- Delegar el mantenimiento del contexto de conversación al Foundry Agent Service; la app solo gestiona el `conversation_id` en sesión.
- No almacenar ningún dato del usuario ni historial fuera de la sesión activa.
- Seguir buenas prácticas de autenticación con `DefaultAzureCredential` y configuración vía variables de entorno.

## Fuera de alcance

- Autenticación de usuarios.
- Persistencia de conversaciones (base de datos, localStorage, cookies).
- Múltiples conversaciones simultáneas o historial entre sesiones.
- Administración del agente o su configuración desde la UI.
- Soporte multi-idioma de la interfaz.

---

## Features y Requisitos

### F1 — Chat en sesión

Interfaz de chat web respaldada por el **Foundry Agent Service (Conversations + Responses API)**. El servicio mantiene el contexto de la conversación; la app gestiona únicamente el `conversation_id` en estado local.

| ID | Requisito |
|----|-----------|
| FR-1.1 | El usuario puede enviar mensajes de texto al agente. |
| FR-1.2 | Las respuestas del agente se muestran en el mismo hilo de conversación. |
| FR-1.3 | Al iniciar la app se crea una nueva conversación en el servicio y se guarda el `conversation_id` en memoria. |
| FR-1.4 | Cada mensaje del usuario se envía al servicio junto con el `conversation_id`; la app no reenvía el historial completo. |
| FR-1.5 | Los mensajes del usuario y las respuestas del agente se acumulan en el estado de la UI exclusivamente para renderizado. |
| FR-1.6 | Al cerrar la pestaña o recargar la página, el `conversation_id` y el historial visual se pierden; no hay persistencia. |
| FR-1.7 | El usuario puede iniciar una nueva conversación: la app crea una nueva conversación en el servicio, recibe un nuevo `conversation_id`, y limpia el historial visual. |
| FR-1.8 | Mientras el agente está respondiendo se muestra un indicador de carga. |

### F2 — Integración con Azure AI Foundry

Conexión al agente preexistente (`lemon-agent-zmjwlxcpfk`) mediante el SDK oficial y autenticación sin secretos en el código.

| ID | Requisito |
|----|-----------|
| FR-2.1 | La aplicación se autentica contra Azure AI Foundry usando `DefaultAzureCredential`. |
| FR-2.2 | El endpoint de Foundry y el nombre del agente se configuran exclusivamente mediante variables de entorno. |
| FR-2.3 | No se almacenan credenciales ni secrets en el código fuente ni en archivos versionados. |
| FR-2.4 | La comunicación con el agente ocurre server-side (API route de Next.js); ninguna credencial se expone al cliente. |
| FR-2.5 | Los errores de conexión con Azure se manejan con un mensaje de error visible en la UI. |

### F3 — Interfaz de usuario

Diseño oscuro, minimalista y elegante. Sin elementos innecesarios.

| ID | Requisito |
|----|-----------|
| FR-3.1 | Tema oscuro como única opción visual. |
| FR-3.2 | Layout: área de mensajes scrollable con input de texto fijo en la parte inferior. |
| FR-3.3 | Los mensajes del usuario y del agente se distinguen visualmente (alineación o color). |
| FR-3.4 | La interfaz es responsive (funciona en desktop y móvil). |
| FR-3.5 | Sin barra de navegación, header complejo ni elementos decorativos — solo el chat. |

---

## Requisitos No Funcionales

| ID | Requisito |
|----|-----------|
| NFR-1 | El código sigue Clean Architecture para Next.js (skill `clean-architecture-nextjs`). |
| NFR-2 | TypeScript estricto siguiendo la skill `clean-code-typescript`. |
| NFR-3 | Toda configuración sensible (endpoints, nombres de agente) se gestiona exclusivamente con variables de entorno. |
| NFR-4 | Sin dependencias innecesarias — stack mínimo acorde a la naturaleza del proyecto. |

---

## Variables de entorno requeridas

| Variable | Descripción |
|----------|-------------|
| `AZURE_AI_FOUNDRY_ENDPOINT` | Endpoint del proyecto de Azure AI Foundry |
| `AZURE_AI_AGENT_NAME` | Nombre del agente en Foundry (`lemon-agent-zmjwlxcpfk`) |

> `DefaultAzureCredential` resuelve la identidad automáticamente: Azure CLI en local, Managed Identity en cloud. No requiere variable adicional.
> El modelo del agente (`gpt-5`) está configurado dentro de Foundry — la app no lo referencia.

---

## Criterios de éxito

- El usuario puede abrir la app, enviar mensajes sobre programación o IA y recibir respuestas del agente de Foundry.
- El contexto de la conversación se mantiene correctamente durante la sesión sin que la app reenvíe el historial.
- Al recargar la página, la conversación inicia limpia.
- Las credenciales no aparecen en el bundle del cliente ni en logs.

## Preguntas abiertas

| # | Pregunta | Estado |
|---|----------|--------|
| Q1 | ¿Se desea algún texto de bienvenida o placeholder en el chat vacío? | Deferido — no bloqueante |
