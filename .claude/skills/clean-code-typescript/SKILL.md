---
name: clean-code-typescript
description: Usar al escribir o revisar cualquier código TypeScript/React en este proyecto: nombres, funciones, tipos, manejo de errores, tests y refactors.
---

# Código limpio (TypeScript / React)

- Nombres que revelan intención; sin abreviaturas crípticas.
- Funciones pequeñas con una sola responsabilidad; máximo ~3 parámetros (usar objeto si hay más).
- Sin `any`: usar `unknown` + narrowing. `strict: true` siempre.
- Composición sobre herencia; inmutabilidad por defecto.
- Errores de dominio tipados, no `throw new Error("...")` genérico.
- Sin números ni strings mágicos: constantes con nombre.
- Comentarios solo para el "por qué", no para el "qué".
- Componentes React pequeños y presentacionales; la lógica va en hooks o casos de uso.
- SOLID y DRY, sin abstraer prematuramente.
- Cada cambio de comportamiento lleva test.
- Antes de terminar: `npm run lint` y `npm run build` deben pasar.
