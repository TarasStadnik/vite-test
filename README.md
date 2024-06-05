# Test Bank Accounts Management Application


## Overview

This application is designed to manage bank accounts, allowing users to create, edit, search, delete accounts, and perform fund transfers between them. It is built with React and TypeScript, featuring a mocked backend for local development.

## File Structure

```plaintext
src/
│
├── __mocks__         # Mocks for tests
│
├── __tests__         # Unit tests
│
├── api/              # API related files
│   ├── hooks/        # Hooks for tanstack/query
│   └── mockBackend.ts# Mocked backend
│
├── assets/           # Static assets (images, fonts, etc.)
│
├── components/       # React components
│   ├── ui/           # shadcn UI components
│   └── [other components]
│
├── types/            # TypeScript types
│   └── index.ts      # Types file
│
└── main.tsx         # Main entry point
```

## Scripts

- **dev**: Starts the development server using Vite.
- **build**: Compiles TypeScript and builds the project using Vite.
- **lint**: Runs ESLint with specified options to lint the codebase.
- **preview**: Previews the production build using Vite.
- **test**: Runs unit tests using Jest.

## Development

To start the development server, run:

```bash
npm run dev
```

## Building

To build the project for production, run:

```bash
npm run build
```

## Linting

To lint the codebase, run:

```bash
npm run lint
```

## Previewing

To preview the production build, run:

```bash
npm run preview
```

## Testing

To run the unit tests, run:

```bash
npm run test
```

## File Descriptions

- `src/__mocks__`: Contains mock data and functions for testing purposes.
- `src/__tests__`: Contains unit test files.
- `src/api/hooks`: Contains hooks for API interactions using TanStack Query.
- `src/api/mockBackend.ts`: Contains the mocked backend.
- `src/assets`: Contains static assets such as images and fonts.
- `src/components`: Contains React components.
    - `src/components/ui`: Contains shadcn UI components.
- `src/types/index.ts`: Contains TypeScript type definitions.
- `src/main.tsx`: The main entry point for the application.
