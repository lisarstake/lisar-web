## Lisa Frontend

Modern Vite + React + TypeScript frontend for Lisa, integrating backend APIs.

### Requirements
- Node 18+

### Getting Started
1. Copy env:
   - Create a `.env.local` with:
     ```
     VITE_API_BASE_URL=https://api.example.com
     ```
2. Install deps:
   ```bash
   npm install
   ```
3. Start dev server:
   ```bash
   npm run dev
   ```
4. Build & preview:
   ```bash
   npm run build && npm run preview
   ```

### Scripts
- dev: start Vite dev server
- build: production build
- preview: local preview
- lint: run ESLint
- format: run Prettier
- test: run unit tests

### Architecture
- `src/routes` router + route elements
- `src/screens` pages
- `src/lib` env + http client
- `src/store` Zustand app store
- `src/providers` React Query client
- `src/styles` global CSS


