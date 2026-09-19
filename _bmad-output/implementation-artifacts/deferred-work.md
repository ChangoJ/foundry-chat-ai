# Deferred Work

- source_spec: `_bmad-output/implementation-artifacts/spec-1-1-setup-estructura-src-configuracion-proyecto.md`
  summary: Agregar `"baseUrl": "."` a tsconfig.json al configurar el test runner
  evidence: Algunos test runners (Jest, Vitest) y herramientas de resolución de módulos requieren `baseUrl` junto con `paths`. Next.js con `moduleResolution: "bundler"` funciona sin él, pero puede generar fricción al añadir un framework de tests (actualmente deferred en la architecture spine).

- source_spec: `_bmad-output/implementation-artifacts/spec-1-1-setup-estructura-src-configuracion-proyecto.md`
  summary: Corregir script `lint` en package.json para apuntar a `src/` en lugar de ejecutar ESLint sin argumentos
  evidence: El script `"lint": "eslint"` es scaffold pre-existente. En ESLint v9, sin argumentos muestra la ayuda en lugar de lintear el código. No causado por story 1.1, pero debe corregirse antes de que lint sea parte de la verificación de CI.
