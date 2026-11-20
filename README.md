# KYNE AERO.VISION

> Liquid-chrome sport sunglasses — Drop 01 cinematic 4-scene product launch.

AI Studio applet built with React 19, Vite, TypeScript, and Tailwind CSS, powered by the Gemini AI API.

## Tech stack

- [React 19](https://react.dev/) — UI framework
- [Vite](https://vitejs.dev/) — dev server & build tool
- [TypeScript](https://www.typescriptlang.org/) — type safety
- [Tailwind CSS v4](https://tailwindcss.com/) — styling
- [Motion](https://motion.dev/) — animations
- [Lucide React](https://lucide.dev/) — icons
- [Google Gen AI SDK](https://www.npmjs.com/package/@google/genai) — Gemini AI integration
- [Express](https://expressjs.com/) — server-side API routes

## Project structure

```
kyne_aero_vision/
├── .vscode/              # VS Code launch & debug configuration
├── src/                  # Application source
│   ├── main.tsx          # React entry point
│   ├── App.tsx           # Root component
│   ├── index.css         # Global styles / Tailwind directives
│   └── ...               # Components, assets, etc.
├── index.html            # HTML entry
├── vite.config.ts        # Vite configuration
├── tsconfig.json         # TypeScript configuration
├── package.json          # Dependencies & scripts
├── .env.example          # Environment variable template
├── metadata.json         # AI Studio applet metadata
└── README.md             # This file
```

## Getting started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

Copy the example env file and fill in your values:

```bash
cp .env.example .env
```

| Variable | Description |
|---|---|
| `GEMINI_API_KEY` | Gemini AI API key (required for AI features) |
| `APP_URL` | URL where the applet is hosted |

> AI Studio injects `GEMINI_API_KEY` and `APP_URL` automatically at runtime via the Secrets panel and Cloud Run service URL.

### 3. Run the development server

```bash
npm run dev
```

The app will be available at **http://localhost:3000**.

### 4. Build for production

```bash
npm run build
```

Output goes to `dist/`. Preview the production build locally with:

```bash
npm run preview
```

### Other scripts

| Script | Description |
|---|---|
| `npm run dev` | Start Vite dev server on port 3000 |
| `npm run build` | Build for production |
| `npm run preview` | Preview the production build |
| `npm run clean` | Remove `dist/` and `server.js` |
| `npm run lint` | Type-check with `tsc --noEmit` |

## Debugging

This repo includes a VS Code launch configuration (`.vscode/launch.json`) with configurations for:

- **Launch Chrome (Vite dev)** — launches Chrome against the dev server at `http://localhost:3000`
- **Attach to Chrome** — attaches to an already-running Chrome instance (remote debugging port 9222)
- **Launch Express server** — launches a Node/Express server (if `server.js` exists)

Open the **Run and Debug** view in VS Code and select a configuration, or press `F5`.

## License

Private — internal use only.
