# Intro

# 100builds

Why the concept:

- Joined threads. Over time, i noticed many individuals like me, are building solutions to their own problems, successfully, and rapidly. In fact, more rapidly than ever possible, with the use of AI. I noticed, many of these tools will never be used by anyone other than their creators. Seeing people trying to market their tool is becoming more and more ignored. We’re entering that “so? I have my own tools” era, so standing out is hard

Why the name:

- I wanted something simple, short, and easy to remember. 100builds sparked, because my concept was to build an MVP model, essentially, create your listing and get a beautiful, shareworthy listing of your baby. At 100 listings (or customer shared builds), I would launch the directory. This name essentially describes my concept, while checking the boxes for short, memorable and brandable.

# Technical outline

\# 100builds MVP — Technical Brief (Next.js)

\#\# Overview  
\*\*100builds\*\* is a minimal platform where creators can list what they’re building — either for visibility or to find help.    
Each listing generates a clean, standalone project page that feels like a lightweight home page for the creation itself.

\*\*MVP Goals\*\*  
1\. Two entry options: “List for Visibility” or “List for Help”  
2\. Project submission form  
3\. Auto-generated public project page  
4\. Static export (no backend) for easy deployment to Cloudways or Vercel

\---

\#\# 1\. Tech Stack

\*\*Framework:\*\* Next.js (v14+)    
\*\*Styling:\*\* Tailwind CSS    
\*\*Language:\*\* TypeScript preferred    
\*\*Storage:\*\* JSON file (\`/data/projects.json\`) for MVP    
\*\*Deployment:\*\* Static export via \`next build && next export\`    
\*\*Optional:\*\* Switch to SQLite or Supabase in v2

\---

\#\# 2\. Page Structure

\#\#\# \`/pages/index.tsx\`  
\*\*Purpose:\*\* Entry landing page with two options.

\*\*Layout:\*\*  
\- Full viewport split screen (50/50)  
\- Left half: “List for Visibility”  
\- Right half: “List for Help”  
\- Hover states on each side (slight zoom/gradient shift)  
\- Central tagline:  
  \> “The internet’s project board — show what you’re building or find help to finish it.”

\*\*Links:\*\*  
\- “List for Visibility” → \`/new?mode=show\`  
\- “List for Help” → \`/new?mode=help\`

\---

\#\#\# \`/pages/new.tsx\`  
\*\*Purpose:\*\* Project submission form.

\*\*Required Fields\*\*  
\- \`projectName\` — text    
\- \`description\` — textarea    
\- \`avatar\` — file upload (200×200)    
\- \`tags\` — comma-separated (use custom TagInput component)    
\- \`category\` — dropdown: \`\["app", "tool", "content", "community", "ai", "other"\]\`    
\- \`mode\` — auto from query param    
\- \`links.site\` — optional URL    
\- If mode \= “help”:    
  \- \`needHelpWith\` — text or dropdown (\`design\`, \`development\`, \`marketing\`, \`funding\`, \`other\`)

\*\*UX Enhancements\*\*  
\- Live preview on the right (uses CardPreview component)  
\- Auto-slugify \`projectName\` → \`slug\`  
\- Simple success modal: “Your project page is live at /project/\[slug\]”  
\- Data saved to \`/data/projects.json\` (append)

\---

\#\#\# \`/pages/project/\[slug\].tsx\`  
\*\*Purpose:\*\* Public view of individual project.

\*\*Layout:\*\*  
\- Header: avatar (circle 200px), project name, badges (category, mode)  
\- Description block  
\- Optional “Need help with …” if mode \= help  
\- Links section (buttons for site, socials)  
\- Tags as rounded pills  
\- Footer: share link / copy to clipboard

\*\*Dynamic Data:\*\*  
\- Use \`getStaticPaths\` \+ \`getStaticProps\` to read from \`/data/projects.json\`  
\- Rebuild as static pages on deploy

\*\*Visuals:\*\*  
\- Subtle gradient background  
\- Large readable typography  
\- Minimal card aesthetic (dark surface \+ light text)

\---

\#\# 3\. Data Model

\*\*File:\*\* \`/data/projects.json\`

\`\`\`json  
\[  
  {  
    "id": "uuid",  
    "slug": "100builds",  
    "type": "help",  
    "name": "100builds",  
    "description": "A public board where makers share what they’re building.",  
    "avatar": "/uploads/100builds.png",  
    "tags": \["community", "makers"\],  
    "category": "web",  
    "needs": "marketing",  
    "links": {  
      "site": "https://100builds.app"  
    },  
    "date": "2025-11-12"  
  }  
\]  
\`\`\`

\*\*TypeScript Type\*\*  
\`\`\`ts  
type Project \= {  
  id: string;  
  slug: string;  
  type: "show" | "help";  
  name: string;  
  description: string;  
  avatar?: string;  
  tags?: string\[\];  
  category?: string;  
  needs?: string;  
  links?: { site?: string; github?: string; twitter?: string };  
  date: string;  
};  
\`\`\`

\---

\#\# 4\. Components

| Component | Purpose |  
|------------|----------|  
| \`FormField.tsx\` | Reusable text / textarea input |  
| \`TagInput.tsx\` | Tag entry with visual chips |  
| \`CardPreview.tsx\` | Live preview of the project card |  
| \`Badge.tsx\` | Category / type label |  
| \`ProjectCard.tsx\` | Used later for directory grid |  
| \`SubmitModal.tsx\` | Simple confirmation dialog |

\---

\#\# 5\. Design Language

\*\*Visual Style\*\*  
\- Dark background (\`bg-zinc-950\`)  
\- Clean sans typography  
\- Accent color (\`\#6366F1\`)  
\- Rounded corners (\`rounded-xl\`)  
\- Large spacing, minimal borders  
\- Focus on \*clarity and calm\*

\*\*Tone\*\*  
\> Simple. Honest. Builder-first.

\---

\#\# 6\. Deployment

\*\*MVP: Static Export\*\*  
\`\`\`  
next build && next export  
\`\`\`  
Outputs \`/out\` folder. Upload to Cloudways or any static host.

\*\*Later: Dynamic Version\*\*  
Switch to SSR or API routes once directory and search go live.

\---

\#\# 7\. Next Steps (Post-MVP)

1\. \`/explore\` — directory view with category filters    
2\. \`/api/new\` — move form submission to API endpoint    
3\. Stripe microtransactions — “bump” listing to top    
4\. User login (GitHub/Twitter OAuth)    
5\. Analytics \+ view counters  

\---

\#\# 8\. Developer Notes  
\- Use \`getStaticProps\` for static data load    
\- Ensure all pages are responsive (stacked on mobile)    
\- Placeholder avatars (use initials if none uploaded)    
\- Validate form client-side only (no backend)    
\- Keep component naming clean and self-contained

\---

\#\# 9\. Summary  
\*\*100builds MVP\*\* \=    
Minimal Next.js \+ Tailwind app with three core routes (\`index\`, \`new\`, \`project/\[slug\]\`)    
\+ one JSON data source.    
No database, no auth, no backend — just a clean proof of concept ready to grow once listings reach scale.

—

Additions/tweaks (consider these afterthoughts to further UX, brand or other element):  
**Progress counter on home:**

* Pull number of entries from `/data/projects.json`

* Display progress bar or text like

   “37 of 100 builds submitted.”

* Adds urgency and community feel.

**CTA copy:**

* Replace “List for Visibility” / “List for Help” with

   “Add your build” / “Find collaborators.”

* Feels more active and on-brand.

**Meta \+ OG tags:**

* Default title: `100builds — Built by you. Counted together.`

* Each project inherits: `ProjectName | 100builds`.

**Placeholder state:**

* Before 100 listings: show “Be one of the first 100.”

* After: trigger new landing or “Phase 2” messaging.

