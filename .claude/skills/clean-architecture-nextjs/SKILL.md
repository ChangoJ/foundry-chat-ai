---
name: clean-architecture-nextjs
description: Usar al crear o modificar features, casos de uso, repositorios, entidades, componentes o server actions en este proyecto Next.js. Define la estructura de carpetas y la regla de dependencias de Clean Architecture.
---

# Clean Architecture en Next.js

## Estructura
src/
├── app/                      # Solo routing: page.tsx, layout.tsx, route.ts (delgado)
├── modules/
│   └── <feature>/
│       ├── domain/           # Entidades, value objects, interfaces de repositorio, errores
│       ├── application/      # Casos de uso, DTOs, puertos
│       ├── infrastructure/   # Implementaciones de repositorios, clientes API/DB, mappers
│       └── presentation/     # Componentes, hooks, server actions
├── shared/                   # Utilidades y UI genérica sin lógica de negocio
└── core/                     # Composición de dependencias (DI), config

## Regla de dependencias (obligatoria)
presentation -> application -> domain
infrastructure -> application/domain (implementa interfaces)
- `domain` NO importa nada de React, Next, ORM ni librerías externas.
- `application` solo depende de `domain`.
- Los componentes NUNCA llaman a fetch/DB directo: usan casos de uso.
- `app/` solo compone: llama a un caso de uso y renderiza.

## Al crear una feature
1. Definir entidad e interfaz de repositorio en `domain/`.
2. Escribir el caso de uso en `application/`.
3. Implementar el repositorio en `infrastructure/`.
4. Conectar dependencias en `core/`.
5. Exponer con server action o route handler y consumir desde `presentation/`.
6. Escribir tests del dominio y de los casos de uso (con repositorios fake).

## Prohibido
- Lógica de negocio en componentes o en `app/`.
- Importar `infrastructure` desde `domain` o `application`.
- Devolver modelos de DB/API directamente a la UI: mapear a entidades/DTOs.
