# CineVault Frontend Foundation

CineVault is a premium entertainment tracking platform built with React, Vite, Tailwind CSS v4, TypeScript, and Supabase.

## Getting Started

### 1. Configure Supabase Environment Variables

Before launching the application, copy the example environment configuration file to `.env`:

```bash
cp .env.example .env
```

Open `.env` and fill in your Supabase connection parameters:

```env
# Required environment variables
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

*Note: The environment variables are verified at launch. If any variables are missing, the client will fail fast with a descriptive error.*

### 2. Install Dependencies

Install the required npm packages:

```bash
npm install
```

### 3. Run Locally

Start the Vite hot-reloading development server:

```bash
npm run dev
```

The application will launch on: [http://localhost:5173/](http://localhost:5173/)

### 4. Build & Lint

To build the static application bundle:

```bash
npm run build
```

To run syntax formatting and code style checks:

```bash
npm run lint
```
