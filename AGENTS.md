<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Reglas del proyecto foundry-chat-ai

- Seguir Clean Architecture: ver skill `clean-architecture-nextjs`.
- Seguir la skill `clean-code-typescript`.
- Las specs de BMAD (PRD, arquitectura, épicas y stories) están en `_bmad-output/` y son la fuente de verdad. No implementar nada que las contradiga.
- Antes de dar una tarea por terminada: lint + build + tests pasando.
