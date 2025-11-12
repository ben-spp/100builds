# 100builds

The internet's project board — show what you're building or find help to finish it.

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Storage:** JSON file (`/data/projects.json`)

## Features

### MVP (Current)

- ✅ Split-screen homepage with two entry modes
- ✅ Progress counter showing X of 100 builds
- ✅ Project submission form with live preview
- ✅ Auto-generated static project pages
- ✅ Light/Dark mode support with design tokens
- ✅ Stage 2 countdown messaging
- ✅ Responsive design (mobile-first)

### Routes

- `/` - Homepage with split-screen
- `/new?mode=show` - List for visibility
- `/new?mode=help` - List for help
- `/project/[slug]` - Individual project page

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Export static site
npm run export
```

Open [http://localhost:3000](http://localhost:3000)

## Design System

### Colors (CSS Custom Properties)

Light and dark mode ready via `.dark` class on `<html>`:

- `--color-primary` - Primary brand color (#6366f1)
- `--color-secondary` - Secondary accent (#8b5cf6)
- `--color-surface-0/1/2` - Background surfaces
- `--color-text-primary/secondary/muted` - Text hierarchy
- `--color-border` - Border colors

### Components

- `FormField` - Reusable text/textarea input
- `TagInput` - Tag entry with chips
- `CardPreview` - Live project preview
- `Badge` - Category/type labels
- `SubmitModal` - Success confirmation
- `ThemeToggle` - Light/dark mode switcher
- `Header` - Top navigation bar

## Data Model

Projects stored in `/data/projects.json`:

```ts
type Project = {
  id: string;
  slug: string;
  type: "show" | "help";
  name: string;
  description: string;
  avatar?: string;
  tags?: string[];
  category?: string;
  needs?: string;
  links?: {
    site?: string;
    github?: string;
    twitter?: string;
  };
  date: string;
}
```

## Next Steps (Post-MVP)

1. `/explore` - Directory view with filters
2. Search functionality
3. User authentication (GitHub/Twitter OAuth)
4. Stripe microtransactions for featured listings
5. Analytics & view counters
6. Switch from JSON to SQLite/Supabase

## Brand Integration

The "100" concept is woven throughout:

- Homepage progress counter
- "Build #X of 100" on submissions
- "Stage 2 unlocks in X more builds" messaging
- Each project labeled with its build number

---

Built with [Claude Code](https://claude.com/claude-code)
