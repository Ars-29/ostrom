# O.Strom et Fils

Interactive React + Three.js experience (scenes, timeline, video intro, spatial audio and optimized 3D rendering) built with TypeScript & Vite.

## ✨ Highlights
- React 19 + Vite for instant HMR
- three.js via @react-three/fiber & helpers (@react-three/drei)
- Shaders imported with `vite-plugin-glsl`
- Animated camera rigs & spring physics (@react-spring/three)
- Post‑processing pipeline (@react-three/postprocessing)
- Optimized sprite / billboard components
- Video & audio assets (intro, ambient SFX, click)
- Performance stats & custom monitoring utilities

## 🧱 Tech Stack
React, TypeScript, Vite, Three.js, React Three Fiber, Drei, React Spring, Postprocessing, Framer Motion, Sass.

## 🚀 Quick Start
```bash
pnpm install   # or: npm install / yarn
pnpm dev       # start dev server
pnpm build     # type-check + production build
pnpm preview   # preview built assets
pnpm lint      # run ESLint
```
If you don't use pnpm, substitute with your package manager (`npm run dev`, etc.).

## 📂 Structure (selected)
```
src/
  components/        Reusable UI & 3D scene building blocks
  shaders/           GLSL fragment/vertex shaders (imported as strings)
  assets/            Static misc assets (React logo etc.)
  utils/, hooks/, contexts/  Support logic & shared state
public/              Static files served as-is (models, images, audio, video)
```

Notable components: camera rigs (`CameraRig`, `OptimizedCameraRig`), dynamic / optimized sprites, performance tools, intro / overlay UI pieces.

## 🖼 Assets & Shaders
- Add images / models / audio to `public/` to reference via absolute `/` paths.
- GLSL files in `shaders/` are auto-importable thanks to `vite-plugin-glsl`.
- Keep media optimized (WebP / compressed textures) to reduce GPU upload cost.

## 🧪 Development Tips
- Use `stats.js` overlay & custom performance monitor to spot spikes.
- Prefer instancing / sprites over many mesh copies when possible.
- Defer heavy loading behind suspense or intro video.
- Keep camera updates minimal (avoid per-frame allocations).

## 🛠 Linting & Type Safety
`eslint` + `typescript-eslint` + strict TS configs ensure safer refactors. Adjust rules in `eslint.config.js` if you need stricter or looser policies.

## 📦 Deployment
`pnpm build` (or equivalent) outputs to `dist/`. Serve that folder with any static host (Netlify, Vercel, nginx, etc.).
