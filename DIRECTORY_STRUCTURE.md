Of course. Here is the updated `DIRECTORY_STRUCTURE.md` file, edited to accurately reflect your project's pivot to **CareerTwin**.

This version removes the old HR-focused routes and components and adds the new student-centric features like the analysis and roadmap pages.

-----

# CareerTwin Directory Structure

This document provides a detailed explanation of the project's directory structure to help developers navigate and contribute to the codebase.

## Top-Level Directories

  - **app/**: Next.js App Router routes and pages for the student journey
  - **components/**: Reusable UI components
  - **hooks/**: Custom React hooks
  - **lib/**: Utility functions and shared logic (e.g., authentication)
  - **public/**: Static assets (images, fonts, etc.)

## App Directory (Next.js App Router)

The `app/` directory follows the Next.js App Router convention, where each subdirectory becomes a route. The structure is now focused entirely on the student experience.

```
app/
├── globals.css           # Global styles
├── layout.tsx            # Root layout for all pages
├── page.tsx              # Homepage / Landing Page
├── about/                
│   └── page.tsx          # /about route
├── analyze/              # AI Skills Analysis feature
│   └── page.tsx          # /analyze route
├── dashboard/            # Main Student Dashboard
│   ├── page.tsx          # /dashboard route
│   └── settings/         # /dashboard/settings route
├── features/             
│   └── page.tsx          # /features route
├── how-it-works/         
│   └── page.tsx          # /how-it-works route
├── login/                
│   └── page.tsx          # /login route
├── pricing/              
│   └── page.tsx          # /pricing route
├── roadmap/              # Dynamic Career Roadmap feature
│   └── page.tsx          # /roadmap route
├── signup/               
│   └── page.tsx          # /signup route
└── take-interview/       # AI Mock Interview feature
    └── [id]/             # Dynamic route for specific interviews
        └── page.tsx      # /take-interview/[id] route
```

## Components Directory

The `components/` directory contains all reusable UI components.

```
components/
├── layout/               # Layout components
│   └── MainLayout.tsx    # Main authenticated layout
├── ui/                   # Core UI components (Shadcn/UI)
│   ├── button.tsx
│   ├── card.tsx
│   ├── dialog.tsx
│   ├── input.tsx
│   ├── loading-spinner.tsx
│   ├── textarea.tsx
│   └── ...
├── mode-toggle.tsx       # Theme toggle component
└── theme-provider.tsx    # Theme provider
```

## Hooks Directory

The `hooks/` directory contains custom React hooks.

```
hooks/
└── use-mobile.tsx        # Mobile detection hook
```

## Lib Directory

The `lib/` directory contains utilities and shared logic.

```
lib/
├── auth.ts               # Authentication logic (JWT, etc.)
└── utils.ts              # General utility functions
```

## Configuration Files

  - **package.json**: Dependencies and scripts
  - **next.config.mjs**: Next.js configuration
  - **tailwind.config.ts**: Tailwind CSS configuration
  - **postcss.config.mjs**: PostCSS configuration
  - **tsconfig.json**: TypeScript configuration
  - **components.json**: Shadcn UI components configuration
  - **.gitignore**: Git ignore patterns

## Additional Resources

For more information on the project architecture and goals, see the **README.md** file.
