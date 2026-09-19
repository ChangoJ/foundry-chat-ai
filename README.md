# foundry-chat-ai

Aplicación de chat con IA construida sobre **Azure AI Foundry** y **Next.js**. Implementa Clean Architecture por módulos: cada capa tiene responsabilidad única y las dependencias solo apuntan hacia adentro (presentación → aplicación → dominio).

---

## Tecnologías

| Categoría | Tecnología | Versión |
|---|---|---|
| Framework | Next.js (App Router) | 16.3.5 |
| UI | React | 19.2.8 |
| Lenguaje | TypeScript | ^5 |
| Estilos | Tailwind CSS | ^4 |
| IA / Azure | @azure/ai-projects | ^2.7.0 |
| Auth Azure | @azure/identity | ^4 |
| Linting | ESLint + eslint-config-next | ^9 |
| Runtime | Node.js | >=22.0.0 |

---

## Requisitos previos

1. **Node.js >= 22** — el Azure SDK lo requiere explícitamente.
2. **Cuenta de Azure** con un proyecto de Azure AI Foundry creado y un agente desplegado.
3. **Azure CLI** instalado y sesión activa (`az login`), o credenciales configuradas vía variables de entorno para `DefaultAzureCredential`.

### Instalar Azure CLI (si no lo tienes)

```bash
# Windows (winget)
winget install Microsoft.AzureCLI

# Iniciar sesión
az login
```

`DefaultAzureCredential` intenta autenticarse en este orden: Azure CLI → Managed Identity → variables de entorno → otros. En desarrollo local, `az login` es suficiente.

---

## Configuración

### 1. Instalar dependencias

```bash
npm install
```

### 2. Variables de entorno

Copia el archivo de ejemplo y rellena tus valores:

```bash
cp .env.example .env.local
```

Edita `.env.local`:

```env
# URL del endpoint de tu proyecto en Azure AI Foundry
# Formato: https://<hub>.services.ai.azure.com/api/projects/<project>
AZURE_AI_FOUNDRY_ENDPOINT=https://<tu-endpoint>.services.ai.azure.com/api/projects/<tu-proyecto>

# Nombre del agente desplegado en ese proyecto
AZURE_AI_AGENT_NAME=<nombre-de-tu-agente>
```

> **Dónde encontrar estos valores:**
> - En [Azure AI Foundry Studio](https://ai.azure.com) → tu proyecto → Overview → copia el "Project endpoint".
> - El nombre del agente es el que asignaste al crearlo en la sección "Agents" del studio.

### 3. Levantar el servidor de desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en el navegador.

---

## Scripts disponibles

| Comando | Descripción |
|---|---|
| `npm run dev` | Servidor de desarrollo con hot reload |
| `npm run build` | Build de producción |
| `npm start` | Servidor de producción (requiere build previo) |
| `npm run lint` | Linting con ESLint |

---

## Estructura del proyecto

```
src/
├── app/                        # Next.js App Router — routing y composición
│   ├── api/chat/route.ts       # Route Handler POST /api/chat
│   └── page.tsx                # Página principal
│
├── core/
│   └── di/chat.container.ts    # Contenedor de inyección de dependencias
│
└── modules/
    └── chat/
        ├── domain/             # Entidades, errores (sin dependencias externas)
        ├── application/        # Casos de uso, DTOs, puertos (interfaces)
        ├── infrastructure/     # FoundryAgentService — integración Azure SDK
        └── presentation/       # Componentes React, hook useChatSession
```

La regla de dependencias es la única invariante arquitectónica:

```
presentation → application → domain
infrastructure → application / domain
app/ → application  (solo composición)
```

Ninguna capa importa hacia afuera. `domain/` no importa React, Next.js ni SDKs externos.

---

## Solución de problemas

### `AZURE_AI_FOUNDRY_ENDPOINT is not set`
El servidor arrancó sin las variables de entorno. Verifica que `.env.local` existe y tiene los valores correctos.

### `DefaultAzureCredential: no credentials found`
No hay sesión de Azure activa. Ejecuta `az login` y vuelve a intentarlo.

### Error 502 en el chat
El agente de Azure no respondió. Verifica que el agente `AZURE_AI_AGENT_NAME` existe y está desplegado en el proyecto indicado por `AZURE_AI_FOUNDRY_ENDPOINT`.

### Node version mismatch
Este proyecto requiere Node.js >= 22. Verifica con `node --version` y actualiza si es necesario.
