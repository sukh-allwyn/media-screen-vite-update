# Legacy Screen Boilerplate (Vite + Retro-Browser Support)

A professional, high-performance scaffolding architecture for running classic, legacy browser screens alongside a modern Vite workflow. This boilerplate natively bridges the gap between old-school vanilla JS architectures and modern environment-driven pipelines without rewriting existing code patterns.

## 🚀 Core Features

- **True Legacy Compatibility:** Completely bypasses modern ES compilation and `type="module"` script syntax for specified subfolders, ensuring absolute security on ancient hardware or internet-explorer style runtimes.
- **Unified `.env` Processing:** Automates search-and-replace mechanics across multiple legacy subfolders dynamically. Write placeholders in your HTML/JS/CSS, and they automatically update with environment variables during development or compilation.
- **Dynamic Local Asset Streaming:** Includes a built-in lightweight local asset router middleware that allows images, fonts, and stylesheets to stream flawlessly during `npm run dev` without requiring asset relocation to the global `public/` directory.
- **Automated Directory Tracking:** Automatically detects any subfolder at the root layer containing an `index.html` file and registers it as an active legacy target.
- **Zero-Duplication Array Refactoring (DRY):** Configure infinite macro variables via a clean structural replacement mapping at the very top of your configuration file.

---

## 📂 Architecture Overview

```text
├── dev-tools/
│   └── master-panel.html    # Master development UI panels injected dynamically
├── dist/                    # Pure, compiled distribution output
├── folder-alpha/            # Legacy screen workspace alpha
│   └── index.html
├── jackpot/                 # Legacy jackpot screen workspace
│   ├── images/              # Screen-specific assets
│   ├── assets/
│   └── index.html           # Target file using raw variable placeholders
├── public/                  # Global shared assets
├── .env.development         # Local development configuration mappings
├── .env.production          # Production build configuration mappings
├── index.html               # Main root landing layout
├── package.json
└── vite.config.ts           # The orchestration core

## 🕹️ How to Access and View Legacy Screens

Because these legacy folders bypass standard modern single-page-application (SPA) routing frameworks, you must navigate directly to their explicit folder paths in your web browser during local development.

1. Run the local development server:
   ```bash
   npm run dev
   
2. Open your browser and navigate directly to the target folder subpath:

    Jackpot Screen: http://localhost:5173/jackpot/